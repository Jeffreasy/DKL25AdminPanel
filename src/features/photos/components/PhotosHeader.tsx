import { H2 } from '../../../components/typography'
import { cc } from '../../../styles/shared'
import { PhotoIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline'

interface PhotosHeaderProps {
  onOpenUpload: () => void
  onOpenCloudinaryImport: () => void
}

export function PhotosHeader({ onOpenUpload, onOpenCloudinaryImport }: PhotosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <H2>Foto's</H2>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onOpenCloudinaryImport}
          className={`${cc.button.base({ color: 'secondary' })} hidden sm:inline-flex`}
          title="Importeer foto's vanuit Cloudinary"
        >
          <CloudArrowDownIcon className="w-5 h-5 mr-2" />
          Importeer (Cloudinary)
        </button>
        <button
          onClick={onOpenUpload}
          className={cc.button.base({ color: 'primary' })}
          title="Upload nieuwe foto's vanaf uw apparaat"
        >
          <PhotoIcon className="w-5 h-5 mr-2" />
          Upload Foto's
        </button>
      </div>
    </div>
  )
}