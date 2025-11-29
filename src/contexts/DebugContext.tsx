import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setDebugLogger } from '@/services/api';

interface ApiLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status?: number;
  requestData?: any;
  responseData?: any;
  error?: any;
}

interface DebugContextType {
  debugMode: boolean;
  apiLogs: ApiLog[];
  toggleDebugMode: () => void;
  addApiLog: (log: Omit<ApiLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider = ({ children }: { children: ReactNode }) => {
  const [debugMode, setDebugMode] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const toggleDebugMode = () => {
    setDebugMode((prev) => !prev);
    console.log('Debug mode:', !debugMode ? 'ENABLED' : 'DISABLED');
  };

  const addApiLog = (log: Omit<ApiLog, 'id' | 'timestamp'>) => {
    const newLog: ApiLog = {
      ...log,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
    };
    setApiLogs((prev) => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const clearLogs = () => {
    setApiLogs([]);
  };

  // Set up debug logger in API service
  useEffect(() => {
    if (debugMode) {
      setDebugLogger(addApiLog);
    } else {
      setDebugLogger(null);
    }
  }, [debugMode]);

  return (
    <DebugContext.Provider
      value={{
        debugMode,
        apiLogs,
        toggleDebugMode,
        addApiLog,
        clearLogs,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

