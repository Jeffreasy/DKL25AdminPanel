import { useState, useEffect, useCallback } from 'react';
import { stepsClient } from '../../../api/client/stepsClient';
import type {
  ParticipantDashboard,
  FundsDistribution,
  StepsStats
} from '../types';

interface UseStepsReturn {
  dashboard: ParticipantDashboard | null;
  totalSteps: number;
  fundsDistribution: FundsDistribution | null;
  stats: StepsStats | null;
  loading: boolean;
  error: string | null;
  updateSteps: (deltaSteps: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

/**
 * Hook for managing participant steps functionality
 * Provides dashboard data, total steps, and step updates
 */
export function useSteps(): UseStepsReturn {
  const [dashboard, setDashboard] = useState<ParticipantDashboard | null>(null);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [fundsDistribution, setFundsDistribution] = useState<FundsDistribution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from dashboard data
  const stats: StepsStats | null = dashboard
    ? {
        personalSteps: dashboard.steps,
        totalSteps: totalSteps,
        personalGoal: 100000, // Default goal, can be made configurable
        progressPercentage: Math.min((dashboard.steps / 100000) * 100, 100),
      }
    : null;

  /**
   * Fetch all steps data
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardData, totalData, fundsData] = await Promise.all([
        stepsClient.getMyDashboard(),
        stepsClient.getTotalSteps(),
        stepsClient.getFundsDistribution(),
      ]);

      setDashboard(dashboardData);
      setTotalSteps(totalData.total_steps);
      setFundsDistribution(fundsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis bij het ophalen van de gegevens';
      setError(errorMessage);
      console.error('Error fetching steps data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update participant steps
   */
  const updateSteps = useCallback(async (deltaSteps: number) => {
    try {
      setError(null);
      await stepsClient.updateMySteps(deltaSteps);
      
      // Refresh data after update
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis bij het bijwerken van stappen';
      setError(errorMessage);
      throw err; // Re-throw for caller to handle
    }
  }, [fetchData]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    dashboard,
    totalSteps,
    fundsDistribution,
    stats,
    loading,
    error,
    updateSteps,
    refreshData,
  };
}

/**
 * Hook for auto-refreshing total steps
 * Useful for displaying live updates
 */
export function useLiveTotalSteps(refreshInterval: number = 30000): {
  totalSteps: number;
  loading: boolean;
  error: string | null;
} {
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalSteps = useCallback(async () => {
    try {
      const data = await stepsClient.getTotalSteps();
      setTotalSteps(data.total_steps);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kon totaal niet ophalen';
      setError(errorMessage);
      console.error('Error fetching total steps:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotalSteps();

    // Set up auto-refresh interval
    const interval = setInterval(() => {
      fetchTotalSteps();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchTotalSteps, refreshInterval]);

  return {
    totalSteps,
    loading,
    error,
  };
}