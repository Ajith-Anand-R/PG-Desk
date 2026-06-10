export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  beds: ("available" | "occupied" | "reserved")[];
}

export interface Tenant {
  id: string;
  name: string;
  roomName: string;
  rentAmount: number;
  status: "active" | "left" | "prebooked";
  joinDate?: string | null;
  roomId?: string | null;
  bedId?: string | null;
  deposit?: number | null;
  aadhaarNumber?: string | null;
  emergencyContact?: string | null;
  email?: string | null;
  phone?: string | null;
}
