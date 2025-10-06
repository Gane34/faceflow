
import React, { useState } from 'react';
import type { AppView } from './types';
import RegistrationPage from './components/RegistrationPage';
import AttendancePage from './components/AttendancePage';
import DashboardPage from './components/DashboardPage';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('attendance');

  const renderView = () => {
    switch (activeView) {
      case 'register':
        return <RegistrationPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'attendance':
      default:
        return <AttendancePage />;
    }
  };

  const NavButton: React.FC<{ view: AppView, children: React.ReactNode }> = ({ view, children }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
          isActive
            ? 'bg-brand-secondary text-white shadow'
            : 'text-base-content hover:bg-base-300'
        }`}
      >
        {children}
      </button>
    );
  };
  
  const FaceIdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.43-7.114a1 1 0 011.63-.042l2.36 4.34a1 1 0 001.62-.043l2.36-4.34a1 1 0 011.62-.042l4.43 7.114a1.012 1.012 0 010 .638l-4.43 7.114a1 1 0 01-1.62.043l-2.36-4.34a1 1 0 00-1.62.043l-2.36 4.34a1 1 0 01-1.63.042l-4.43-7.114z" />
    </svg>
);


  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <header className="bg-base-200 shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FaceIdIcon className="h-8 w-8 text-brand-secondary" />
              <span className="ml-3 text-xl font-bold text-white">FaceFlow</span>
            </div>
            <div className="flex items-center space-x-2">
              <NavButton view="attendance">Attendance</NavButton>
              <NavButton view="register">Register</NavButton>
              <NavButton view="dashboard">Dashboard</NavButton>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        <p>FaceFlow Attendance & Payroll MVP</p>
      </footer>
    </div>
  );
};

export default App;
