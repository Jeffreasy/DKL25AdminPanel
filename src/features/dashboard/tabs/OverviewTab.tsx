interface OverviewTabProps {
  stats: {
    totaal: number
    rollen: Record<string, number>
    afstanden: Record<string, number>
    ondersteuning: Record<string, number>
  }
}

export function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1B2B3A] rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-400">Totaal aanmeldingen</h3>
          <p className="mt-2 text-xl font-semibold text-white">{stats.totaal}</p>
        </div>
        
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className="bg-[#1B2B3A] rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-400">{rol}</h3>
            <p className="mt-2 text-xl font-semibold text-white">{aantal}</p>
          </div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1B2B3A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Afstanden</h3>
          <div className="space-y-2">
            {Object.entries(stats.afstanden).map(([afstand, aantal]) => (
              <div key={afstand} className="flex justify-between text-sm">
                <span className="text-gray-400">{afstand}</span>
                <span className="text-white font-medium">{aantal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1B2B3A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Ondersteuning</h3>
          <div className="space-y-2">
            {Object.entries(stats.ondersteuning).map(([type, aantal]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-gray-400">{type}</span>
                <span className="text-white font-medium">{aantal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 