
import { Employee, AttendanceRecord, ProcessedAttendanceRecord } from '../types';

const EMPLOYEES_KEY = 'faceflow_employees';
const ATTENDANCE_KEY = 'faceflow_attendance';

// --- Employee Management ---

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployee = (employee: Omit<Employee, 'images'>, images: string[]): Promise<Employee> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const employees = getEmployees();
      const newEmployee: Employee = { ...employee, images };
      employees.push(newEmployee);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
      resolve(newEmployee);
    }, 500);
  });
};

// --- Attendance Management ---

export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAttendanceRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const logAttendance = (employeeId: string, type: 'check-in' | 'check-out'): Promise<AttendanceRecord> => {
  return new Promise((resolve, reject) => {
    const records = getAttendanceRecords();
    const today = new Date().toISOString().split('T')[0];
    const recordId = `${employeeId}-${today}`;
    let record = records.find(r => r.id === recordId);

    if (type === 'check-in') {
      if (record && record.checkIn) {
        return reject(new Error('Already checked in today.'));
      }
      if (!record) {
        record = { id: recordId, employeeId, date: today, checkIn: null, checkOut: null };
        records.push(record);
      }
      record.checkIn = new Date().toISOString();
    } else { // check-out
      if (!record || !record.checkIn) {
        return reject(new Error('Must check in before checking out.'));
      }
      if (record.checkOut) {
        return reject(new Error('Already checked out today.'));
      }
      record.checkOut = new Date().toISOString();
    }

    saveAttendanceRecords(records);
    resolve(record);
  });
};

// --- Mock AI Service ---

export const recognizeFace = (imageData: string): Promise<{ employeeId: string; confidence: number } | null> => {
  console.log('Simulating face recognition for image:', imageData.substring(0, 50) + '...');
  return new Promise((resolve) => {
    setTimeout(() => {
      const employees = getEmployees();
      if (employees.length === 0) {
        resolve(null); // No employees registered
        return;
      }
      // In a real app, this would be an API call to Vertex AI.
      // Here, we randomly pick a registered employee to simulate a successful match.
      const randomIndex = Math.floor(Math.random() * employees.length);
      const randomEmployee = employees[randomIndex];
      const randomConfidence = 0.9 + Math.random() * 0.1; // Simulate high confidence

      if (randomConfidence > 0.85) { // Confidence threshold
        resolve({ employeeId: randomEmployee.id, confidence: randomConfidence });
      } else {
        resolve(null); // Simulate recognition failure
      }
    }, 1500);
  });
};


// --- Data Processing & Payroll ---

export const getProcessedAttendance = (): ProcessedAttendanceRecord[] => {
  const employees = getEmployees();
  const records = getAttendanceRecords();
  const employeeMap = new Map(employees.map(e => [e.id, e]));

  return records.map(record => {
    const employee = employeeMap.get(record.employeeId);
    if (!employee) return null;

    let hoursWorked = 0;
    if (record.checkIn && record.checkOut) {
      const checkInTime = new Date(record.checkIn).getTime();
      const checkOutTime = new Date(record.checkOut).getTime();
      hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }
    
    const regularHours = Math.min(hoursWorked, 8);
    const overtimeHours = Math.max(0, hoursWorked - 8);
    const payroll = (regularHours * employee.hourlyRate) + (overtimeHours * employee.hourlyRate * 1.5);
    
    let status: ProcessedAttendanceRecord['status'] = 'Checked In';
    if(record.checkOut) {
      if (hoursWorked > 8) status = 'Overtime';
      else if (hoursWorked < 4) status = 'Half-day';
      else status = 'Present';
    }

    return {
      ...record,
      employeeName: employee.name,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
      payroll: parseFloat(payroll.toFixed(2)),
      status,
    };
  }).filter((r): r is ProcessedAttendanceRecord => r !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// --- Utility ---
export const exportToCSV = (data: ProcessedAttendanceRecord[]) => {
  const headers = ['Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Hours Worked', 'Status', 'Payroll (₹)'];
  const rows = data.map(r => [
    r.employeeId,
    r.employeeName,
    r.date,
    r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : 'N/A',
    r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A',
    r.hoursWorked,
    r.status,
    r.payroll.toFixed(2),
  ].join(','));

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "attendance_payroll.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
