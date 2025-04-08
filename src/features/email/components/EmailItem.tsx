import { Box, Typography } from '@mui/material'
import type { Email } from '../types'

interface EmailItemProps {
  email: Email
  isSelected: boolean
  onClick: () => void
  formattedDate: string
}

export default function EmailItem({ email, isSelected, onClick, formattedDate }: EmailItemProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        backgroundColor: isSelected 
          ? 'action.selected' 
          : email.read ? 'background.paper' : 'action.hover',
        '&:hover': {
          backgroundColor: isSelected ? 'action.selected' : 'action.hover',
        },
        transition: 'background-color 0.2s'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: email.read ? 'normal' : 'bold',
            maxWidth: '70%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {email.sender}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formattedDate}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: email.read ? 'normal' : 'medium'
        }}
      >
        {email.subject}
      </Typography>
    </Box>
  )
} 