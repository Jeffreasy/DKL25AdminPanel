interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

/**
 * StatCard Component
 * Displays a single statistic with icon, title, value, and optional subtitle
 */
export function StatCard({ icon, title, value, subtitle, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="text-4xl ml-4">{icon}</div>
      </div>
    </div>
  );
}