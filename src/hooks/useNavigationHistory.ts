import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigationHistory = () => {
  const location = useLocation();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, location.pathname];
      // Keep only last 10 entries to prevent memory issues
      return newHistory.slice(-10);
    });
  }, [location]);

  const getPreviousPage = (): string => {
    if (history.length < 2) return '/';
    return history[history.length - 2];
  };

  const hasHistory = (): boolean => {
    return history.length > 1;
  };

  return { getPreviousPage, hasHistory, history };
};
