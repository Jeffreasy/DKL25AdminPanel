import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { RichTextEditor } from '@mantine/tiptap'
import { adminEmailService } from '../../features/email/adminEmailService'
import { EmailVerification } from './EmailVerification'

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  recipient: {
    email: string
    name: string
  }
  onSend: (data: { subject: string; body: string; from: string }) => Promise<void>
}

// Email templates
const EMAIL_TEMPLATES = {
  default: {
    subject: 'Re: Bericht aan DKL25',
    content: (name: string) => `
      <p>Beste ${name},</p>
      <p><br></p>
      <p>Met vriendelijke groet,</p>
      <p>DKL25 Team</p>
    `
  },
  info: {
    subject: 'Informatie DKL25',
    content: (name: string) => `
      <p>Beste ${name},</p>
      <p><br></p>
      <p>Bedankt voor uw interesse in De Koninklijke Loop 2025.</p>
      <p><br></p>
      <p>Met vriendelijke groet,</p>
      <p>DKL25 Team</p>
    `
  },
  aanmelding: {
    subject: 'Bevestiging aanmelding DKL25',
    content: (name: string) => `
      <p>Beste ${name},</p>
      <p><br></p>
      <p>Hartelijk dank voor uw aanmelding voor De Koninklijke Loop 2025.</p>
      <p>We hebben uw aanmelding in goede orde ontvangen.</p>
      <p><br></p>
      <p>Met vriendelijke groet,</p>
      <p>DKL25 Team</p>
    `
  },
  contact: {
    subject: 'Contact DKL25',
    content: (name: string) => `
      <p>Beste ${name},</p>
      <p><br></p>
      <p>Bedankt voor uw bericht. We nemen zo spoedig mogelijk contact met u op.</p>
      <p><br></p>
      <p>Met vriendelijke groet,</p>
      <p>DKL25 Team</p>
    `
  }
} as const

type TemplateKey = keyof typeof EMAIL_TEMPLATES

// Voeg email opties toe
const SENDER_EMAILS = [
  { value: 'info@dekoninklijkeloop.nl', label: 'Info DKL25' },
  { value: 'postmaster@dekoninklijkeloop.nl', label: 'Postmaster' },
  { value: 'no-reply@dekoninklijkeloop.nl', label: 'No Reply' },
  { value: 'jeffrey@dekoninklijkeloop.nl', label: 'Jeffrey' },
  { value: 'salih@dekoninklijkeloop.nl', label: 'Salih' },
  { value: 'marieke@dekoninklijkeloop.nl', label: 'Marieke' }
] as const

type SenderEmailValue = typeof SENDER_EMAILS[number]['value']

export function EmailDialog({ isOpen, onClose, recipient, onSend }: EmailDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('default')
  const [subject, setSubject] = useState<string>(EMAIL_TEMPLATES.default.subject)
  const [sending, setSending] = useState(false)
  const [senderEmail, setSenderEmail] = useState<SenderEmailValue>(SENDER_EMAILS[0].value)
  const [needsVerification, setNeedsVerification] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: EMAIL_TEMPLATES[selectedTemplate].content(recipient.name)
  })

  useEffect(() => {
    // Check of het geselecteerde email adres geverifieerd is
    adminEmailService.checkEmailVerification(senderEmail)
      .then((isVerified: boolean) => setNeedsVerification(!isVerified))
      .catch(console.error)
  }, [senderEmail])

  // Update content when template changes
  const handleTemplateChange = (template: TemplateKey) => {
    setSelectedTemplate(template)
    setSubject(EMAIL_TEMPLATES[template].subject)
    editor?.commands.setContent(EMAIL_TEMPLATES[template].content(recipient.name))
  }

  const handleSend = async () => {
    try {
      setSending(true)
      await onSend({
        subject,
        body: editor?.getHTML() || '',
        from: senderEmail
      })
      onClose()
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Email Opstellen
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aan</label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
                      {recipient.name} ({recipient.email})
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateChange(e.target.value as TemplateKey)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="default">Standaard antwoord</option>
                      <option value="info">Informatie</option>
                      <option value="aanmelding">Aanmelding bevestiging</option>
                      <option value="contact">Contact bevestiging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Onderwerp</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Voer een onderwerp in..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Van</label>
                    <select
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value as SenderEmailValue)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {SENDER_EMAILS.map(email => (
                        <option key={email.value} value={email.value}>
                          {email.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bericht</label>
                    <div className="border rounded-md">
                      <RichTextEditor editor={editor}>
                        <RichTextEditor.Toolbar sticky stickyOffset={60}>
                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Underline />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.BulletList />
                            <RichTextEditor.OrderedList />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Link />
                            <RichTextEditor.Unlink />
                          </RichTextEditor.ControlsGroup>
                        </RichTextEditor.Toolbar>

                        <RichTextEditor.Content />
                      </RichTextEditor>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuleren
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!subject.trim() || !editor?.getText().trim() || sending}
                      className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {sending ? 'Versturen...' : 'Verstuur'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      {needsVerification && (
        <EmailVerification 
          email={senderEmail} 
          onVerified={() => setNeedsVerification(false)}
        />
      )}
    </Transition>
  )
} 