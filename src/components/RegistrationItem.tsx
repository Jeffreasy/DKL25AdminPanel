interface RegistrationItemProps {
  registration: {
    id: string
    naam: string
    email: string
    rol: string
    afstand: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
  }
  onStatusUpdate: (id: string, status: 'approved' | 'rejected') => void
}

export function RegistrationItem({ registration, onStatusUpdate }: RegistrationItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{registration.naam}</h3>
          <p className="text-sm text-gray-500">{registration.email}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span>Rol: {registration.rol}</span>
            <span>Afstand: {registration.afstand}</span>
          </div>
        </div>
        {registration.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusUpdate(registration.id, 'approved')}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full"
            >
              Goedkeuren
            </button>
            <button
              onClick={() => onStatusUpdate(registration.id, 'rejected')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full"
            >
              Afwijzen
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 