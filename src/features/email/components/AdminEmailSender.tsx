import React, { useState } from 'react';
import { adminEmailService } from '../adminEmailService';
import { TextField, Button, CircularProgress, Alert, Box, Typography } from '@mui/material';

export function AdminEmailSender() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(''); // Assuming HTML body
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!to || !subject || !body) {
      setError('Vul alsjeblieft ontvanger, onderwerp en bericht in.');
      setIsLoading(false);
      return;
    }

    try {
      await adminEmailService.sendMailAsAdmin({
        to: to.trim(),
        subject: subject.trim(),
        body: body // Assuming body is already HTML or backend handles markdown/plain text
      });
      setSuccess('E-mail succesvol verzonden!');
      // Optionally clear the form
      // setTo('');
      // setSubject('');
      // setBody('');
    } catch (err) {
      console.error("Send email error:", err);
      setError(err instanceof Error ? err.message : 'Kon de e-mail niet verzenden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom>
        Verstuur E-mail als Admin
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        margin="normal"
        required
        fullWidth
        id="to"
        label="Ontvanger(s) (komma-gescheiden)"
        name="to"
        autoComplete="email"
        autoFocus
        value={to}
        onChange={(e) => setTo(e.target.value)}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="subject"
        label="Onderwerp"
        name="subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="body"
        label="Bericht (HTML toegestaan)"
        name="body"
        multiline
        rows={10} // Adjust rows as needed
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={isLoading}
        placeholder='<p>Schrijf hier je bericht...</p>'
      />
      <Box sx={{ mt: 3, mb: 2, position: 'relative' }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
        >
          Verstuur E-mail
        </Button>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </Box>
  );
} 