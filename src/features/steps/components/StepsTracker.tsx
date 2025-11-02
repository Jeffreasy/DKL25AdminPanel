import { useState } from 'react';
import { useSteps } from '../hooks';
import { StatCard } from './StatCard';
import { ProgressBar } from './ProgressBar';
import { cc } from '../../../styles/shared';
import { LoadingGrid } from '../../../components/ui';

/**
 * StepsTracker Component
 * Main component for tracking and updating participant steps
 */
export function StepsTracker() {
  const { dashboard, totalSteps, stats, loading, error, updateSteps, refreshData } = useSteps();
  const [inputSteps, setInputSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddSteps = async () => {
    if (!inputSteps || isNaN(Number(inputSteps))) return;

    const stepsToAdd = parseInt(inputSteps);
    
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await updateSteps(stepsToAdd);
      setInputSteps('');
      setSuccessMessage(`${stepsToAdd} stappen succesvol toegevoegd!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Error is already set in the hook
      console.error('Failed to add steps:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSteps();
    }
  };

  if (loading) {
    return <LoadingGrid count={3} variant="compact" />;
  }

  // Check if user is not registered as participant
  const isNotParticipantError = error?.includes('not found') || error?.includes('geen') || !dashboard;

  if (isNotParticipantError && !loading) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg
            className="h-6 w-6 text-yellow-400 dark:text-yellow-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Geen Deelnemer Registratie
          </h3>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          Je account is niet geregistreerd als deelnemer voor het wandelevenement.
          Om stappen te kunnen tracken, moet je je eerst aanmelden als deelnemer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/aanmelden'}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
          >
            Aanmelden als Deelnemer
          </button>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            Opnieuw Controleren
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-red-400 dark:text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
        <button
          onClick={refreshData}
          className={`mt-3 ${cc.button.base({ color: 'secondary', size: 'sm' })}`}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!dashboard || !stats) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Geen stappen data beschikbaar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 dark:text-green-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Personal Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Jouw Statistieken
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon="🚶"
            title="Jouw Stappen"
            value={stats.personalSteps.toLocaleString()}
            subtitle={`Route: ${dashboard.route}`}
          />
          <StatCard
            icon="💰"
            title="Toegewezen Fondsen"
            value={`€${dashboard.allocatedFunds}`}
            subtitle="Voor jouw route"
          />
          <StatCard
            icon="🌍"
            title="Totaal Stappen"
            value={totalSteps.toLocaleString()}
            subtitle="Alle deelnemers"
          />
        </div>
      </section>

      {/* Add Steps */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stappen Toevoegen
        </h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={inputSteps}
            onChange={(e) => setInputSteps(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Aantal stappen..."
            min="0"
            className={cc.form.input({ className: 'flex-1' })}
            disabled={isSubmitting}
          />
          <button
            onClick={handleAddSteps}
            disabled={isSubmitting || !inputSteps}
            className={cc.button.base({ color: 'primary' })}
          >
            {isSubmitting ? 'Bezig...' : 'Toevoegen'}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          💡 Tip: Gebruik je fitness tracker om je dagelijkse stappen te zien
        </p>
      </section>

      {/* Progress */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Voortgang
        </h3>
        <ProgressBar
          current={stats.personalSteps}
          goal={stats.personalGoal}
          label="Persoonlijk doel"
        />
      </section>
    </div>
  );
}