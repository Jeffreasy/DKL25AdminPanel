import React, { useEffect, useMemo, useState } from 'react'
import { Box, Divider, Typography, Badge, IconButton, Select, MenuItem, FormControl, InputLabel, CircularProgress, SelectChangeEvent } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
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

  // Functie om emails te laden
  const loadEmails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminEmailService.getEmailsByAccount(selectedAccount)
      setEmails(data)
    } catch (err) {
      console.error('Error fetching emails:', err)
      setError('Fout bij het ophalen van e-mails. Probeer het later opnieuw.')
    } finally {
      setIsLoading(false)
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
      }
    } catch (err) {
      console.error('Error fetching email details:', err)
      setError('Fout bij het ophalen van e-maildetails.')
    } finally {
      setIsFetchingDetail(false)
    }
  }

  // Laad emails wanneer account verandert of handmatig vernieuwd wordt
  useEffect(() => {
    loadEmails()
  }, [selectedAccount, refreshTrigger])

  // Laad email detail wanneer een email geselecteerd wordt
  useEffect(() => {
    if (selectedEmailId) {
      fetchEmailDetail(selectedEmailId)
    } else {
      setSelectedEmail(null)
    }
  }, [selectedEmailId])

  // Filter en sorteer emails
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

  // Functie om het aantal ongelezen e-mails te berekenen
  const unreadCount = useMemo(() => {
    return emails.filter(email => !email.read).length
  }, [emails])

  // Vernieuw de emails handmatig
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 100px)', 
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2 
      }}>
        <Typography variant="h5" fontWeight="bold">
          Inbox
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="account-select-label">Account</InputLabel>
            <Select
              labelId="account-select-label"
              value={selectedAccount}
              label="Account"
              onChange={(e: SelectChangeEvent<"info" | "inschrijving">) => setSelectedAccount(e.target.value as 'info' | 'inschrijving')}
            >
              <MenuItem value="info">info@</MenuItem>
              <MenuItem value="inschrijving">inschrijving@</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton 
            onClick={handleRefresh} 
            disabled={isLoading}
            aria-label="Vernieuwen"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      {error && (
        <Box sx={{ p: 2, color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        height: 'calc(100% - 60px)', 
        overflow: 'hidden' 
      }}>
        {/* Email list */}
        <Box sx={{ 
          width: '350px', 
          borderRight: '1px solid', 
          borderColor: 'divider', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
        
        {/* Email detail */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, height: '100%' }}>
          {selectedEmailId ? (
            isFetchingDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : selectedEmail ? (
              <EmailDetail email={selectedEmail} />
            ) : (
              <Typography>Fout bij het laden van e-mail</Typography>
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
              <Typography variant="h6">Selecteer een e-mail</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Klik op een e-mail in de lijst om deze te bekijken
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
} 