import { useState, useEffect } from 'react';
import axios from 'axios';

export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkBackendStatus = async () => {
    try {
      setChecking(true);
      const response = await axios.get('http://localhost:5000/api/auth/status', {
        timeout: 3000
      });
      setIsOnline(response.status === 200);
      setLastCheck(new Date());
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      setIsOnline(false);
      setLastCheck(new Date());
      setRetryCount(prev => prev + 1);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkBackendStatus();

    // Dynamic interval based on retry count
    const getInterval = () => {
      if (retryCount > 5) return 300000; // 5 minutes after many failures
      if (retryCount > 2) return 120000; // 2 minutes after some failures
      return 60000; // 1 minute initially
    };

    const interval = setInterval(checkBackendStatus, getInterval());

    return () => clearInterval(interval);
  }, [retryCount]);

  return {
    isOnline,
    lastCheck,
    checking,
    retryCount,
    recheckStatus: checkBackendStatus
  };
};

export default useBackendStatus;