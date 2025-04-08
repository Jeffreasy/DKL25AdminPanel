import { useState } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Modal, TextInput } from '@mantine/core'
import { RichTextEditor } from '@mantine/tiptap'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: {
    email: string
    name: string
  }
  onSend: (data: { subject: string; body: string }) => Promise<void>
}

export function EmailModal({ isOpen, onClose, recipient, onSend }: EmailModalProps) {
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: `<p>Beste ${recipient.name},</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  })

  const handleSend = async () => {
    try {
      setSending(true)
      await onSend({
        subject,
        body: editor?.getHTML() || ''
      })
      onClose()
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Email Opstellen"
      size="xl"
      centered
      styles={{
        inner: { padding: 0 },
        body: { padding: '20px' },
        header: { padding: '20px' }
      }}
      overlayProps={{
        opacity: 0.7,
        blur: 3
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Aan</label>
          <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
            {recipient.name} ({recipient.email})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Onderwerp</label>
          <TextInput
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Voer een onderwerp in..."
            className="mt-1"
          />
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

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuleren
          </button>
          <button
            onClick={handleSend}
            disabled={!subject.trim() || !editor?.getText().trim() || sending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {sending ? 'Versturen...' : 'Verstuur'}
          </button>
        </div>
      </div>
    </Modal>
  )
} 