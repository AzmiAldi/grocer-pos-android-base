
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Shift, ShiftContextType } from '../types';
import { databaseService } from '../services/DatabaseService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchCurrentShift = async () => {
    try {
      setLoading(true);
      const shift = databaseService.getCurrentShift();
      setCurrentShift(shift);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch current shift",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCurrentShift();
  }, []);
  
  const openShift = async (openingBalance: number): Promise<Shift> => {
    if (!user) {
      throw new Error('User must be logged in to open a shift');
    }
    
    if (currentShift) {
      throw new Error('A shift is already open');
    }
    
    try {
      const newShift = databaseService.openShift(user.id, openingBalance);
      setCurrentShift(newShift);
      toast({
        title: "Shift opened",
        description: "New shift has been started successfully",
      });
      return newShift;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to open shift');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const closeShift = async (closingBalance: number): Promise<Shift | null> => {
    if (!currentShift) {
      throw new Error('No shift is currently open');
    }
    
    try {
      const closedShift = databaseService.closeShift(currentShift.id, closingBalance);
      if (closedShift) {
        setCurrentShift(null);
        toast({
          title: "Shift closed",
          description: "Shift has been closed successfully",
        });
      }
      return closedShift;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to close shift');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return (
    <ShiftContext.Provider value={{ 
      currentShift, 
      loading,
      openShift,
      closeShift,
      refreshShift: fetchCurrentShift
    }}>
      {children}
    </ShiftContext.Provider>
  );
};
