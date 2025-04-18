import { Dialog, Transition, Listbox } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { RichTextEditor } from '@mantine/tiptap'
import {
  ExclamationTriangleIcon, 
  XMarkIcon, 
  CheckIcon, 
  ChevronUpDownIcon, 
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { cl } from '../../styles/shared'
import { cc } from '../../styles/shared'

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
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: EMAIL_TEMPLATES[selectedTemplate].content(recipient.name),
    onCreate: ({ editor }) => {
      editor.commands.focus();
    }
  })

  useEffect(() => {
    setSubject(EMAIL_TEMPLATES[selectedTemplate].subject)
    editor?.commands.setContent(EMAIL_TEMPLATES[selectedTemplate].content(recipient.name))
    editor?.commands.focus();
  }, [selectedTemplate, editor, recipient.name])

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate('default');
      setSubject(EMAIL_TEMPLATES.default.subject);
      editor?.commands.setContent(EMAIL_TEMPLATES.default.content(recipient.name));
      setError(null);
      setSending(false);
    } else {
      editor?.commands.clearContent();
    }
  }, [isOpen, editor, recipient.name]);

  const handleSend = async () => {
    if (!subject.trim() || !editor?.getText().trim()) {
      setError("Onderwerp en bericht mogen niet leeg zijn.");
      return;
    }
    
    setError(null);
    setSending(true);
    try {
      await onSend({
        subject,
        body: editor?.getHTML() || ''
      });
      onClose();
    } catch (err) {
      console.error('Failed to send email:', err);
      setError(err instanceof Error ? err.message : 'Verzenden van e-mail mislukt.');
    } finally {
      setSending(false);
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
          <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black/50" />
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

                <div className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-700/50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Fout</h3>
                          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>{error}</p>
                          </div>
                        </div>
                        <div className="ml-auto pl-3">
                          <div className="-mx-1.5 -my-1.5">
                            <button
                              type="button"
                              onClick={() => setError(null)}
                              className="inline-flex rounded-md bg-red-50 dark:bg-red-900/0 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 dark:focus:ring-offset-gray-800"
                            >
                              <span className="sr-only">Dismiss</span>
                              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">Aan:</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{recipient.name} ({recipient.email})</p>
                  </div>

                  <div>
                    <Listbox value={selectedTemplate} onChange={setSelectedTemplate}>
                      <div className="relative">
                        <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template</Listbox.Label>
                        <Listbox.Button className={cc.form.input({ className: "relative w-full cursor-default py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"})}>
                          <span className="block truncate">{EMAIL_TEMPLATES[selectedTemplate].subject}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {TEMPLATE_OPTIONS.map((option) => (
                              <Listbox.Option
                                key={option.value}
                                className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100' }`}
                                value={option.value}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>{option.label}</span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Onderwerp</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      placeholder="Voer een onderwerp in..."
                      value={subject}
                      onChange={(event) => setSubject(event.currentTarget.value)}
                      className={cc.form.input()}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bericht</label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                      <RichTextEditor editor={editor} style={{ minHeight: 200 }}>
                        <RichTextEditor.Toolbar sticky stickyOffset={0} className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold /> <RichTextEditor.Italic /> <RichTextEditor.Underline />
                          </RichTextEditor.ControlsGroup>
                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.BulletList /> <RichTextEditor.OrderedList />
                          </RichTextEditor.ControlsGroup>
                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Link /> <RichTextEditor.Unlink />
                          </RichTextEditor.ControlsGroup>
                        </RichTextEditor.Toolbar>
                        <RichTextEditor.Content className="p-3 prose prose-sm dark:prose-invert max-w-none" />
                      </RichTextEditor>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" className={cc.button.base({ color: 'secondary' })} onClick={onClose}>
                      Annuleren
                    </button>
                    <button 
                      type="button"
                      className={cc.button.base({ color: 'primary', className: "min-w-[80px]" })}
                      onClick={handleSend} 
                      disabled={sending || !subject.trim() || !editor?.getText().trim()}
                    >
                      {sending ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" /> 
                      ) : (
                         'Verstuur'
                      )}
                    </button>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 