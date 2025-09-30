import { useDeletePhoto, useUpdatePhotoVisibility } from './usePhotos'

interface UsePhotoActionsProps {
  setError: (error: Error | null) => void
}

export function usePhotoActions({ setError }: UsePhotoActionsProps) {
  const deleteMutation = useDeletePhoto()
  const visibilityMutation = useUpdatePhotoVisibility()

  const handleError = (message: string) => {
    setError(new Error(message))
  }

  const handleDelete = async (photo: { id: string } | null) => {
    if (!photo) return
    try {
      await deleteMutation.mutateAsync(photo.id)
    } catch (err) {
      console.error("Error deleting photo:", err)
      handleError('Er ging iets mis bij het verwijderen van de foto')
    }
  }

  const handleVisibilityToggle = async (photo: { id: string; visible: boolean } | null) => {
    if (!photo) return
    try {
      await visibilityMutation.mutateAsync({ photoId: photo.id, visible: !photo.visible })
    } catch (err) {
      console.error("Error toggling visibility:", err)
      handleError('Kon zichtbaarheid niet wijzigen')
    }
  }

  return {
    loading: deleteMutation.isPending || visibilityMutation.isPending,
    handleDelete,
    handleVisibilityToggle,
    handleError
  }
}