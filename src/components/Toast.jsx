import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!isVisible) return null;

  return (
    <div className="toast">
      <span>✓ {message}</span>
    </div>
  );
}
