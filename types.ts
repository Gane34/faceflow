
export interface Employee {
  id: string;
  name: string;
  hourlyRate: number;
  images: string[]; // Array of base64 encoded image strings
}

export interface AttendanceRecord {
  id: string; // e.g., 'employeeId-date'
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO string
  checkOut: string | null; // ISO string
}

export interface ProcessedAttendanceRecord extends AttendanceRecord {
  employeeName: string;
  hoursWorked: number;
  payroll: number;
  status: 'Present' | 'Half-day' | 'Overtime' | 'Checked In';
}

export type AppView = 'attendance' | 'register' | 'dashboard';
