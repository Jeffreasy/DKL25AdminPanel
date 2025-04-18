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
import EmailItem from './EmailItem'
import EmailDetail from './EmailDetail'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { cl } from '../../../styles/shared'
import { cc } from '../../../styles/shared'

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

  const handleDeleteEmail = async (id: string) => {
     if (!window.confirm('Weet je zeker dat je deze e-mail wilt verwijderen?')) {
       return;
     }
     try {
       await adminEmailService.deleteEmail(id);
       setEmails(prev => prev.filter(e => e.id !== id));
       setSelectedEmailId(null);
       setSelectedEmail(null);
       toast.success('E-mail succesvol verwijderd.');
     } catch (err) {
       console.error('Error deleting email:', err);
       toast.error(err instanceof Error ? err.message : 'Fout bij het verwijderen van de e-mail.');
     }
   };

  useEffect(() => {
    loadEmails(1)
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
    const element = document.getElementById('mobile-email-dialog');
    if (element && window.getComputedStyle(element).display !== 'none') {
       setIsModalOpen(true);
    }
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-4">
        
        <div className="flex-shrink-0 w-48 z-10">
          <Listbox value={selectedAccount} onChange={setSelectedAccount}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                <span className="block truncate text-gray-900 dark:text-gray-100">
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
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'}`
                    }
                    value="info"
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          Info Account
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                  <Listbox.Option
                    key="inschrijving"
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'}`
                    }
                    value="inschrijving"
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          Inschrijving Account
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
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

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={cc.button.icon({ color: 'secondary', className: "rounded-md border border-gray-300 dark:border-gray-600" })}
            title="Vernieuwen"
            disabled={isLoading || isFetchingNew}
          >
            <ArrowPathIcon className={cl("h-5 w-5", (isLoading || isFetchingNew) && "animate-spin")} />
          </button>
          <button 
            onClick={handleFetchNewEmails}
            className={cc.button.base({ color: 'secondary', className: "flex items-center gap-1.5" })}
            disabled={isFetchingNew || isLoading}
          >
            {isFetchingNew ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Ophalen...</span>
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="h-5 w-5" />
                <span>Nieuwe ophalen</span>
              </>
            )}
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
                  <div className="flex justify-center items-center h-full p-8">
                     <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
               ) : sortedEmails.length === 0 && !error ? (
                  <div className="flex justify-center items-center h-full p-4 text-center text-gray-500 dark:text-gray-400">
                     Geen e-mails gevonden
                  </div>
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
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center gap-2 flex-shrink-0">
                     <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={cl(cc.button.icon({ color: 'secondary', className: "rounded-md" }), currentPage === 1 && "opacity-50 cursor-not-allowed")}
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
                        className={cl(cc.button.icon({ color: 'secondary', className: "rounded-md" }), currentPage === totalPages && "opacity-50 cursor-not-allowed")}
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
                  <div className="flex justify-center items-center h-full">
                     <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
               ) : selectedEmail ? (
                  <>
                     <div className="flex justify-end p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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
               <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 dark:text-gray-400 px-4">
                  {error && (
                     <div className="p-4 mb-4 bg-red-100 dark:bg-red-800/80 text-red-700 dark:text-red-100 rounded-md text-sm">
                        {error}
                     </div>
                  )}
                  <h3 className="text-lg font-medium">Selecteer een e-mail</h3>
                  <p className="mt-1 text-sm">
                     Klik op een e-mail in de lijst om deze te bekijken.
                  </p>
               </div>
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
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 truncate pr-4">
                      {selectedEmail?.subject || 'Laden...'}
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
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
                      <div className="flex justify-center items-center h-full p-8">
                         <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-500" />
                      </div>
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

                  <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button 
                      onClick={handlePreviousEmail} 
                      disabled={!canGoPrevious}
                      className={cl(cc.button.icon({ color: 'secondary' }), !canGoPrevious && "opacity-50 cursor-not-allowed")}
                      title="Vorige e-mail"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleNextEmail} 
                      disabled={!canGoNext}
                      className={cl(cc.button.icon({ color: 'secondary' }), !canGoNext && "opacity-50 cursor-not-allowed")}
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
  )
} 