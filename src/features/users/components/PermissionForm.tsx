import { useState, useEffect } from 'react'
import type { PermissionWithId, CreatePermissionRequest } from '../types'
import { cc } from '../../../styles/shared'

interface PermissionFormProps {
  initialValues?: PermissionWithId
  onSubmit: (values: CreatePermissionRequest) => Promise<void>
  isSubmitting: boolean
}

export function PermissionForm({ initialValues, onSubmit, isSubmitting }: PermissionFormProps) {
  const isEdit = !!initialValues
  const [resource, setResource] = useState(initialValues?.resource || '')
  const [action, setAction] = useState(initialValues?.action || '')
  const [description, setDescription] = useState(initialValues?.description || '')
  const [isSystemPermission, setIsSystemPermission] = useState(initialValues?.is_system_permission ?? false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const commonResources = ['contact', 'user', 'newsletter', 'email', 'chat', 'photo', 'album', 'partner', 'sponsor', 'video', 'admin', 'staff']
  const commonActions = ['read', 'write', 'delete', 'send', 'fetch', 'manage_roles', 'manage_channel', 'moderate', 'access']

  useEffect(() => {
    setResource(initialValues?.resource || '')
    setAction(initialValues?.action || '')
    setDescription(initialValues?.description || '')
    setIsSystemPermission(initialValues?.is_system_permission ?? false)
    setErrors({})
  }, [initialValues])

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!resource.trim()) newErrors.resource = 'Resource is vereist'
    if (!action.trim()) newErrors.action = 'Action is vereist'
    if (!description.trim()) newErrors.description = 'Beschrijving is vereist'

    if (resource && !/^[a-z_]+$/.test(resource)) {
      newErrors.resource = 'Resource mag alleen kleine letters en underscores bevatten'
    }
    if (action && !/^[a-z_]+$/.test(action)) {
      newErrors.action = 'Action mag alleen kleine letters en underscores bevatten'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const values: CreatePermissionRequest = {
      resource: resource.trim(),
      action: action.trim(),
      description: description.trim(),
      is_system_permission: isSystemPermission
    }

    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className={cc.spacing.section.md}>
      {/* Resource Field */}
      <div>
        <label className={cc.form.label()}>
          Resource *
        </label>
        <input
          type="text"
          placeholder="bijv. contact, user, newsletter"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          disabled={isEdit && isSystemPermission}
          className={`${cc.form.input()} ${
            errors.resource ? 'border-red-500 dark:border-red-500' : ''
          } ${isEdit && isSystemPermission ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : ''}`}
        />
        {errors.resource && (
          <p className={cc.form.error()}>
            {errors.resource}
          </p>
        )}
        {!errors.resource && !resource && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Veelgebruikte resources:</p>
            <div className="flex flex-wrap gap-2">
              {commonResources.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResource(r)}
                  className={`px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${cc.transition.colors} border border-gray-300 dark:border-gray-600`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Field */}
      <div>
        <label className={cc.form.label()}>
          Action *
        </label>
        <input
          type="text"
          placeholder="bijv. read, write, delete"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          disabled={isEdit && isSystemPermission}
          className={`${cc.form.input()} ${
            errors.action ? 'border-red-500 dark:border-red-500' : ''
          } ${isEdit && isSystemPermission ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : ''}`}
        />
        {errors.action && (
          <p className={cc.form.error()}>
            {errors.action}
          </p>
        )}
        {!errors.action && !action && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Veelgebruikte actions:</p>
            <div className="flex flex-wrap gap-2">
              {commonActions.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${cc.transition.colors} border border-gray-300 dark:border-gray-600`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {resource && action && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/50 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-1 font-medium">Preview:</p>
          <code className="text-lg font-mono font-bold text-blue-900 dark:text-blue-200">
            {resource}:{action}
          </code>
        </div>
      )}

      {/* Description Field */}
      <div>
        <label className={cc.form.label()}>
          Beschrijving *
        </label>
        <textarea
          placeholder="Beschrijf wat deze permissie doet"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={3}
          className={`${cc.form.input()} resize-none ${
            errors.description ? 'border-red-500 dark:border-red-500' : ''
          }`}
        />
        {errors.description && (
          <p className={cc.form.error()}>
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description.length}/200 karakters
        </p>
      </div>

      {/* System Permission Toggle */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isSystemPermission}
            onChange={(e) => setIsSystemPermission(e.target.checked)}
            disabled={isEdit && isSystemPermission}
            className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 disabled:cursor-not-allowed"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Systeem permissie</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Systeem permissies kunnen niet worden gewijzigd of verwijderd. Gebruik dit alleen voor essentiële permissies.
            </p>
          </div>
        </label>
      </div>

      {/* Form Actions */}
      <div className={`flex ${cc.spacing.gap.md} pt-4 border-t border-gray-200 dark:border-gray-700`}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cc.button.base({ color: 'primary', className: `flex-1 ${cc.spacing.gap.sm}` })}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Bezig...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEdit ? 'Bijwerken' : 'Aanmaken'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}