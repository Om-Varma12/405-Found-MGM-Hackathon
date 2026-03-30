export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  beds?: number;
  capacity?: number;
}
