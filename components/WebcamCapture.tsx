import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WebcamCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  width?: number;
  height?: number;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, width = 640, height = 480 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width, height } });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null); // Clear any previous error on success
      } catch (err: any) {
        console.error("Error accessing webcam:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access denied. Please enable it in your browser settings to use this feature.");
        } else {
          setError("Could not access webcam. Please check permissions and ensure no other application is using it.");
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        context.drawImage(videoRef.current, 0, 0, width, height);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        onCapture(imageDataUrl);
      }
    }
  }, [onCapture, width, height]);

  if (error) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-base-300 rounded-lg text-red-400 p-4 aspect-[4/3]">
            <WarningIcon className="w-12 h-12 mb-4" />
            <p className="text-center font-semibold">Camera Error</p>
            <p className="text-center text-sm">{error}</p>
        </div>
    );
  }

  return (
    <div className="relative">
      <video ref={videoRef} autoPlay playsInline muted className="rounded-lg shadow-lg w-full h-auto aspect-[4/3] object-cover bg-base-300" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {stream && (
        <button
          onClick={captureFrame}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-brand-secondary hover:bg-blue-500 text-white rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-secondary transition-transform duration-200 active:scale-95"
          aria-label="Capture photo"
        >
          <CameraIcon className="w-8 h-8"/>
        </button>
      )}
    </div>
  );
};

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);


export default WebcamCapture;
