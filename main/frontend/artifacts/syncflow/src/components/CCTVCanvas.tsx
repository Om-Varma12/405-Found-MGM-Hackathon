import { useEffect, useRef } from "react";
import { CCTVStatus, Direction, SignalColor } from "../types";
import { FACING_LABEL } from "../simulation";

interface CCTVCanvasProps {
  status: CCTVStatus;
  vehicleCount: number;
  ambulanceDetected: boolean;
  isSignalFault: boolean;
  isCameraGlitch: boolean;
  cctvId: string;
  direction: Direction;
  signalColor: SignalColor;
}

interface Vehicle {
  lane: 0 | 1; // 0 = from intersection toward camera (grows). 1 = toward intersection (shrinks)
  t: number;   // 0=far/VP  1=near/camera
  speed: number;
  type: "sedan" | "suv" | "truck" | "auto";
  color: string;
  pullAside: number; // extra leftward offset when ambulance is ahead (lane 0)
}

const COLORS = ["#c03030","#2255bb","#22883a","#bb7711","#552299","#aa2277","#228899","#448822"];
const VW: Record<string, number> = { sedan:34, suv:40, truck:44, auto:22 };
const VH: Record<string, number> = { sedan:15, suv:19, truck:22, auto:14 };
const VS: Record<string, number> = { sedan:0.0028, suv:0.0022, truck:0.0017, auto:0.0034 };
const VTYPES = ["sedan","sedan","suv","truck","auto"] as const;

function newVehicle(lane: 0 | 1, mult: number): Vehicle {
  const type = VTYPES[Math.floor(Math.random() * VTYPES.length)];
  return { lane, t: lane === 0 ? 0 : 1, speed: VS[type] * (0.75 + Math.random() * 0.5) * mult, type, color: COLORS[Math.floor(Math.random() * COLORS.length)], pullAside: 0 };
}

export function CCTVCanvas({ status, vehicleCount, ambulanceDetected, isSignalFault, isCameraGlitch, cctvId, direction, signalColor }: CCTVCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vsRef = useRef<Vehicle[]>([]);
  const winsRef = useRef<boolean[]>([]);
  const ambRef = useRef({ t:0, active:false, triggered:false, flash:0, overlay:0, timer:0 });
  const fRef = useRef(0);
  const pRef = useRef({ status, vehicleCount, ambulanceDetected, isSignalFault, isCameraGlitch, signalColor, direction, cctvId });

  useEffect(() => { pRef.current = { status, vehicleCount, ambulanceDetected, isSignalFault, isCameraGlitch, signalColor, direction, cctvId }; });
  if (winsRef.current.length === 0) winsRef.current = Array.from({ length: 48 }, () => Math.random() > 0.38);

  useEffect(() => {
    const el = containerRef.current, cv = canvasRef.current;
    if (!el || !cv) return;
    const setSize = () => { cv.width = el.clientWidth || 280; cv.height = el.clientHeight || 170; };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(el);
    let id: number;

    const draw = () => {
      id = requestAnimationFrame(draw);
      fRef.current++;
      const f = fRef.current;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const W = cv.width, H = cv.height;
      if (W < 10 || H < 10) return;
      const p = pRef.current;
      const VP = { x: W * .5, y: H * .28 };

      // Perspective projection: worldX in road-space (-1..1), t in depth (0=far, 1=near)
      const proj = (wx: number, t: number) => ({ x: VP.x + wx * t * W * .46, y: VP.y + t * (H - VP.y) });

      // --- BACKGROUND ---
      ctx.fillStyle = "#06090f"; ctx.fillRect(0, 0, W, H);
      const sg = ctx.createLinearGradient(0,0,0,VP.y); sg.addColorStop(0,"#07101a"); sg.addColorStop(1,"#0e1829");
      ctx.fillStyle = sg; ctx.fillRect(W*.15, 0, W*.70, VP.y + 2);

      // Left building block + perspective face
      ctx.fillStyle = "#0f1114"; ctx.fillRect(0, 0, W*.17, H);
      ctx.fillStyle = "#121417";
      ctx.beginPath(); ctx.moveTo(W*.17,0); ctx.lineTo(proj(-.5,0).x,VP.y); ctx.lineTo(proj(-.5,1).x,H); ctx.lineTo(W*.17,H); ctx.closePath(); ctx.fill();

      // Right building block + perspective face
      ctx.fillStyle = "#0f1114"; ctx.fillRect(W*.83, 0, W*.17, H);
      ctx.fillStyle = "#121417";
      ctx.beginPath(); ctx.moveTo(W*.83,0); ctx.lineTo(proj(.5,0).x,VP.y); ctx.lineTo(proj(.5,1).x,H); ctx.lineTo(W*.83,H); ctx.closePath(); ctx.fill();

      // Windows
      drawWindows(ctx,W,H,0,winsRef.current,f);
      drawWindows(ctx,W,H,1,winsRef.current,f);

      // Road
      const rg = ctx.createLinearGradient(0,VP.y,0,H); rg.addColorStop(0,"#1a1a1e"); rg.addColorStop(1,"#181818");
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.moveTo(proj(-.5,0).x,VP.y); ctx.lineTo(proj(.5,0).x,VP.y); ctx.lineTo(proj(.5,1).x,H); ctx.lineTo(proj(-.5,1).x,H); ctx.closePath(); ctx.fill();

      // Left footpath
      ctx.fillStyle = "#1c1d22";
      ctx.beginPath(); ctx.moveTo(W*.17,VP.y); ctx.lineTo(proj(-.5,0).x,VP.y); ctx.lineTo(proj(-.5,1).x,H); ctx.lineTo(W*.17,H); ctx.closePath(); ctx.fill();

      // Right footpath
      ctx.beginPath(); ctx.moveTo(proj(.5,0).x,VP.y); ctx.lineTo(W*.83,VP.y); ctx.lineTo(W*.83,H); ctx.lineTo(proj(.5,1).x,H); ctx.closePath(); ctx.fill();

      // Kerb lines
      ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(proj(-.5,0).x,VP.y); ctx.lineTo(proj(-.5,1).x,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(proj(.5,0).x,VP.y); ctx.lineTo(proj(.5,1).x,H); ctx.stroke();

      // --- ROAD MARKINGS ---
      ctx.strokeStyle = "rgba(255,255,255,.48)"; ctx.lineWidth = Math.max(1,W*.004);
      ctx.setLineDash([9,13]); ctx.lineDashOffset = -(f*1.5)%22;
      ctx.beginPath(); ctx.moveTo(VP.x,VP.y); ctx.lineTo(VP.x,H); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;

      ctx.strokeStyle = "rgba(255,255,255,.04)"; ctx.lineWidth = 1;
      for (let ti=.1; ti<1; ti+=.13) { const l=proj(-.5,ti),r=proj(.5,ti); ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(r.x,r.y); ctx.stroke(); }

      // Stop line
      const sL=proj(-.5,.08), sR=proj(.5,.08);
      ctx.strokeStyle="rgba(255,255,255,.7)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sL.x,sL.y); ctx.lineTo(sR.x,sR.y); ctx.stroke();

      // Zebra crossing
      ctx.strokeStyle="rgba(255,255,255,.18)"; ctx.lineWidth=2;
      for (let si=0; si<5; si++) { const zt=.13+si*.012,zl=proj(-.49,zt),zr=proj(.49,zt); ctx.beginPath(); ctx.moveTo(zl.x,zl.y); ctx.lineTo(zr.x,zr.y); ctx.stroke(); }

      // --- STREETLIGHTS (left footpath) ---
      for (const lt of [.12,.33,.57,.80]) {
        const base=proj(-.63,lt), ph=28*lt+3, pw=Math.max(.5,lt*1.8);
        ctx.strokeStyle="rgba(130,130,140,.65)"; ctx.lineWidth=pw; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(base.x,base.y); ctx.lineTo(base.x,base.y-ph); ctx.stroke();
        ctx.lineWidth=Math.max(.4,pw*.6);
        ctx.beginPath(); ctx.moveTo(base.x,base.y-ph); ctx.lineTo(base.x+7*lt,base.y-ph-2*lt); ctx.stroke();
        const gr=11*lt, lx=base.x+7*lt, ly=base.y-ph-2*lt;
        if (gr>1.5) { const glow=ctx.createRadialGradient(lx,ly,0,lx,ly,gr); glow.addColorStop(0,`rgba(255,190,70,${.55*lt})`); glow.addColorStop(1,"rgba(255,190,70,0)"); ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(lx,ly,gr,0,Math.PI*2); ctx.fill(); }
        ctx.fillStyle="rgba(255,200,80,.85)"; ctx.beginPath(); ctx.arc(lx,ly,Math.max(.8,2*lt),0,Math.PI*2); ctx.fill();
      }

      // --- TREES (right footpath) ---
      for (const tt of [.09,.28,.53,.76]) {
        const tp=proj(.66,tt), tr=9*tt;
        ctx.fillStyle=`rgba(55,40,15,${Math.min(1,tt*2.5)})`; ctx.fillRect(tp.x-tt,tp.y-12*tt,tt*2,12*tt);
        ctx.fillStyle=`rgba(12,28,12,${Math.min(1,tt*2.5)})`; ctx.beginPath(); ctx.arc(tp.x,tp.y-14*tt,tr,0,Math.PI*2); ctx.fill();
      }

      // --- TRAFFIC SIGNAL ---
      const st=.065, sb=proj(.58,st), sph=22*st+3;
      ctx.strokeStyle="rgba(130,130,130,.75)"; ctx.lineWidth=Math.max(.5,st*2); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(sb.x,sb.y); ctx.lineTo(sb.x,sb.y-sph); ctx.stroke();
      const bw=Math.max(3,8*st), bh=Math.max(5,16*st), bx=sb.x-bw/2, by=sb.y-sph-bh;
      ctx.fillStyle="#080808"; ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle="rgba(60,60,60,.5)"; ctx.lineWidth=.5; ctx.strokeRect(bx,by,bw,bh);
      if (p.isSignalFault) {
        if (Math.floor(f/14)%2===0) { ctx.fillStyle="#ffaa00"; ctx.beginPath(); ctx.arc(sb.x,by+bh/2,Math.max(1,bw*.32),0,Math.PI*2); ctx.fill(); }
      } else {
        const sc2=["#cc2020","#ccaa00","#20aa40"], gc=["#ff2244","#ffaa00","#22ff66"];
        const ai=p.signalColor==="red"?0:p.signalColor==="yellow"?1:2;
        for (let li=0; li<3; li++) {
          const lcy=by+(li+.5)*(bh/3), lr=Math.max(.8,bw*.28);
          if (li===ai) { const gld=ctx.createRadialGradient(sb.x,lcy,0,sb.x,lcy,lr*2.5); gld.addColorStop(0,gc[li]+"99"); gld.addColorStop(1,gc[li]+"00"); ctx.fillStyle=gld; ctx.beginPath(); ctx.arc(sb.x,lcy,lr*2.5,0,Math.PI*2); ctx.fill(); ctx.fillStyle=gc[li]; }
          else ctx.fillStyle=sc2[li]+"44";
          ctx.beginPath(); ctx.arc(sb.x,lcy,lr,0,Math.PI*2); ctx.fill();
        }
      }

      // --- AMBULANCE STATE ---
      const amb=ambRef.current;
      if (p.ambulanceDetected&&!amb.active) { amb.active=true; amb.t=0; amb.triggered=false; amb.flash=0; amb.overlay=0; amb.timer=0; }
      if (!p.ambulanceDetected&&amb.active) { amb.active=false; amb.t=0; amb.flash=0; amb.overlay=0; amb.timer=0; }
      if (amb.active) {
        amb.t+=.004; if (amb.t>1.1) { amb.t=0; amb.triggered=false; amb.overlay=0; amb.flash=0; amb.timer=0; }
        if (amb.t>=.38&&!amb.triggered) { amb.triggered=true; amb.flash=1; amb.overlay=1; amb.timer=95; }
        if (amb.flash>0) amb.flash=Math.max(0,amb.flash-.07);
        if (amb.timer>0) amb.timer--; else if (amb.overlay>0) amb.overlay=Math.max(0,amb.overlay-.018);
      }

      // --- VEHICLES ---
      const tgt=Math.min(p.vehicleCount,8), sm=p.vehicleCount>7?1.25:p.vehicleCount<4?.7:1;
      for (let i=vsRef.current.length-1; i>=0; i--) {
        const v=vsRef.current[i];
        if (v.lane===1) {
          const red=p.signalColor==="red"&&!p.isSignalFault;
          if (red&&v.t<=.135) { if (v.t>.12) v.t-=v.speed*.25; } else v.t-=v.speed;
        } else {
          const ahead=amb.active&&amb.t>v.t&&(amb.t-v.t)<.15;
          v.t+=ahead?v.speed*.25:v.speed;
          v.pullAside=ahead?Math.min(v.pullAside+.005,.07):Math.max(0,v.pullAside-.002);
        }
        if (v.t>1.06||v.t<-.06) vsRef.current.splice(i,1);
      }
      if (vsRef.current.length===0) { for (let i=0; i<Math.min(tgt,6); i++) { const l=(i%2) as 0|1; const v=newVehicle(l,sm); v.t=.1+Math.random()*.7; vsRef.current.push(v); } }
      const l0=vsRef.current.filter(v=>v.lane===0).length, l1=vsRef.current.filter(v=>v.lane===1).length;
      if (l0<Math.ceil(tgt/2)&&Math.random()<.018) vsRef.current.push(newVehicle(0,sm));
      if (l1<Math.floor(tgt/2)&&Math.random()<.018) vsRef.current.push(newVehicle(1,sm));

      // Draw vehicles (farther first)
      [...vsRef.current].sort((a,b)=>a.t-b.t).forEach(v => {
        const lx=v.lane===0?(-0.2-v.pullAside):0.2;
        const vp=proj(lx,v.t), vw=VW[v.type]*v.t, vh2=VH[v.type]*v.t;
        if (vw<1) return;
        ctx.fillStyle=v.color; ctx.fillRect(vp.x-vw/2,vp.y-vh2,vw,vh2);
        ctx.fillStyle="rgba(120,190,255,.22)";
        if (v.lane===0) ctx.fillRect(vp.x-vw*.35,vp.y-vh2*.5,vw*.7,vh2*.28);
        else ctx.fillRect(vp.x-vw*.35,vp.y-vh2+vh2*.1,vw*.7,vh2*.28);
        if (v.t>.12) {
          if (v.lane===0) { ctx.fillStyle="rgba(255,255,180,.85)"; ctx.fillRect(vp.x-vw*.42,vp.y-vh2*.2,vw*.12,vh2*.12); ctx.fillRect(vp.x+vw*.30,vp.y-vh2*.2,vw*.12,vh2*.12); }
          else { ctx.fillStyle="rgba(255,30,30,.7)"; ctx.fillRect(vp.x-vw*.42,vp.y-vh2+vh2*.06,vw*.12,vh2*.12); ctx.fillRect(vp.x+vw*.30,vp.y-vh2+vh2*.06,vw*.12,vh2*.12); }
        }
      });

      // --- AMBULANCE VEHICLE ---
      if (amb.active&&amb.t>0) {
        const at=amb.t, ap=proj(-.2,at), aw=38*at, ah=20*at;
        if (aw>=1) {
          ctx.fillStyle="#f8f8f8"; ctx.fillRect(ap.x-aw/2,ap.y-ah,aw,ah);
          ctx.fillStyle="#ff2244"; ctx.fillRect(ap.x-aw/2,ap.y-ah*.5,aw,ah*.14);
          if (at>.1) {
            const cs=Math.max(2,aw*.22);
            ctx.fillStyle="#ff2244"; ctx.fillRect(ap.x-cs/2,ap.y-ah-cs*.55,cs,cs);
            ctx.fillStyle="#ffffff"; ctx.fillRect(ap.x-cs*.38,ap.y-ah-cs*.2,cs*.76,cs*.28); ctx.fillRect(ap.x-cs*.17,ap.y-ah-cs*.5,cs*.34,cs*.72);
          }
          if (at>.07) {
            const sw=Math.max(1,aw*.15),sh=Math.max(1,ah*.13),rd=Math.floor(f/4)%2===0;
            ctx.fillStyle=rd?"#ff0000":"#0044ff"; ctx.fillRect(ap.x-aw*.32,ap.y-ah-sh,sw,sh);
            ctx.fillStyle=rd?"#0044ff":"#ff0000"; ctx.fillRect(ap.x+aw*.17,ap.y-ah-sh,sw,sh);
          }
          if (at>.1) { ctx.fillStyle="rgba(255,255,180,.9)"; const hls=Math.max(1,aw*.12); ctx.fillRect(ap.x-aw*.42,ap.y-ah*.22,hls,hls); ctx.fillRect(ap.x+aw*.30,ap.y-ah*.22,hls,hls); }
        }
        // Flash
        if (amb.flash>0) { ctx.fillStyle=`rgba(255,255,255,${amb.flash*.65})`; ctx.fillRect(0,0,W,H); }
        // Detection overlay
        if (amb.overlay>.05&&at>.25) {
          const cx=W/2,cy=H*.42,pw=Math.min(W*.72,185),ph=32;
          ctx.fillStyle=`rgba(10,0,0,${amb.overlay*.72})`; ctx.fillRect(cx-pw/2,cy-ph/2,pw,ph);
          ctx.strokeStyle=`rgba(255,30,60,${amb.overlay*.8})`; ctx.lineWidth=1; ctx.strokeRect(cx-pw/2,cy-ph/2,pw,ph);
          ctx.textAlign="center";
          ctx.fillStyle=`rgba(255,50,80,${amb.overlay*.95})`; ctx.font="bold 9px monospace"; ctx.fillText("⚠ AMBULANCE DETECTED",cx,cy-4);
          ctx.fillStyle=`rgba(0,255,140,${amb.overlay*.9})`; ctx.font="8px monospace"; ctx.fillText(`CONF: 0.${91+Math.floor(at*10)%7}`,cx,cy+10);
          ctx.textAlign="left";
        }
      }

      // --- POST-FX ---
      ctx.fillStyle="rgba(0,255,80,.033)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(0,0,0,.15)"; for (let y=f%3; y<H; y+=3) ctx.fillRect(0,y,W,1);
      const vig=ctx.createRadialGradient(W/2,H/2,H*.28,W/2,H/2,H*.82); vig.addColorStop(0,"transparent"); vig.addColorStop(1,"rgba(0,0,0,.6)"); ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
      if (f%4===0) { try { const id2=ctx.getImageData(0,0,W,H),d=id2.data; for (let i=0;i<d.length;i+=16) { const n=(Math.random()-.5)*13; d[i]=Math.min(255,Math.max(0,d[i]+n)); d[i+1]=Math.min(255,Math.max(0,d[i+1]+n)); d[i+2]=Math.min(255,Math.max(0,d[i+2]+n)); } ctx.putImageData(id2,0,0); } catch(_){} }
      if (p.isCameraGlitch&&f%5<4) { for (let gi=0; gi<4; gi++) { const gy=Math.random()*H; try { const gd=ctx.getImageData(0,gy,W,Math.max(1,Math.random()*3+1)); ctx.putImageData(gd,(Math.random()-.5)*22,gy); } catch(_){} } ctx.fillStyle=`rgba(0,255,60,${Math.random()*.07})`; ctx.fillRect(0,Math.random()*H,W,Math.random()*2+1); }
      if (f%80===0) { ctx.fillStyle="rgba(0,200,100,.06)"; ctx.fillRect(0,Math.random()*H,W,2); }

      // --- OVERLAYS ---
      const { cctvId:cid, signalColor:sc3, direction:dir } = p;
      const now=new Date(),ts=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      ctx.fillStyle="rgba(0,0,0,.5)"; ctx.fillRect(2,H-13,ts.length*5.1+4,11); ctx.font="8px monospace"; ctx.fillStyle="rgba(0,255,80,.88)"; ctx.fillText(ts,4,H-4);
      const cl=`CAM-${cid}`; ctx.fillStyle="rgba(0,0,0,.52)"; ctx.fillRect(2,2,cl.length*5.5+4,11); ctx.font="bold 8px monospace"; ctx.fillStyle="rgba(0,220,80,.92)"; ctx.fillText(cl,4,12);
      const ro2=Math.sin(f*.08)>0; ctx.fillStyle=`rgba(255,40,40,${ro2?.92:.28})`; ctx.beginPath(); ctx.arc(W-9,8,3,0,Math.PI*2); ctx.fill(); ctx.fillStyle="rgba(255,255,255,.75)"; ctx.font="7px monospace"; ctx.fillText("REC",W-26,12);
      const sdC=sc3==="green"?"#00ff55":sc3==="yellow"?"#ffaa00":"#ff2244"; ctx.fillStyle=sdC; ctx.beginPath(); ctx.arc(W-9,20,2.5,0,Math.PI*2); ctx.fill();
      const ft=FACING_LABEL[dir]||""; ctx.font="7px monospace"; const fw=ctx.measureText(ft).width; ctx.fillStyle="rgba(0,0,0,.5)"; ctx.fillRect(W-fw-6,H-13,fw+5,11); ctx.fillStyle="rgba(0,200,255,.75)"; ctx.fillText(ft,W-fw-3,H-4);
      ctx.textAlign="center"; ctx.font="6px monospace"; ctx.fillStyle="rgba(120,140,120,.45)"; ctx.fillText("~80m coverage",W/2,H-4); ctx.textAlign="left";
      drawCompass(ctx,W-18,36,8,dir);
    };

    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, []);

  return <div ref={containerRef} className="w-full h-full"><canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} /></div>;
}

function drawWindows(ctx: CanvasRenderingContext2D, W: number, H: number, side: 0|1, wins: boolean[], f: number) {
  const cols=3,rows=8,bW=W*.12,sx=side===0?W*.018:W*.862;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    const idx=(side===0?0:24)+r*cols+c; if (idx>=wins.length) continue;
    const wx=sx+c*(bW/(cols+.4)), wy=H*.04+r*H*.105, ww=bW/(cols+1.2), wh=H*.068;
    if (wins[idx]) { const fl=Math.sin(f*.025+idx*5.3)*.08+.92; ctx.fillStyle=`rgba(255,195,80,${.38*fl})`; ctx.fillRect(wx,wy,ww,wh); ctx.strokeStyle="rgba(255,190,60,.14)"; ctx.lineWidth=.5; ctx.strokeRect(wx,wy,ww,wh); }
    else { ctx.fillStyle="rgba(18,22,32,.75)"; ctx.fillRect(wx,wy,ww,wh); }
  }
}

function drawCompass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, arm: Direction) {
  ctx.strokeStyle="rgba(0,180,80,.4)"; ctx.lineWidth=.5; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  const facing: Record<Direction,string>={N:"S",S:"N",E:"W",W:"E"};
  const f2=facing[arm];
  [{ l:"N",dx:0,dy:-(r-2) },{ l:"S",dx:0,dy:r-1 },{ l:"E",dx:r-2,dy:1 },{ l:"W",dx:-(r-2),dy:1 }].forEach(({ l,dx,dy }) => {
    ctx.textAlign="center"; ctx.fillStyle=l===f2?"rgba(0,255,100,.9)":"rgba(80,120,80,.42)"; ctx.font="5px monospace"; ctx.fillText(l,cx+dx,cy+dy);
  });
  const fa={S:0,N:Math.PI,W:Math.PI/2,E:-Math.PI/2}[f2]??0;
  ctx.strokeStyle="rgba(0,255,100,.75)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.sin(fa)*(r-2),cy-Math.cos(fa)*(r-2)); ctx.stroke();
  ctx.textAlign="left";
}
