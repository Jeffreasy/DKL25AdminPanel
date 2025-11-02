import { useState, useEffect } from 'react';
import { stepsClient } from '../../../../api/client/stepsClient';
import type { RouteFund } from '../../types';
import { cc } from '../../../../styles/shared';
import { LoadingGrid, Modal, ConfirmDialog } from '../../../../components/ui';

/**
 * RouteFundsManager Component
 * Admin interface for managing route funds allocation
 */
export function RouteFundsManager() {
  const [funds, setFunds] = useState<RouteFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFund, setEditingFund] = useState<RouteFund | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fundToDelete, setFundToDelete] = useState<RouteFund | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadFunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stepsClient.getRouteFunds();
      setFunds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon route funds niet laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const handleUpdate = async (fund: RouteFund, newAmount: number) => {
    try {
      await stepsClient.updateRouteFund(fund.route, newAmount);
      setSuccessMessage(`${fund.route} bijgewerkt naar €${newAmount}`);
      await loadFunds();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon fund niet bijwerken');
    }
  };

  const handleCreate = async (route: string, amount: number) => {
    try {
      await stepsClient.createRouteFund(route, amount);
      setSuccessMessage(`${route} aangemaakt met €${amount}`);
      setShowCreateModal(false);
      await loadFunds();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon fund niet aanmaken');
    }
  };

  const handleDelete = async () => {
    if (!fundToDelete) return;

    try {
      await stepsClient.deleteRouteFund(fundToDelete.route);
      setSuccessMessage(`${fundToDelete.route} verwijderd`);
      setShowDeleteConfirm(false);
      setFundToDelete(null);
      await loadFunds();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon fund niet verwijderen');
    }
  };

  if (loading) {
    return <LoadingGrid count={4} variant="compact" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Route Fondsen Beheer
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Beheer toegewezen fondsen per route
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={cc.button.base({ color: 'primary' })}
        >
          + Nieuwe Route
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            ✓ {successMessage}
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

      {/* Funds Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bedrag (€)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Laatst Bijgewerkt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {funds.map((fund) => (
              <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {fund.route}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingFund?.id === fund.id ? (
                    <input
                      type="number"
                      defaultValue={fund.amount}
                      className={cc.form.input({ className: 'w-32' })}
                      onBlur={(e) => {
                        const newAmount = parseInt(e.target.value);
                        if (newAmount !== fund.amount && newAmount >= 0) {
                          handleUpdate(fund, newAmount);
                        }
                        setEditingFund(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-gray-900 dark:text-white">
                      €{fund.amount}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(fund.updated_at).toLocaleDateString('nl-NL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingFund(fund)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => {
                      setFundToDelete(fund);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    Verwijderen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {funds.length === 0 && (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Geen route funds
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Voeg je eerste route fund toe om te beginnen.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateRouteFundModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setFundToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Route Fund Verwijderen"
        message={`Weet je zeker dat je ${fundToDelete?.route} met €${fundToDelete?.amount} wilt verwijderen?`}
        confirmText="Ja, verwijderen"
        cancelText="Annuleren"
        variant="danger"
      />
    </div>
  );
}

interface CreateRouteFundModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (route: string, amount: number) => Promise<void>;
}

function CreateRouteFundModal({ open, onClose, onCreate }: CreateRouteFundModalProps) {
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!route || !amount) return;

    setSubmitting(true);
    try {
      await onCreate(route, parseInt(amount));
      setRoute('');
      setAmount('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Nieuwe Route Fund">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={cc.form.label()}>Route Naam</label>
          <input
            type="text"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder='bijv. "25 KM"'
            className={cc.form.input()}
            required
          />
        </div>

        <div>
          <label className={cc.form.label()}>Bedrag (€)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="0"
            className={cc.form.input()}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={cc.button.base({ color: 'secondary' })}
            disabled={submitting}
          >
            Annuleren
          </button>
          <button
            type="submit"
            className={cc.button.base({ color: 'primary' })}
            disabled={submitting || !route || !amount}
          >
            {submitting ? 'Aanmaken...' : 'Aanmaken'}
          </button>
        </div>
      </form>
    </Modal>
  );
}