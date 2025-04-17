import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { RichTextEditor } from '@mantine/tiptap'
import { Select, TextInput, Button, Group, Stack, Text, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  recipient: {
    email: string
    name: string
  }
  onSend: (data: { subject: string; body: string }) => Promise<void>
}

// Email templates
const EMAIL_TEMPLATES = {
  default: {
    subject: 'Re: Bericht aan DKL25',
    content: (name: string) => `<p>Beste ${name},</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  },
  info: {
    subject: 'Informatie DKL25',
    content: (name: string) => `<p>Beste ${name},</p><p><br></p><p>Bedankt voor uw interesse in De Koninklijke Loop 2025.</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  },
  aanmelding: {
    subject: 'Bevestiging aanmelding DKL25',
    content: (name: string) => `<p>Beste ${name},</p><p><br></p><p>Hartelijk dank voor uw aanmelding voor De Koninklijke Loop 2025.</p><p>We hebben uw aanmelding in goede orde ontvangen.</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  },
  contact: {
    subject: 'Contact DKL25',
    content: (name: string) => `<p>Beste ${name},</p><p><br></p><p>Bedankt voor uw bericht. We nemen zo spoedig mogelijk contact met u op.</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  }
} as const

type TemplateKey = keyof typeof EMAIL_TEMPLATES

const TEMPLATE_OPTIONS = Object.entries(EMAIL_TEMPLATES).map(([key, value]) => ({
  value: key,
  label: value.subject // Use subject as label, or create specific labels
}));

export function EmailDialog({ isOpen, onClose, recipient, onSend }: EmailDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('default')
  const [subject, setSubject] = useState<string>(EMAIL_TEMPLATES.default.subject)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null); // State for internal error display

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: EMAIL_TEMPLATES[selectedTemplate].content(recipient.name),
    onCreate: ({ editor }) => {
      // Focus the editor when the dialog opens/template changes
      editor.commands.focus();
    }
  })

  // Effect to reset subject/content when template changes
  useEffect(() => {
    setSubject(EMAIL_TEMPLATES[selectedTemplate].subject)
    editor?.commands.setContent(EMAIL_TEMPLATES[selectedTemplate].content(recipient.name))
    editor?.commands.focus();
  }, [selectedTemplate, editor, recipient.name])

  // Effect to reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset to default when opened
      setSelectedTemplate('default');
      setSubject(EMAIL_TEMPLATES.default.subject);
      editor?.commands.setContent(EMAIL_TEMPLATES.default.content(recipient.name));
      setError(null);
      setSending(false);
    } else {
      // Clear editor content when closing to prevent stale content flash
      editor?.commands.clearContent();
    }
  }, [isOpen, editor, recipient.name]);

  const handleSend = async () => {
    if (!subject.trim() || !editor?.getText().trim()) {
      setError("Onderwerp en bericht mogen niet leeg zijn.");
      return;
    }
    
    setError(null); // Clear previous errors
    setSending(true);
    try {
      await onSend({
        subject,
        body: editor?.getHTML() || ''
        // 'from' is no longer needed here
      });
      onClose(); // Close dialog on success
    } catch (err) { // Catch error from the onSend promise
      console.error('Failed to send email:', err);
      setError(err instanceof Error ? err.message : 'Verzenden van e-mail mislukt.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      {/* Using Mantine Modal might be cleaner, but sticking with Headless UI for now */}
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
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-left">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  Email Opstellen
                </Dialog.Title>

                <Stack gap="md">
                  {/* Error Display */}
                  {error && (
                    <Alert icon={<IconAlertCircle size="1rem" />} title="Fout" color="red" withCloseButton onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}
                  
                  {/* Recipient Info */}
                  <Group >
                    <Text size="sm" fw={500} c="dimmed" style={{ width: '80px' }}>Aan:</Text>
                    <Text size="sm">{recipient.name} ({recipient.email})</Text>
                  </Group>

                  {/* Template Selector */}
                  <Select
                    label="Template"
                    placeholder="Kies een template"
                    data={TEMPLATE_OPTIONS}
                    value={selectedTemplate}
                    onChange={(value) => setSelectedTemplate(value as TemplateKey || 'default')}
                    allowDeselect={false}
                  />

                  {/* Subject Input */}
                  <TextInput
                    label="Onderwerp"
                    placeholder="Voer een onderwerp in..."
                    required
                    value={subject}
                    onChange={(event) => setSubject(event.currentTarget.value)}
                  />

                  {/* Message Body */}
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Bericht</Text>
                    <RichTextEditor editor={editor} style={{ minHeight: 200 }}>
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
                  </Stack>

                  {/* Action Buttons */}
                  <Group justify="flex-end" mt="lg">
                    <Button variant="default" onClick={onClose}>
                      Annuleren
                    </Button>
                    <Button 
                      onClick={handleSend} 
                      loading={sending}
                      disabled={!subject.trim() || !editor?.getText().trim()} // Disable if subject or body is empty
                    >
                      Verstuur
                    </Button>
                  </Group>
                </Stack>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 