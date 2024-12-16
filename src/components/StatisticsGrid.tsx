interface Stats {
  status: {
    pending: number
    approved: number
    rejected: number
  }
  rollen: {
    Deelnemer: number
    Begeleider: number
    Vrijwilliger: number
  }
  afstanden: {
    '2.5 KM': number
    '6 KM': number
    '10 KM': number
    '15 KM': number
  }
}

interface StatisticsGridProps {
  stats: Stats
}

export function StatisticsGrid({ stats }: StatisticsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-yellow-600">Nieuw</span>
            <span>{stats.status.pending}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">Goedgekeurd</span>
            <span>{stats.status.approved}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600">Afgewezen</span>
            <span>{stats.status.rejected}</span>
          </div>
        </div>
      </div>
      {/* Voeg andere statistieken toe */}
    </div>
  )
} 