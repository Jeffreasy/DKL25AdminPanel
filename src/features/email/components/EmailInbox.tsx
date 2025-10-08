import React, { useEffect, useMemo, useState, Fragment } from 'react'
import { Listbox, Dialog, Transition } from '@headlessui/react'
import {
  ArrowPathIcon,
  CloudArrowDownIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import type { Email } from '../types'
import { adminEmailService } from '../adminEmailService'
import { supabase } from '../../../api/client/supabase'
import { EmailDialog } from './EmailDialog'
import EmailItem from './EmailItem'
import EmailDetail from './EmailDetail'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { cc } from '../../../styles/shared'
import { ConfirmDialog, EmptyState, LoadingGrid } from '../../../components/ui'

interface Props {
  account?: 'info' | 'inschrijving'
}

const EMAILS_PER_PAGE = 20;

export default function EmailInbox({ account = 'info' }: Props) {
  usePageTitle('Email Inbox')

  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFetchingDetail, setIsFetchingDetail] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<'info' | 'inschrijving'>(account)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isFetchingNew, setIsFetchingNew] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewEmailDialogOpen, setIsNewEmailDialogOpen] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null);
  const [suggestionEmails, setSuggestionEmails] = useState<string[]>([]);

  const totalPages = Math.ceil(totalEmails / EMAILS_PER_PAGE);

  const loadEmails = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    setSelectedEmailId(null)
    setSelectedEmail(null)
    console.log(`[EmailInbox] loadEmails called for page ${page}`);
    try {
      const offset = (page - 1) * EMAILS_PER_PAGE;
      const { emails: fetchedEmails, totalCount: fetchedTotalCount } = await adminEmailService.getEmailsByAccount(
        selectedAccount,
        EMAILS_PER_PAGE,
        offset
      );
      console.log('[EmailInbox] Data received from service:', { fetchedEmails, fetchedTotalCount });
      setEmails(fetchedEmails)
      setTotalEmails(fetchedTotalCount);
      setCurrentPage(page);
      console.log('[EmailInbox] State updated. Emails count:', fetchedEmails.length, 'Total count:', fetchedTotalCount);
    } catch (err) {
      console.error('[EmailInbox] Error fetching emails:', err)
      setError('Fout bij het ophalen van e-mails. Probeer het later opnieuw.')
      setTotalEmails(0);
      setEmails([]);
    } finally {
      setIsLoading(false)
      console.log('[EmailInbox] isLoading set to false');
    }
  }

  const fetchEmailDetail = async (id: string) => {
    setIsFetchingDetail(true)
    try {
      const email = await adminEmailService.getEmailDetails(id)
      if (email) {
        setSelectedEmail(email)
        
        if (!email.read) {
          await adminEmailService.markAsRead(id, true)
          setEmails(prev => 
            prev.map(e => e.id === id ? { ...e, read: true } : e)
          )
        }
      } else {
        setError('E-mail niet gevonden. Deze is mogelijk verwijderd.');
        setSelectedEmailId(null);
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('Error fetching email details:', err)
      setError('Fout bij het ophalen van e-maildetails.')
    } finally {
      setIsFetchingDetail(false)
    }
  }

  const handleFetchNewEmails = async () => {
    setIsFetchingNew(true);
    try {
      const result = await adminEmailService.fetchNewEmails();
      toast.success(result.message || `Ophalen voltooid: ${result.saved_count} nieuwe emails opgeslagen.`);
      handleRefresh();
    } catch (err) {
      console.error('Error triggering email fetch:', err);
      toast.error(err instanceof Error ? err.message : 'Fout bij het ophalen van nieuwe emails.');
    } finally {
      setIsFetchingNew(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; emailId: string | null }>({
    isOpen: false,
    emailId: null
  });

  const handleDeleteEmail = async (id: string) => {
    setDeleteConfirm({ isOpen: true, emailId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.emailId) return;
    
    try {
      await adminEmailService.deleteEmail(deleteConfirm.emailId);
      setEmails(prev => prev.filter(e => e.id !== deleteConfirm.emailId));
      setSelectedEmailId(null);
      setSelectedEmail(null);
      toast.success('E-mail succesvol verwijderd.');
    } catch (err) {
      console.error('Error deleting email:', err);
      toast.error(err instanceof Error ? err.message : 'Fout bij het verwijderen van de e-mail.');
    } finally {
      setDeleteConfirm({ isOpen: false, emailId: null });
    }
  };

  useEffect(() => {
    loadEmails(1)
    
    const fetchInitialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setLoggedInUserEmail(user?.email || null);
        } catch (error) {
            console.error("Error fetching user email:", error);
        }
        try {
            const emails = await adminEmailService.fetchAanmeldingenEmails();
            setSuggestionEmails(emails);
        } catch (error) {
            console.error("Error fetching suggestion emails:", error);
        }
    };
    fetchInitialData();

  }, [selectedAccount, refreshTrigger])

  useEffect(() => {
    if (selectedEmailId) {
      fetchEmailDetail(selectedEmailId)
    } else {
      if(isModalOpen) {
          setIsModalOpen(false);
      }
    }
  }, [selectedEmailId])

  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [emails])

  const unreadCount = useMemo(() => {
    return emails.filter(email => !email.read).length
  }, [emails])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEmailClick = (id: string) => {
    setSelectedEmailId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const currentEmailIndex = useMemo(() => {
    if (!selectedEmailId) return -1;
    return sortedEmails.findIndex(email => email.id === selectedEmailId);
  }, [selectedEmailId, sortedEmails]);

  const canGoPrevious = currentEmailIndex > 0;
  const canGoNext = currentEmailIndex !== -1 && currentEmailIndex < sortedEmails.length - 1;

  const handlePreviousEmail = () => {
    if (canGoPrevious) {
      const previousEmailId = sortedEmails[currentEmailIndex - 1].id;
      setSelectedEmailId(previousEmailId);
    }
  };

  const handleNextEmail = () => {
    if (canGoNext) {
      const nextEmailId = sortedEmails[currentEmailIndex + 1].id;
      setSelectedEmailId(nextEmailId);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      loadEmails(newPage);
    }
  };

  const handleSendNewEmail = async (data: { to: string; subject: string; body: string; sender: string }) => {
      try {
          await adminEmailService.sendMailAsAdmin({
              to: data.to,
              subject: data.subject,
              body: data.body,
              from: 'info@dekoninklijkeloop.nl'
          });
          toast.success("E-mail succesvol verzonden.");
      } catch (error) {
          console.error('Failed to send new email via admin endpoint:', error);
          toast.error(error instanceof Error ? error.message : "Fout bij verzenden van e-mail.");
      }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className={`flex items-center justify-between ${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700 flex-wrap ${cc.spacing.gap.lg}`}>
          
          <div className="flex-shrink-0 w-48 z-10">
            <Listbox value={selectedAccount} onChange={setSelectedAccount}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                  <span className="block truncate text-gray-900 dark:text-white">
                    {selectedAccount === 'info' ? 'Info Account' : 'Inschrijving Account'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <Listbox.Option
                      key="info"
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`
                      }
                      value="info"
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            Info Account
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                    <Listbox.Option
                      key="inschrijving"
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`
                      }
                      value="inschrijving"
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            Inschrijving Account
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            {unreadCount} Ongelezen
          </div>

          <div className="flex-grow"></div>

          <div className={`flex items-center ${cc.spacing.gap.sm} flex-wrap`}>
            <button
              type="button"
              className={cc.button.base({ color: 'primary', size: 'sm' })} 
              onClick={() => setIsNewEmailDialogOpen(true)}
              disabled={!loggedInUserEmail}
            >
              Nieuwe Email
            </button>
            <button
              type="button"
              title="Nieuwe emails ophalen"
              className={cc.button.icon({ className: 'text-gray-500 dark:text-gray-400'})}
              onClick={handleFetchNewEmails}
              disabled={isFetchingNew}
            >
              {isFetchingNew ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <CloudArrowDownIcon className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              title="Vernieuwen"
              className={cc.button.icon({ className: 'text-gray-500 dark:text-gray-400'})}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
           <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden h-full">
              <div className="overflow-y-auto flex-grow">
                 {error && !isLoading && (
                    <div className="p-4 m-4 bg-red-100 dark:bg-red-800/80 text-red-700 dark:text-red-100 rounded-md text-sm">
                       {error}
                    </div>
                 )}
                 {isLoading ? (
                    <LoadingGrid count={5} variant="compact" />
                 ) : sortedEmails.length === 0 && !error ? (
                    <EmptyState
                      title="Geen e-mails"
                      description="Er zijn nog geen e-mails in deze inbox"
                    />
                 ) : (
                    <div>
                       {sortedEmails.map(email => (
                          <EmailItem
                             key={email.id}
                             email={email}
                             isSelected={selectedEmailId === email.id} 
                             onClick={() => handleEmailClick(email.id)} 
                             formattedDate={formatDistanceToNow(new Date(email.created_at), { addSuffix: true, locale: nl })}
                          />
                       ))}
                    </div>
                 )}
                 {totalPages > 1 && !isLoading && (
                    <div className={`${cc.spacing.container.xs} border-t border-gray-200 dark:border-gray-700 flex justify-center items-center ${cc.spacing.gap.sm} flex-shrink-0`}>
                       <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`${cc.button.icon({ color: 'secondary', className: "rounded-md" })} ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                          title="Vorige pagina"
                       >
                          <ArrowLeftIcon className="h-5 w-5" />
                       </button>
                       <span className="text-sm text-gray-700 dark:text-gray-300">
                          Pagina {currentPage} van {totalPages}
                       </span>
                       <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`${cc.button.icon({ color: 'secondary', className: "rounded-md" })} ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                          title="Volgende pagina"
                       >
                          <ArrowRightIcon className="h-5 w-5" />
                       </button>
                    </div>
                 )}
              </div>
           </div>
           <div className="hidden md:flex flex-1 flex-col overflow-hidden h-full">
              {selectedEmailId ? (
                 isFetchingDetail ? (
                    <LoadingGrid count={3} variant="compact" />
                 ) : selectedEmail ? (
                    <>
                       <div className={`flex justify-end ${cc.spacing.container.xs} border-b border-gray-200 dark:border-gray-700 flex-shrink-0`}>
                           <button 
                              aria-label="Verwijder e-mail"
                              onClick={() => handleDeleteEmail(selectedEmail.id)}
                              className={cc.button.iconDanger({ className: "rounded-md" })}
                              title="Verwijder"
                           >
                             <TrashIcon className="h-5 w-5" />
                           </button>
                       </div>
                       <div className="overflow-y-auto flex-1">
                           <EmailDetail email={selectedEmail} />
                       </div>
                    </>
                 ) : error ? (
                     <div className="p-4 m-4 bg-red-100 dark:bg-red-800/80 text-red-700 dark:text-red-100 rounded-md text-sm">
                        {error} 
                     </div>
                 ) : (
                    <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                       Fout bij het laden van e-mail.
                    </div>
                 )
              ) : (
                 <EmptyState
                   title="Selecteer een e-mail"
                   description="Klik op een e-mail in de lijst om deze te bekijken"
                 />
              )}
           </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            Pagination Placeholder
        </div>

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" id="mobile-email-dialog" className="relative z-20 md:hidden" onClose={handleCloseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-0 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full h-screen transform overflow-hidden bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all flex flex-col">
                    <div className={`flex justify-between items-center ${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700 flex-shrink-0`}>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white truncate pr-4">
                        {selectedEmail?.subject || 'Laden...'}
                      </Dialog.Title>
                      <div className={`flex items-center ${cc.spacing.gap.sm}`}>
                         <button 
                            aria-label="Verwijder e-mail"
                            onClick={() => selectedEmail && handleDeleteEmail(selectedEmail.id)}
                            className={cc.button.iconDanger({ className: "rounded-md" })}
                            title="Verwijder"
                            disabled={!selectedEmail || isFetchingDetail}
                         >
                           <TrashIcon className="h-5 w-5" />
                         </button>
                         <button type="button" className={cc.button.icon({ color: 'secondary' })} onClick={handleCloseModal} title="Sluiten">
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                         </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {isFetchingDetail ? (
                        <LoadingGrid count={3} variant="compact" />
                      ) : selectedEmail ? (
                        <EmailDetail email={selectedEmail} />
                      ) : error ? (
                        <div className="p-4 m-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                           {error}
                        </div>
                      ) : (
                         <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Kon email niet laden.
                         </div>
                      )}
                    </div>

                    <div className={`flex justify-between items-center ${cc.spacing.container.sm} border-t border-gray-200 dark:border-gray-700 flex-shrink-0`}>
                      <button 
                        onClick={handlePreviousEmail} 
                        disabled={!canGoPrevious}
                        className={`${cc.button.icon({ color: 'secondary' })} ${!canGoPrevious ? "opacity-50 cursor-not-allowed" : ""}`}
                        title="Vorige e-mail"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleNextEmail} 
                        disabled={!canGoNext}
                        className={`${cc.button.icon({ color: 'secondary' })} ${!canGoNext ? "opacity-50 cursor-not-allowed" : ""}`}
                        title="Volgende e-mail"
                      >
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      
      {loggedInUserEmail && (
          <EmailDialog
              isOpen={isNewEmailDialogOpen}
              onClose={() => setIsNewEmailDialogOpen(false)}
              initialSenderEmail={loggedInUserEmail}
              onSend={handleSendNewEmail}
              suggestionEmails={suggestionEmails}
          />
      )}

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, emailId: null })}
        onConfirm={confirmDelete}
        title="E-mail verwijderen"
        message="Weet je zeker dat je deze e-mail wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        variant="danger"
      />
    </>
  )
}