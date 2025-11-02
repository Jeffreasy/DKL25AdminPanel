import { cc } from '../../../styles/shared';

interface ProgressBarProps {
  current: number;
  goal: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * ProgressBar Component
 * Displays progress towards a goal with a visual bar
 */
export function ProgressBar({ 
  current, 
  goal, 
  label = 'Voortgang', 
  showPercentage = true,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full ${cc.transition.slow} ${
            isComplete
              ? 'bg-green-600 dark:bg-green-500'
              : 'bg-blue-600 dark:bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{current.toLocaleString()} stappen</span>
        <span>Doel: {goal.toLocaleString()}</span>
      </div>
    </div>
  );
}