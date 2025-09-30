import { useState, useCallback } from 'react'

export function usePhotoSelection() {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set())

  const handleSelectionChange = useCallback((photoId: string, isSelected: boolean) => {
    setSelectedPhotoIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds)
      if (isSelected) {
        newSelectedIds.add(photoId)
      } else {
        newSelectedIds.delete(photoId)
      }
      return newSelectedIds
    })
  }, [])

  const handleSelectAll = useCallback((photoIds: string[]) => {
    const currentPhotoIdSet = new Set(photoIds)
    const allSelected = photoIds.every(id => selectedPhotoIds.has(id))

    if (allSelected) {
      setSelectedPhotoIds(new Set())
    } else {
      setSelectedPhotoIds(currentPhotoIdSet)
    }
  }, [selectedPhotoIds])

  const clearSelection = useCallback(() => {
    setSelectedPhotoIds(new Set())
  }, [])

  return {
    selectedPhotoIds,
    handleSelectionChange,
    handleSelectAll,
    clearSelection,
    selectedCount: selectedPhotoIds.size
  }
}