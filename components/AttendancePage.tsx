
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { recognizeFace, logAttendance, getEmployees } from '../services/attendanceService';
import { Employee } from '../types';

const AttendancePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'recognizing' | 'success' | 'failure'>('idle');
  const [message, setMessage] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    setEmployees(getEmployees());
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Could not access webcam. Please check permissions.");
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAttendance = useCallback(async (type: 'check-in' | 'check-out') => {
    if (!videoRef.current || !canvasRef.current || status === 'recognizing') return;
    
    setStatus('recognizing');
    setMessage('Recognizing your face... Please hold still.');

    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    canvasRef.current.width = 640;
    canvasRef.current.height = 480;
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);

    const recognitionResult = await recognizeFace(imageDataUrl);

    if (recognitionResult) {
      const employee = employees.find(e => e.id === recognitionResult.employeeId);
      if (employee) {
        try {
          const record = await logAttendance(employee.id, type);
          setStatus('success');
          const time = new Date(type === 'check-in' ? record.checkIn! : record.checkOut!).toLocaleTimeString();
          setMessage(`Welcome, ${employee.name}! You've successfully checked ${type === 'check-in' ? 'in' : 'out'} at ${time}. Confidence: ${(recognitionResult.confidence * 100).toFixed(1)}%`);
        } catch (e: any) {
          setStatus('failure');
          setMessage(e.message || 'Attendance logging failed.');
        }
      } else {
        setStatus('failure');
        setMessage('Employee not found in database.');
      }
    } else {
      setStatus('failure');
      setMessage('Face not recognized. Please try again.');
    }
    setTimeout(() => setStatus('idle'), 5000);
  }, [status, employees]);

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-green-500';
      case 'failure': return 'border-red-500';
      case 'recognizing': return 'border-yellow-500 animate-pulse';
      default: return 'border-base-300';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">Attendance Kiosk</h2>
      <div className={`relative w-full max-w-2xl bg-base-200 p-2 rounded-xl shadow-2xl border-4 ${getStatusColor()} transition-colors duration-500`}>
        {error ? (
          <div className="aspect-[4/3] flex items-center justify-center text-red-400">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto rounded-lg" />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {status !== 'idle' && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
            <p className="text-white text-xl text-center p-4">{message}</p>
          </div>
        )}
      </div>
      <div className="flex space-x-4 mt-6">
        <button
          onClick={() => handleAttendance('check-in')}
          disabled={status === 'recognizing'}
          className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-500 transition duration-300"
        >
          Check In
        </button>
        <button
          onClick={() => handleAttendance('check-out')}
          disabled={status === 'recognizing'}
          className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-700 disabled:bg-gray-500 transition duration-300"
        >
          Check Out
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
