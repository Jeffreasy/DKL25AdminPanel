import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useNotulenMutations } from '../hooks'
import { usePermissions } from '@/hooks'
import { cc } from '@/styles/shared'
import type { Notulen, AgendaItem, Besluit, Actiepunt } from '../types'

interface NotulenFormProps {
  notulen?: Notulen
  onSuccess?: () => void
}

export function NotulenForm({ notulen, onSuccess }: NotulenFormProps) {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { createNotulen, updateNotulen, loading, error } = useNotulenMutations()

  const [formData, setFormData] = useState({
    titel: notulen?.titel || '',
    vergadering_datum: notulen?.vergadering_datum || format(new Date(), 'yyyy-MM-dd'),
    locatie: notulen?.locatie || '',
    voorzitter: notulen?.voorzitter || '',
    notulist: notulen?.notulist || '',
    aanwezigen: notulen?.aanwezigen || [],
    afwezigen: notulen?.afwezigen || [],
    agenda_items: notulen?.agendaItems || [],
    besluiten: notulen?.besluitenList || [],
    actiepunten: notulen?.actiepuntenList || [],
    notities: notulen?.notities || ''
  })

  const [aanwezigenInput, setAanwezigenInput] = useState('')
  const [afwezigenInput, setAfwezigenInput] = useState('')

  const isEditing = !!notulen
  const canEdit = !isEditing || (isEditing && notulen.status === 'draft' && hasPermission('notulen', 'write'))

  useEffect(() => {
    if (notulen) {
      setFormData({
        titel: notulen.titel,
        vergadering_datum: notulen.vergadering_datum,
        locatie: notulen.locatie || '',
        voorzitter: notulen.voorzitter || '',
        notulist: notulen.notulist || '',
        aanwezigen: notulen.aanwezigen,
        afwezigen: notulen.afwezigen,
        agenda_items: notulen.agendaItems,
        besluiten: notulen.besluitenList,
        actiepunten: notulen.actiepuntenList,
        notities: notulen.notities || ''
      })
    }
  }, [notulen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEdit) return

    try {
      const submitData = {
        ...formData,
        aanwezigen: formData.aanwezigen.filter(name => name.trim()),
        afwezigen: formData.afwezigen.filter(name => name.trim()),
        agenda_items: formData.agenda_items.filter(item => item.title.trim()),
        besluiten: formData.besluiten.filter(item => item.besluit.trim()),
        actiepunten: formData.actiepunten.filter(item => item.actie.trim())
      }

      if (isEditing && notulen) {
        await updateNotulen(notulen.id, submitData)
      } else {
        await createNotulen(submitData)
      }

      onSuccess?.()
      navigate('/notulen')
    } catch (err) {
      console.error('Failed to save notulen:', err)
    }
  }

  const addAttendee = (type: 'aanwezigen' | 'afwezigen') => {
    const input = type === 'aanwezigen' ? aanwezigenInput : afwezigenInput
    const setter = type === 'aanwezigen' ? setAanwezigenInput : setAfwezigenInput

    if (input.trim() && !formData[type].includes(input.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], input.trim()]
      }))
      setter('')
    }
  }

  const removeAttendee = (type: 'aanwezigen' | 'afwezigen', name: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(n => n !== name)
    }))
  }

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda_items: [...prev.agenda_items, { title: '', details: '' }]
    }))
  }

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      agenda_items: prev.agenda_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda_items: prev.agenda_items.filter((_, i) => i !== index)
    }))
  }

  const addBesluit = () => {
    setFormData(prev => ({
      ...prev,
      besluiten: [...prev.besluiten, { besluit: '', teams: {} }]
    }))
  }

  const updateBesluit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      besluiten: prev.besluiten.map((item, i) =>
        i === index ? { ...item, besluit: value } : item
      )
    }))
  }

  const removeBesluit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      besluiten: prev.besluiten.filter((_, i) => i !== index)
    }))
  }

  const addActiepunt = () => {
    setFormData(prev => ({
      ...prev,
      actiepunten: [...prev.actiepunten, { actie: '', verantwoordelijke: '' }]
    }))
  }

  const updateActiepunt = (index: number, field: keyof Actiepunt, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      actiepunten: prev.actiepunten.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeActiepunt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actiepunten: prev.actiepunten.filter((_, i) => i !== index)
    }))
  }

  if (!canEdit) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          U heeft geen toestemming om deze notulen te bewerken.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notulen')}
            className={cc.button.icon({ color: 'secondary' })}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Notulen Bewerken' : 'Nieuwe Notulen'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditing ? 'Bewerk de vergadernotulen' : 'Maak nieuwe vergadernotulen aan'}
            </p>
          </div>
        </div>
        {isEditing && notulen && (
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            notulen.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : notulen.status === 'finalized'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}>
            {notulen.status === 'draft' ? 'Concept' :
             notulen.status === 'finalized' ? 'Definitief' : 'Gearchiveerd'}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Basisinformatie
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cc.form.label()}>
                Titel *
              </label>
              <input
                type="text"
                required
                value={formData.titel}
                onChange={(e) => setFormData(prev => ({ ...prev, titel: e.target.value }))}
                className={cc.form.input()}
                placeholder="Vergadering titel"
              />
            </div>

            <div>
              <label className={cc.form.label()}>
                Vergaderdatum *
              </label>
              <input
                type="date"
                required
                value={formData.vergadering_datum}
                onChange={(e) => setFormData(prev => ({ ...prev, vergadering_datum: e.target.value }))}
                className={cc.form.input()}
              />
            </div>

            <div>
              <label className={cc.form.label()}>
                Locatie
              </label>
              <input
                type="text"
                value={formData.locatie}
                onChange={(e) => setFormData(prev => ({ ...prev, locatie: e.target.value }))}
                className={cc.form.input()}
                placeholder="Vergaderlocatie"
              />
            </div>

            <div>
              <label className={cc.form.label()}>
                Voorzitter
              </label>
              <input
                type="text"
                value={formData.voorzitter}
                onChange={(e) => setFormData(prev => ({ ...prev, voorzitter: e.target.value }))}
                className={cc.form.input()}
                placeholder="Naam voorzitter"
              />
            </div>

            <div>
              <label className={cc.form.label()}>
                Notulist
              </label>
              <input
                type="text"
                value={formData.notulist}
                onChange={(e) => setFormData(prev => ({ ...prev, notulist: e.target.value }))}
                className={cc.form.input()}
                placeholder="Naam notulist"
              />
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Aanwezigen en Afwezigen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aanwezigen */}
            <div>
              <label className={cc.form.label()}>
                Aanwezigen
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={aanwezigenInput}
                  onChange={(e) => setAanwezigenInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee('aanwezigen'))}
                  className={cc.form.input()}
                  placeholder="Naam toevoegen"
                />
                <button
                  type="button"
                  onClick={() => addAttendee('aanwezigen')}
                  className={cc.button.icon({ color: 'primary' })}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.aanwezigen.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeAttendee('aanwezigen', name)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Afwezigen */}
            <div>
              <label className={cc.form.label()}>
                Afwezigen
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={afwezigenInput}
                  onChange={(e) => setAfwezigenInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee('afwezigen'))}
                  className={cc.form.input()}
                  placeholder="Naam toevoegen"
                />
                <button
                  type="button"
                  onClick={() => addAttendee('afwezigen')}
                  className={cc.button.icon({ color: 'primary' })}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.afwezigen.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeAttendee('afwezigen', name)}
                      className="hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agenda Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Agenda Items
            </h2>
            <button
              type="button"
              onClick={addAgendaItem}
              className={cc.button.base({ color: 'primary', size: 'sm' })}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Toevoegen
            </button>
          </div>

          <div className="space-y-4">
            {formData.agenda_items.map((item: AgendaItem, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agenda Item {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className={cc.button.icon({ color: 'danger', size: 'sm' })}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                    className={cc.form.input()}
                    placeholder="Titel"
                  />
                  <textarea
                    value={item.details || ''}
                    onChange={(e) => updateAgendaItem(index, 'details', e.target.value)}
                    className={cc.form.textarea()}
                    placeholder="Details (optioneel)"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Besluiten */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Besluiten
            </h2>
            <button
              type="button"
              onClick={addBesluit}
              className={cc.button.base({ color: 'primary', size: 'sm' })}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Toevoegen
            </button>
          </div>

          <div className="space-y-4">
            {formData.besluiten.map((besluit: Besluit, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Besluit {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBesluit(index)}
                    className={cc.button.icon({ color: 'danger', size: 'sm' })}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={besluit.besluit}
                  onChange={(e) => updateBesluit(index, e.target.value)}
                  className={cc.form.textarea()}
                  placeholder="Beschrijving van het besluit"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actiepunten */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Actiepunten
            </h2>
            <button
              type="button"
              onClick={addActiepunt}
              className={cc.button.base({ color: 'primary', size: 'sm' })}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Toevoegen
            </button>
          </div>

          <div className="space-y-4">
            {formData.actiepunten.map((actie: Actiepunt, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actiepunt {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeActiepunt(index)}
                    className={cc.button.icon({ color: 'danger', size: 'sm' })}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={cc.form.label()}>
                      Actie *
                    </label>
                    <textarea
                      value={actie.actie}
                      onChange={(e) => updateActiepunt(index, 'actie', e.target.value)}
                      className={cc.form.textarea()}
                      placeholder="Beschrijving van de actie"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className={cc.form.label()}>
                      Verantwoordelijke *
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(actie.verantwoordelijke) ? actie.verantwoordelijke.join(', ') : actie.verantwoordelijke}
                      onChange={(e) => updateActiepunt(index, 'verantwoordelijke', e.target.value)}
                      className={cc.form.input()}
                      placeholder="Naam verantwoordelijke"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notities
          </h2>
          <textarea
            value={formData.notities}
            onChange={(e) => setFormData(prev => ({ ...prev, notities: e.target.value }))}
            className={cc.form.textarea()}
            placeholder="Aanvullende notities"
            rows={4}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/notulen')}
            className={cc.button.base({ color: 'secondary' })}
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cc.button.base({ color: 'primary' })}
          >
            {loading ? 'Opslaan...' : (isEditing ? 'Bijwerken' : 'Aanmaken')}
          </button>
        </div>
      </form>
    </div>
  )
}
