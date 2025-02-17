import { emailService } from '../api/email'

const testEmail = async () => {
  try {
    // Test API endpoint
    console.log('Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/emails/save-email-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'test@example.com',
        subject: 'Test Email',
        body: 'Dit is een test email',
        html: '<p>Dit is een test email</p>',
        account: 'info',
        message_id: 'test-123',
        attachments: []
      })
    })

    const data = await response.json()
    console.log('API Response:', data)

    // Test email service
    console.log('\nTesting email service...')
    const emails = await emailService.getEmails({ limit: 1 })
    console.log('Latest email:', emails.items[0])

    // Test email verification
    console.log('\nTesting email verification...')
    const validEmail = emailService.verifyEmailAddress('info@dekoninklijkeloop.nl')
    const invalidEmail = emailService.verifyEmailAddress('test@example.com')
    console.log('Valid email check:', validEmail)
    console.log('Invalid email check:', invalidEmail)

  } catch (error) {
    console.error('Error:', error)
  }
}

testEmail() 