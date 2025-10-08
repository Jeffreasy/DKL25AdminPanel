import { Dialog, Transition, Listbox, Combobox } from '@headlessui/react'
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
import { cc } from '../../../styles/shared'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { PhotoIcon } from '@heroicons/react/24/solid'

// Define the signature HTML
const SIGNATURE_HTML = `<p><br></p><p>-- <br>Met vriendelijke groet,<br>Het DKL25 Team</p>`;

// Define the props interface again, without availableSenders
interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  recipient?: {
    email: string
    name: string
  }
  initialSenderEmail: string
  onSend: (data: { to: string; subject: string; body: string; sender: string }) => Promise<void>
  suggestionEmails?: string[] 
}

// Email templates
const EMAIL_TEMPLATES = {
  default: {
    subject: 'Re: Bericht aan DKL25',
    // Add fallback for name
    content: (name?: string) => `<p>Beste ${name || 'heer/mevrouw'},</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  },
  info: {
    subject: 'Informatie DKL25',
    content: (name?: string) => `<p>Beste ${name || 'heer/mevrouw'},</p><p><br></p><p>Bedankt voor uw interesse in De Koninklijke Loop 2025.</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  },
  aanmelding: {
    subject: 'Bevestiging aanmelding DKL25',
    content: (name?: string) => `<p>Beste ${name || 'heer/mevrouw'},</p><p><br></p><p>Hartelijk dank voor uw aanmelding voor De Koninklijke Loop 2025.</p><p>We hebben uw aanmelding in goede orde ontvangen.</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  },
  contact: {
    subject: 'Contact DKL25',
    content: (name?: string) => `<p>Beste ${name || 'heer/mevrouw'},</p><p><br></p><p>Bedankt voor uw bericht. We nemen zo spoedig mogelijk contact met u op.</p><p><br></p><p>Met vriendelijke groet,</p><p>DKL25 Team</p>`
  }
} as const

type TemplateKey = keyof typeof EMAIL_TEMPLATES

const TEMPLATE_OPTIONS = Object.entries(EMAIL_TEMPLATES).map(([key, value]) => ({
  value: key,
  label: value.subject // Use subject as label, or create specific labels
}));

// Define colors for the color picker
const COLORS = [
  '#000000', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', 
  '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14', '#868e96'
];

export function EmailDialog({ 
  isOpen, 
  onClose, 
  recipient, 
  initialSenderEmail, 
  onSend,
  suggestionEmails = [] // Default to empty array
}: EmailDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('default')
  const [subject, setSubject] = useState<string>(EMAIL_TEMPLATES.default.subject)
  const [toEmail, setToEmail] = useState('');
  // State for Combobox query
  const [query, setQuery] = useState('') 
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Highlight,
    ],
    content: EMAIL_TEMPLATES[selectedTemplate].content(recipient?.name),
    onCreate: ({ editor }) => {
      editor.commands.focus();
    }
  })

  // Function to handle image insertion via prompt
  const addImage = () => {
    const url = window.prompt('Afbeelding URL:');

    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Function to safely append signature
  const getContentWithSignature = (baseContent: string) => {
    // Basic check to avoid adding signature if it might already be there
    // A more robust check might be needed depending on template structures
    if (baseContent.includes('DKL25 Team')) { // Simple check
        return baseContent;
    }
    // Ensure there's a paragraph break before signature if baseContent doesn't end with </p>
    const separator = baseContent.trim().endsWith('</p>') ? '' : '<p><br></p>';
    return baseContent + separator + SIGNATURE_HTML;
  };

  // Update useEffect hooks to handle optional recipient.name
  useEffect(() => {
    const recipientName = recipient?.name; // Use optional chaining
    const templateContent = EMAIL_TEMPLATES[selectedTemplate].content(recipientName);
    const fullContent = getContentWithSignature(templateContent);
    setSubject(EMAIL_TEMPLATES[selectedTemplate].subject)
    editor?.chain().focus().setContent(fullContent).run();
  }, [selectedTemplate, editor, recipient?.name]) // Add optional chaining to dependency

  useEffect(() => {
    if (isOpen) {
      const recipientName = recipient?.name; // Use optional chaining
      const defaultContent = EMAIL_TEMPLATES.default.content(recipientName);
      const fullContent = getContentWithSignature(defaultContent);
      setSelectedTemplate('default');
      setSubject(EMAIL_TEMPLATES.default.subject);
      editor?.commands.setContent(fullContent);
      // Reset manual recipient field if dialog opens for composing new email
      if (!recipient) {
          setToEmail('');
      }
      setError(null);
      setSending(false);
      // Reset query on open
      setQuery(''); 
    } else {
      editor?.commands.clearContent();
    }
  // Add recipient?.name to dependency array
  }, [isOpen, editor, recipient?.name]);

  const handleSend = async () => {
    const finalToEmail = recipient ? recipient.email : toEmail;
    // Validate recipient email if not prefilled
    if (!finalToEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalToEmail)) {
      setError("Voer een geldig 'Aan:' e-mailadres in.");
      return;
    }
    if (!subject.trim() || !editor?.getText().trim()) {
      setError("Onderwerp en bericht mogen niet leeg zijn.");
      return;
    }
    
    setError(null);
    setSending(true);
    try {
      await onSend({
        // Pass the correct recipient email
        to: finalToEmail,
        subject,
        body: editor?.getHTML() || '',
        sender: initialSenderEmail
      });
      onClose();
    } catch (err) {
      console.error('Failed to send email:', err);
      setError(err instanceof Error ? err.message : 'Verzenden van e-mail mislukt.');
    } finally {
      setSending(false);
    }
  }

  // Filter suggestions based on query
  const filteredSuggestions = 
    query === ''
      ? suggestionEmails
      : suggestionEmails.filter((email) => 
          email.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <>
      {/* Main Email Dialog */}
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
            <div className={`fixed inset-0 ${cc.overlay.light}`} />
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
                <Dialog.Panel className={`w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 ${cc.spacing.container.md} shadow-xl transition-all`}>
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    Email Opstellen
                  </Dialog.Title>

                  <div className={cc.spacing.section.md}>
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
                    
                    {/* Conditionally render Aan: field */}
                    {recipient ? (
                      <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">Aan:</label>
                        <p className="text-sm text-gray-900 dark:text-white">{recipient.name} ({recipient.email})</p>
                      </div>
                    ) : (
                      // Use Combobox for 'Aan:' field
                      <Combobox value={toEmail} onChange={setToEmail as (value: string) => void}>
                        <div className="relative">
                          <Combobox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aan:</Combobox.Label>
                          <Combobox.Input
                            className={cc.form.input({ className: 'pr-10'})} 
                            // Update both query and toEmail on input change
                            onChange={(event) => { 
                              const typedValue = event.target.value;
                              setQuery(typedValue); // Update query for filtering
                              setToEmail(typedValue); // Update the actual recipient email
                            }}
                            placeholder="Voer ontvanger e-mailadres in of selecteer..."
                            required
                            // Display the current toEmail state
                            displayValue={() => toEmail} 
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </Combobox.Button>
                          {filteredSuggestions.length > 0 && (
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                                // Clear query only after selecting an option from the list
                                afterLeave={() => setQuery('')} 
                              >
                              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredSuggestions.map((email) => (
                                  <Combobox.Option
                                    key={email}
                                    className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${ active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white' }`}
                                    // Ensure value is always string
                                    value={email} 
                                  >
                                    {({ selected, active }) => (
                                        <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>
                                          {email}
                                        </span>
                                    )}
                                  </Combobox.Option>
                                ))}
                              </Combobox.Options>
                             </Transition>
                          )}
                        </div>
                      </Combobox>
                    )}

                    <div className="flex items-center">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">Van:</label>
                      <p className="text-sm text-gray-900 dark:text-white">info@dekoninklijkeloop.nl</p>
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

                    <div className={cc.spacing.section.xs}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bericht</label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                        <RichTextEditor editor={editor} style={{ minHeight: 200 }}>
                          <RichTextEditor.Toolbar sticky stickyOffset={0} className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                            {/* Group 1: Basic Formatting & Color */}
                            <RichTextEditor.ControlsGroup>
                              <RichTextEditor.Bold />
                              <RichTextEditor.Italic />
                              <RichTextEditor.Underline />
                              <RichTextEditor.Strikethrough />
                              <RichTextEditor.ColorPicker colors={COLORS} />
                              {/* Add Highlight */}
                              <RichTextEditor.Highlight />
                              <RichTextEditor.Code />
                            </RichTextEditor.ControlsGroup>

                            {/* Group 2: Headings & Lists */}
                            <RichTextEditor.ControlsGroup>
                              <RichTextEditor.H2 />
                              <RichTextEditor.H3 />
                              <RichTextEditor.BulletList />
                              <RichTextEditor.OrderedList />
                              <RichTextEditor.Blockquote />
                              <RichTextEditor.CodeBlock />
                            </RichTextEditor.ControlsGroup>

                            {/* Group 3: Alignment & Links */}
                            <RichTextEditor.ControlsGroup>
                              <RichTextEditor.AlignLeft />
                              <RichTextEditor.AlignCenter />
                              <RichTextEditor.AlignRight />
                              <RichTextEditor.Link />
                              <RichTextEditor.Unlink />
                            </RichTextEditor.ControlsGroup>

                            {/* Group 4: Insertions & Formatting */}
                            <RichTextEditor.ControlsGroup>
                              <RichTextEditor.Hr />
                              {/* Replace RichTextEditor.Image with custom button */}
                              <RichTextEditor.Control 
                                onClick={addImage} 
                                aria-label="Afbeelding invoegen"
                                title="Afbeelding invoegen (URL)"
                              >
                                <PhotoIcon className="h-4 w-4" />
                              </RichTextEditor.Control>
                              <RichTextEditor.ClearFormatting />
                            </RichTextEditor.ControlsGroup>

                            {/* Group 5: History */}
                            <RichTextEditor.ControlsGroup>
                              <RichTextEditor.Undo />
                              <RichTextEditor.Redo />
                            </RichTextEditor.ControlsGroup>
                          </RichTextEditor.Toolbar>

                          <RichTextEditor.Content className="p-3 prose prose-sm dark:prose-invert max-w-none" />
                        </RichTextEditor>
                      </div>
                    </div>

                    <div className={`flex justify-end ${cc.spacing.gap.md} pt-4`}>
                      <button type="button" className={cc.button.base({ color: 'secondary' })} onClick={onClose}>
                        Annuleren
                      </button>
                      <button 
                        type="button"
                        className={cc.button.base({ color: 'secondary' })} 
                        onClick={() => setIsPreviewOpen(true)}
                        disabled={!editor?.getText().trim()}
                      >
                        Preview
                      </button>
                      <button 
                        type="button"
                        className={cc.button.base({ color: 'primary', className: "min-w-[80px]" })}
                        onClick={handleSend} 
                        disabled={sending || !subject.trim() || !editor?.getText().trim() || (!recipient && !toEmail.trim())} // Disable if 'to' is empty when composing
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

      {/* Preview Modal */}
      <Transition appear show={isPreviewOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={() => setIsPreviewOpen(false)}> 
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={`fixed inset-0 ${cc.overlay.medium}`} />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-left">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className={`w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 ${cc.spacing.container.md} shadow-xl transition-all`}>
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 flex justify-between items-center">
                    Email Preview
                    <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                       <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  {/* Add Subject, To, From fields */}
                  <div className={`mb-4 ${cc.spacing.section.xs} border-b border-gray-200 dark:border-gray-700 pb-3 text-sm`}>
                     <p><strong className="text-gray-500 dark:text-gray-400 font-medium w-16 inline-block">Van:</strong> <span className="text-gray-800 dark:text-white">info@dekoninklijkeloop.nl</span></p>
                     <p><strong className="text-gray-500 dark:text-gray-400 font-medium w-16 inline-block">Aan:</strong> <span className="text-gray-800 dark:text-white">{recipient ? `${recipient.name} <${recipient.email}>` : toEmail}</span></p>
                     <p><strong className="text-gray-500 dark:text-gray-400 font-medium w-16 inline-block">Onderwerp:</strong> <span className="text-gray-800 dark:text-white">{subject}</span></p>
                  </div>
                  
                  {/* Render HTML Content within a constrained container */}
                  <div className={`bg-gray-50 dark:bg-gray-900 ${cc.spacing.container.sm} rounded border border-gray-200 dark:border-gray-700`}>
                    <div 
                      className="prose prose-sm max-w-3xl mx-auto bg-white text-gray-900 shadow-sm p-6 min-h-[200px]"
                      dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
                    />
                  </div>

                   {/* Add Disclaimer */}
                   <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                       Let op: Dit is een voorbeeldweergave. De uiteindelijke e-mail kan er anders uitzien in verschillende e-mailclients.
                   </p>

                   <div className="mt-4 flex justify-end">
                    <button type="button" className={cc.button.base({ color: 'secondary' })} onClick={() => setIsPreviewOpen(false)}>
                      Sluiten
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
} 