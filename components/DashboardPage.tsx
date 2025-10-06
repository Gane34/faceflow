
import React, { useState, useEffect } from 'react';
import { getProcessedAttendance, exportToCSV } from '../services/attendanceService';
import { ProcessedAttendanceRecord } from '../types';

const DashboardPage: React.FC = () => {
  const [records, setRecords] = useState<ProcessedAttendanceRecord[]>([]);

  useEffect(() => {
    setRecords(getProcessedAttendance());
  }, []);

  const getStatusChip = (status: ProcessedAttendanceRecord['status']) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'Present': return `${baseClasses} bg-green-200 text-green-800`;
      case 'Half-day': return `${baseClasses} bg-yellow-200 text-yellow-800`;
      case 'Overtime': return `${baseClasses} bg-blue-200 text-blue-800`;
      case 'Checked In': return `${baseClasses} bg-gray-200 text-gray-800`;
      default: return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
        <button
          onClick={() => exportToCSV(records)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-primary"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Export to CSV
        </button>
      </div>
      <div className="bg-base-200 shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-300">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Check In</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Check Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Hours Worked</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">Payroll</th>
              </tr>
            </thead>
            <tbody className="bg-base-200 divide-y divide-base-300">
              {records.length > 0 ? records.map((record) => (
                <tr key={record.id} className="hover:bg-base-300/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{record.employeeName}</div>
                    <div className="text-sm text-base-content">{record.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.hoursWorked.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusChip(record.status)}>{record.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">₹{record.payroll.toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


export default DashboardPage;
