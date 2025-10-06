
import React, { useState } from 'react';
import WebcamCapture from './WebcamCapture';
import { saveEmployee } from '../services/attendanceService';

const RegistrationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCapture = (imageDataUrl: string) => {
    if (capturedImages.length < 10) { // Limit to 10 for the MVP
      setCapturedImages(prev => [...prev, imageDataUrl]);
    } else {
      setMessage({ type: 'error', text: 'Maximum of 10 photos reached.' });
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !employeeId || !hourlyRate || capturedImages.length < 3) {
      setMessage({ type: 'error', text: 'Please fill all fields and capture at least 3 photos.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      await saveEmployee({ name, id: employeeId, hourlyRate: parseFloat(hourlyRate) }, capturedImages);
      setMessage({ type: 'success', text: 'Employee registered successfully!' });
      // Reset form
      setName('');
      setEmployeeId('');
      setHourlyRate('');
      setCapturedImages([]);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to register employee.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-white">New Employee Registration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Step 1: Capture Photos</h3>
          <p className="text-sm text-base-content mb-4">Capture at least 3 photos from different angles (front, left, right). Maximum 10 photos.</p>
          <WebcamCapture onCapture={handleCapture} />
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Captured Photos ({capturedImages.length}/10)</h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {capturedImages.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src} alt={`Capture ${index + 1}`} className="rounded-md object-cover aspect-square" />
                  <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Step 2: Employee Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-base-content">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-base-300 border-base-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-base-content">Employee ID</label>
              <input type="text" id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 block w-full bg-base-300 border-base-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-base-content">Hourly Rate (₹)</label>
              <input type="number" id="hourlyRate" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="mt-1 block w-full bg-base-300 border-base-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm p-2" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary disabled:bg-base-300 disabled:cursor-not-allowed transition duration-300">
              {isLoading ? 'Registering...' : 'Register Employee'}
            </button>
            {message && (
              <p className={`text-sm text-center mt-4 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
