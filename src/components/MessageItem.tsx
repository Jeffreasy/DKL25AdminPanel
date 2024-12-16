interface MessageItemProps {
  message: {
    id: string
    naam: string
    email: string
    telefoon: string | null
    bericht: string
    aangemaakt_op: string
    status: 'ongelezen' | 'gelezen'
  }
  onToggleRead: (id: string, status: string) => void
}

export function MessageItem({ message, onToggleRead }: MessageItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{message.naam}</h3>
          <p className="text-sm text-gray-500">{message.email}</p>
          <p className="mt-2 text-gray-700">{message.bericht}</p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(message.aangemaakt_op).toLocaleString('nl-NL')}
          </p>
        </div>
        <button
          onClick={() => onToggleRead(message.id, message.status)}
          className={`px-3 py-1 rounded-full text-sm ${
            message.status === 'gelezen'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message.status === 'gelezen' ? 'Gelezen' : 'Markeer als gelezen'}
        </button>
      </div>
    </div>
  )
} 