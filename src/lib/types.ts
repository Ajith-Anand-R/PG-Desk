export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  beds: ("available" | "occupied")[];
}

export interface Tenant {
  id: string;
  name: string;
  roomName: string;
  rentAmount: number;
  status: "active" | "left";
}
