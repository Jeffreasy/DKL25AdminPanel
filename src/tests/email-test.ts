import { adminEmailService } from '../features/email/adminEmailService'

const testEmail = async () => {
  try {
    // Test N8N email sending
    console.log('Testing N8N email sending...')
    const sendResult = await adminEmailService.sendAdminEmail({
      to: 'test@example.com',
      from: 'no-reply@dekoninklijkeloop.nl',
      subject: 'Test Email',
      body: '<p>Dit is een test email via N8N</p>'
    })
    console.log('Send result:', sendResult)

    // Test email verification
    console.log('\nTesting email verification...')
    const verifyResult = await adminEmailService.verifyEmailAddress('test@example.com')
    console.log('Verification result:', verifyResult)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Alleen uitvoeren als expliciet aangeroepen
if (process.env.NODE_ENV === 'development' && process.env.RUN_EMAIL_TEST) {
  testEmail()
} 