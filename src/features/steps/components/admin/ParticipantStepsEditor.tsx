import { useState, useEffect } from 'react';
import { stepsClient } from '../../../../api/client/stepsClient';
import { fetchAanmeldingen } from '../../../aanmeldingen/services/aanmeldingenService';
import type { Aanmelding } from '../../../aanmeldingen/types';
import { cc } from '../../../../styles/shared';
import { LoadingGrid, Modal } from '../../../../components/ui';

// Extended Aanmelding type with steps property
interface AanmeldingWithSteps extends Aanmelding {
  steps?: number;
}

/**
 * ParticipantStepsEditor Component
 * Admin interface for viewing and editing participant steps
 */
export function ParticipantStepsEditor() {
  const [participants, setParticipants] = useState<AanmeldingWithSteps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Aanmelding | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState<string>('all');

  const loadParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await fetchAanmeldingen(1000, 0);
      if (fetchError) {
        console.warn('Aanmeldingen API error:', fetchError);
        setError('De backend API is momenteel niet beschikbaar. Controleer of de server draait.');
        setParticipants([]);
        return;
      }
      setParticipants(data);
    } catch (err) {
      console.error('Error loading participants:', err);
      setError('Kon geen verbinding maken met de server. De backend API is mogelijk offline.');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = routeFilter === 'all' || p.afstand === routeFilter;
    return matchesSearch && matchesRoute;
  });

  const routes = Array.from(new Set(participants.map(p => p.afstand).filter(Boolean)));

  if (loading) {
    return <LoadingGrid count={6} variant="compact" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Deelnemer Stappen Beheer
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bekijk en bewerk stappen van individuele deelnemers
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Zoek op naam of email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cc.form.input()}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className={cc.form.input()}
          >
            <option value="all">Alle routes</option>
            {routes.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stappen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {participant.naam}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {participant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      {participant.afstand}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {participant.steps?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedParticipant(participant);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                    >
                      Bewerken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Geen deelnemers gevonden
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pas je zoek- of filterinstellingen aan.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedParticipant && (
        <EditStepsModal
          participant={selectedParticipant}
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedParticipant(null);
          }}
          onUpdate={loadParticipants}
        />
      )}
    </div>
  );
}

interface EditStepsModalProps {
  participant: AanmeldingWithSteps;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function EditStepsModal({ participant, open, onClose, onUpdate }: EditStepsModalProps) {
  const [deltaSteps, setDeltaSteps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deltaSteps) return;

    setSubmitting(true);
    setError(null);
    
    try {
      await stepsClient.updateParticipantSteps(participant.id, parseInt(deltaSteps));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onUpdate();
      }, 1500);
    } catch (err) {
      console.error('❌ Steps update failed:', err);
      
      // Extract detailed error information
      const error = err as { status?: number; message?: string; response?: { data?: { error?: string } } };
      
      if (error.status === 403) {
        // FORBIDDEN - No permission, show error but DON'T logout
        setError('❌ Geen toegang: Je hebt geen toestemming om stappen aan te passen. Neem contact op met een administrator.');
      } else if (error.status === 401) {
        // UNAUTHORIZED - Already logged out by interceptor, just show message
        setError('❌ Sessie verlopen: Je wordt doorgestuurd naar de inlogpagina...');
      } else if (error.status === 500) {
        // SERVER ERROR - Show backend error message if available
        const backendMessage = error.message || 'Server error';
        setError(`❌ Backend Error (500): ${backendMessage}. Dit is een backend database probleem - neem contact op met de ontwikkelaar.`);
      } else {
        // Generic error
        const errorMessage = error.message || 'Onbekende fout bij bijwerken stappen';
        setError(`❌ Error: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={`Stappen Bewerken - ${participant.naam}`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Current Info */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Huidige stappen:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {participant.steps?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Route:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {participant.afstand}
            </span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              ✓ Stappen succesvol bijgewerkt!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* Delta Input */}
        <div>
          <label className={cc.form.label()}>
            Stappen Toevoegen/Aftrekken
          </label>
          <input
            type="number"
            value={deltaSteps}
            onChange={(e) => setDeltaSteps(e.target.value)}
            placeholder="Gebruik + of - om aan te passen (bijv. 1000 of -500)"
            className={cc.form.input()}
            required
            disabled={submitting || success}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Positieve waarde om toe te voegen, negatieve om af te trekken
          </p>
        </div>

        {/* Preview */}
        {deltaSteps && !isNaN(parseInt(deltaSteps)) && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Nieuwe totaal:{' '}
              <span className="font-bold">
                {Math.max(0, (participant.steps || 0) + parseInt(deltaSteps)).toLocaleString()}
              </span>
              {' '}stappen
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={cc.button.base({ color: 'secondary' })}
            disabled={submitting || success}
          >
            Annuleren
          </button>
          <button
            type="submit"
            className={cc.button.base({ color: 'primary' })}
            disabled={submitting || !deltaSteps || success}
          >
            {submitting ? 'Bijwerken...' : success ? 'Bijgewerkt!' : 'Bijwerken'}
          </button>
        </div>
      </form>
    </Modal>
  );
}