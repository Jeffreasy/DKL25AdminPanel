import { Box, Typography, Paper, Divider, Card } from '@mui/material'
import type { Email } from '../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface EmailDetailProps {
  email: Email
}

export default function EmailDetail({ email }: EmailDetailProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          {email.subject}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            <strong>Van:</strong> {email.sender}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {format(new Date(email.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
          </Typography>
        </Box>
        
        {email.metadata && email.metadata['delivered-to'] && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Aan:</strong> {email.metadata['delivered-to']}
          </Typography>
        )}
        
        {email.metadata && email.metadata['reply-to'] && (
          <Typography variant="body2">
            <strong>Antwoorden aan:</strong> {email.metadata['reply-to']}
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
        {email.html ? (
          <Box
            sx={{
              '& a': { color: 'primary.main' },
              '& img': { maxWidth: '100%', height: 'auto' }
            }}
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        ) : (
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              margin: 0
            }}
          >
            {email.body}
          </Typography>
        )}
      </Box>
    </Card>
  )
} 