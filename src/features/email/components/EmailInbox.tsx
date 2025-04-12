import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Divider,
  Typography,
  Badge,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  SelectChangeEvent,
  Button,
  Pagination,
  Alert,
  Snackbar
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'; // Icon for fetch
import DeleteIcon from '@mui/icons-material/Delete'; // Icon for delete
import type { Email } from '../types'
import { adminEmailService } from '../adminEmailService'
import EmailItem from './EmailItem'
import EmailDetail from './EmailDetail'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { usePageTitle } from '../../../hooks/usePageTitle'

interface Props {
  account?: 'info' | 'inschrijving'
}

const EMAILS_PER_PAGE = 20; // Adjust as needed

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
  const [isFetchingNew, setIsFetchingNew] = useState(false) // State for manual fetch
  const [fetchStatus, setFetchStatus] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0); // Needs backend support

  const totalPages = Math.ceil(totalEmails / EMAILS_PER_PAGE);

  // Functie om emails te laden met paginering
  const loadEmails = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    setSelectedEmailId(null) // Deselect email when changing page/account
    setSelectedEmail(null)
    console.log(`[EmailInbox] loadEmails called for page ${page}`);
    try {
      const offset = (page - 1) * EMAILS_PER_PAGE;
      const result = await adminEmailService.getEmailsByAccount(
        selectedAccount,
        EMAILS_PER_PAGE,
        offset
      );
      console.log('[EmailInbox] Data received from service:', result);
      setEmails(result.emails)
      setTotalEmails(result.totalCount); // Use the count from the service
      setCurrentPage(page);
      console.log('[EmailInbox] State updated. Emails count:', result.emails.length, 'Total count:', result.totalCount);
    } catch (err) {
      console.error('[EmailInbox] Error fetching emails:', err)
      setError('Fout bij het ophalen van e-mails. Probeer het later opnieuw.')
      setTotalEmails(0); // Reset on error
      setEmails([]); // Clear emails on error
    } finally {
      setIsLoading(false)
      console.log('[EmailInbox] isLoading set to false');
    }
  }

  // Functie om een specifieke email op te halen
  const fetchEmailDetail = async (id: string) => {
    setIsFetchingDetail(true)
    try {
      const email = await adminEmailService.getEmailDetails(id)
      if (email) {
        setSelectedEmail(email)
        
        // Als de email nog niet als gelezen is gemarkeerd, doe dat nu
        if (!email.read) {
          await adminEmailService.markAsRead(id, true)
          // Update de lokale staat om de lijst te updaten
          setEmails(prev => 
            prev.map(e => e.id === id ? { ...e, read: true } : e)
          )
        }
      } else {
        // Email not found (possibly deleted)
        setError('E-mail niet gevonden. Deze is mogelijk verwijderd.');
        setSelectedEmailId(null); // Deselect
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('Error fetching email details:', err)
      setError('Fout bij het ophalen van e-maildetails.')
    } finally {
      setIsFetchingDetail(false)
    }
  }

  // Trigger handmatig ophalen van nieuwe emails
  const handleFetchNewEmails = async () => {
    setIsFetchingNew(true);
    setFetchStatus({ open: false, message: '', severity: 'success' });
    try {
      const result = await adminEmailService.fetchNewEmails();
      setFetchStatus({
        open: true,
        message: result.message || `Ophalen voltooid: ${result.saved_count} nieuwe emails opgeslagen.`,
        severity: 'success'
      });
      // Refresh the current list after fetching
      handleRefresh();
    } catch (err) {
      console.error('Error triggering email fetch:', err);
      setFetchStatus({
        open: true,
        message: err instanceof Error ? err.message : 'Fout bij het ophalen van nieuwe emails.',
        severity: 'error'
      });
    } finally {
      setIsFetchingNew(false);
    }
  };

  // Handle delete email
  const handleDeleteEmail = async (id: string) => {
     if (!window.confirm('Weet je zeker dat je deze e-mail wilt verwijderen?')) {
       return;
     }
     try {
       await adminEmailService.deleteEmail(id);
       // Remove from local state and deselect
       setEmails(prev => prev.filter(e => e.id !== id));
       setSelectedEmailId(null);
       setSelectedEmail(null);
       // Optionally show success message
       setFetchStatus({ open: true, message: 'E-mail succesvol verwijderd.', severity: 'success' });
       // TODO: Adjust totalEmails count if backend doesn't auto-update it on next fetch

     } catch (err) {
       console.error('Error deleting email:', err);
       setError(err instanceof Error ? err.message : 'Fout bij het verwijderen van de e-mail.');
     }
   };

  // Laad emails wanneer account verandert of handmatig vernieuwd wordt
  useEffect(() => {
    loadEmails(1) // Load first page on account change or refresh
  }, [selectedAccount, refreshTrigger])

  // Laad email detail wanneer een email geselecteerd wordt
  useEffect(() => {
    if (selectedEmailId) {
      fetchEmailDetail(selectedEmailId)
    } else {
      setSelectedEmail(null)
    }
  }, [selectedEmailId])

  // Filter en sorteer emails - sorting remains client-side for the current page
  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => {
      // Eerst sorteren op gelezen status
      if (a.read !== b.read) {
        return a.read ? 1 : -1
      }
      // Dan op datum
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [emails])

  // Functie om het aantal ongelezen e-mails te berekenen (alleen voor de huidige pagina)
  const unreadCount = useMemo(() => {
    return emails.filter(email => !email.read).length
  }, [emails])

  // Vernieuw de emails handmatig (laadt huidige pagina opnieuw)
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    loadEmails(value);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
     if (reason === 'clickaway') {
       return;
     }
     setFetchStatus({ ...fetchStatus, open: false });
   };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 100px)', // Adjust height based on your layout
      overflow: 'hidden'
    }}>
      {/* Header Area */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        flexShrink: 0 
      }}>
        <Typography variant="h5" fontWeight="bold">
          Inbox
          {/* Note: unreadCount now only reflects the current page */}
          {/* Consider fetching total unread count separately if needed globally */}
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           {/* Fetch New Emails Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={isFetchingNew ? <CircularProgress size={16} /> : <CloudDownloadIcon />}
            onClick={handleFetchNewEmails}
            disabled={isFetchingNew || isLoading}
          >
            Nieuwe Ophalen
          </Button>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="account-select-label">Account</InputLabel>
            <Select
              labelId="account-select-label"
              value={selectedAccount}
              label="Account"
              onChange={(e: SelectChangeEvent<"info" | "inschrijving">) => setSelectedAccount(e.target.value as 'info' | 'inschrijving')}
              disabled={isLoading || isFetchingNew}
            >
              <MenuItem value="info">info@</MenuItem>
              <MenuItem value="inschrijving">inschrijving@</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton 
            onClick={handleRefresh} 
            disabled={isLoading || isFetchingNew}
            aria-label="Vernieuwen"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Main Content Area */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1, // Allow this area to grow
        overflow: 'hidden' 
      }}>
        {/* Email list */}
        <Box sx={{ 
          width: '350px', 
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%'
        }}>
          {/* Email List Items (Scrollable) */}
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
            )}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : sortedEmails.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Geen e-mails gevonden
                </Typography>
              </Box>
            ) : (
              sortedEmails.map(email => (
                <EmailItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmailId === email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  formattedDate={formatDistanceToNow(new Date(email.created_at), {
                    addSuffix: true,
                    locale: nl
                  })}
                />
              ))
            )}
          </Box>
          {/* Pagination (Fixed at the bottom of the list) */}
          {totalPages > 1 && !isLoading && (
             <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
               <Pagination 
                 count={totalPages} 
                 page={currentPage} 
                 onChange={handlePageChange} 
                 color="primary"
                 size="small"
                 siblingCount={0} // Adjust for smaller screens if needed
               />
             </Box>
          )}
        </Box>
        
        {/* Email detail */} 
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, height: '100%' }}>
          {selectedEmailId ? (
            isFetchingDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : selectedEmail ? (
               <>
                 {/* Delete Button in Detail View */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                     <IconButton 
                       aria-label="Verwijder e-mail"
                       onClick={() => handleDeleteEmail(selectedEmail.id)}
                       color="error"
                       size="small"
                     >
                       <DeleteIcon />
                     </IconButton>
                   </Box>
                 <EmailDetail email={selectedEmail} />
               </>
            ) : error ? (
                 // Show error specific to detail fetching if any
                  <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
              ) : (
               <Typography>Fout bij het laden van e-mail.</Typography>
             )
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              flexDirection: 'column',
              color: 'text.secondary'
            }}>
              {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              <Typography variant="h6">Selecteer een e-mail</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Klik op een e-mail in de lijst om deze te bekijken
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar for fetch status */}
       <Snackbar
         open={fetchStatus.open}
         autoHideDuration={6000}
         onClose={handleCloseSnackbar}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
       >
         <Alert onClose={handleCloseSnackbar} severity={fetchStatus.severity} sx={{ width: '100%' }}>
           {fetchStatus.message}
         </Alert>
       </Snackbar>
    </Box>
  )
} 