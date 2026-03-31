# 🚑 AI-Powered Green Corridor System

> Automated traffic signal orchestration system for emergency vehicle movement using CCTV-based tracking and real-time decision logic.

---

## 📌 Overview

This project simulates a **smart city traffic control system** that automatically creates and manages **green corridors** for emergency vehicles (e.g., ambulance transport between hospitals).

The system replaces manual coordination with an **AI-driven, event-based pipeline** that:

* Receives verified hospital requests
* Computes optimal routes
* Tracks ambulance movement via CCTV nodes
* Dynamically controls traffic signals

---

## 🎯 Problem Statement

* Traffic signals are static and non-adaptive
* Green corridors require manual coordination
* Delays occur even during critical transport
* No real-time synchronization between traffic infrastructure and emergency systems

---

## 💡 Solution

We designed a system that:

* Automates **green corridor creation**
* Uses **CCTV nodes as tracking points**
* Implements **rolling signal control**
* Provides a **real-time command center dashboard**

---

## ⚙️ System Architecture

```text
Hospital Request
        ↓
Route Generation (Graph-based)
        ↓
CCTV Tracking (Event Layer)
        ↓
Dual Verification
        ↓
Decision Engine
        ↓
Traffic Signal Control
        ↓
Frontend Dashboard
```

---

## 🧩 Core Components

### 1. 🏥 Hospital Request Module

* Initiates corridor request
* Provides source, destination, and ambulance ID

---

### 2. 🗺️ City Graph Model

* Intersections modeled as nodes (CCTV points)
* Roads modeled as edges
* Used for shortest path computation

---

### 3. 📡 CCTV Layer

* Each node simulates a CCTV
* Detects ambulance presence
* Generates events

---

### 4. 🧠 Perception Layer

* Ambulance detection model (CNN)
* (Optional) traffic density model

---

### 5. 🔐 Dual Verification System

Green corridor activates only when:

* Valid hospital request exists
* Ambulance is detected across CCTV nodes

---

### 6. 🚦 Decision Engine

* Controls signal states
* Activates emergency priority
* Implements rolling corridor

---

### 7. 🔄 Rolling Green Corridor

* Only current and next signals turn GREEN
* Remaining signals stay RED
* Moves dynamically with ambulance

---

### 8. 🖥️ Command Center Dashboard

* 4×4 CCTV grid (70%)
* Route tracking + logs (30%)
* Real-time system visualization

---

## 🔁 System Flow

```text
Input → Route → Detection → Verification → Control → Output
```

---

## 🧪 Simulation Approach

Since real-world infrastructure is unavailable:

* CCTV feeds are **simulated as event streams**
* Ambulance movement is modeled as **graph traversal**
* Signal updates are computed in real time

---

## 🛠️ Tech Stack

**Backend**

* Python
* FastAPI
* WebSockets

**Frontend**

* React.js
* Tailwind CSS

**AI Models**

* CNN (Ambulance detection)
* (Optional) Traffic classification

---

## 📂 Project Structure

```text
backend/
│
├── main.py
├── state.py
│
├── engine/
│   ├── dispatch.py
│   ├── routing.py
│   ├── decision.py
│   ├── events.py
│
├── cctv/
│   ├── simulator.py
│   ├── processor.py
│
├── api/
│   ├── routes.py
│   ├── websocket.py
│
frontend/
│
├── components/
│   ├── CCTVGrid.jsx
│   ├── CCTVCard.jsx
│   ├── SidePanel.jsx
│   ├── RouteTracker.jsx
│   ├── EventLog.jsx
│
├── pages/
│   ├── Dashboard.jsx
```

---

## 🚀 Features

* Automated green corridor activation
* Graph-based route planning
* CCTV-based ambulance tracking
* Rolling traffic signal control
* Real-time dashboard visualization
* Event-driven backend architecture

---

## 🧪 How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Demo Capabilities

* Trigger hospital request
* Visualize ambulance movement
* Observe dynamic signal changes
* Track events in real time

---

## 🔮 Future Scope

* Real CCTV integration
* GPS + CCTV data fusion
* Smart traffic signal hardware integration
* Multi-ambulance conflict resolution
* Automated accident detection and response
* Vehicle violation detection (ANPR-based)

---

## ⚠️ Limitations

* Uses simulated CCTV inputs
* Does not integrate real traffic hardware
* AI models are not deployed in real-time pipeline