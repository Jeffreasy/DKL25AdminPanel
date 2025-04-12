import { adminEmailService } from '../features/email/adminEmailService'

const testEmail = async () => {
  try {
    // Test N8N email sending (nu via custom backend)
    console.log('Testing admin email sending...')
    const sendResult = await adminEmailService.sendAdminEmail({
      to: 'test@example.com',
      from: 'no-reply@dekoninklijkeloop.nl',
      subject: 'Test Email',
      body: '<p>Dit is een test email via sendAdminEmail</p>'
    })
    console.log('Send result:', sendResult)

    // Test email verification - VERWIJDERD
    // console.log('\nTesting email verification...')
    // const verifyResult = await adminEmailService.verifyEmailAddress('test@example.com')
    // console.log('Verification result:', verifyResult)

  } catch (error) {
    console.error('Error during email test:', error)
  }
}

// Alleen uitvoeren als expliciet aangeroepen
if (process.env.NODE_ENV === 'development' && process.env.RUN_EMAIL_TEST) {
  testEmail()
} 