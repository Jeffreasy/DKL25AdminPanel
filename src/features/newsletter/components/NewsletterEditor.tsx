import { useState, useEffect } from 'react'
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { RichTextEditor } from '@mantine/tiptap'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { PhotoIcon } from '@heroicons/react/24/solid'
import type { Newsletter, CreateNewsletterData } from '../types'
import { cc } from '../../../styles/shared'
import { toast } from 'react-hot-toast'
import { updateNewsletter } from '../services/newsletterService'
import { ConfirmDialog } from '../../../components/ui'

interface NewsletterEditorProps {
  newsletter?: Newsletter
  onComplete: (data: CreateNewsletterData) => void
  onCancel: () => void
}

// Newsletter templates with professional branding
const NEWSLETTER_TEMPLATES = {
  default: {
    subject: 'Nieuwsbrief DKL25',
    content: `<div style="text-align: center; margin-bottom: 24px;">
<img src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png" alt="De Koninklijke Loop" style="max-width: 200px; width: 100%; height: auto; margin-bottom: 16px;">
</div>

<h2 style="color: #ff9328; margin-bottom: 16px;">Welkom bij de nieuwsbrief van De Koninklijke Loop 2025</h2>

<p>Beste leden en geïnteresseerden,</p>

<p>Hier vindt u het laatste nieuws over De Koninklijke Loop 2025.</p>

<div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 16px; margin: 20px 0; color: #9a3412;">
<strong>Wat kunt u verwachten:</strong><br>
• Actuele informatie over het evenement<br>
• Inschrijvingsupdates<br>
• Route-informatie<br>
• Sponsormogelijkheden
</div>

<p>Blijf op de hoogte van alle ontwikkelingen!</p>

<p>Met sportieve groet,<br><strong>Team De Koninklijke Loop</strong></p>

<div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
<a href="https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Facebook</a> |
<a href="https://www.instagram.com/koninklijkeloop/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Instagram</a> |
<a href="https://dekoninklijkeloop.nl" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Website</a>
</p>
<p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">&copy; 2025 De Koninklijke Loop. Alle rechten voorbehouden.</p>
</div>`
  },
  aankondiging: {
    subject: 'Nieuwsbrief DKL25 - Belangrijke Aankondiging',
    content: `<div style="text-align: center; margin-bottom: 24px;">
<img src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png" alt="De Koninklijke Loop" style="max-width: 200px; width: 100%; height: auto; margin-bottom: 16px;">
</div>

<h2 style="color: #ff9328; margin-bottom: 16px;">Belangrijke Aankondiging</h2>

<p>Beste leden en geïnteresseerden,</p>

<p>We hebben een belangrijke aankondiging te doen:</p>

<div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
<h3 style="color: #ff9328; margin: 0 0 12px 0;">[Titel van de aankondiging]</h3>
<p style="margin: 8px 0;"><strong>Datum:</strong> [Datum invullen]</p>
<p style="margin: 8px 0;"><strong>Locatie:</strong> [Locatie invullen]</p>
<p style="margin: 8px 0;"><strong>Tijd:</strong> [Tijd invullen]</p>
</div>

<p>Meer informatie volgt binnenkort. Houd onze website en social media in de gaten voor updates.</p>

<p>Met sportieve groet,<br><strong>Team De Koninklijke Loop</strong></p>

<div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
<a href="https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Facebook</a> |
<a href="https://www.instagram.com/koninklijkeloop/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Instagram</a> |
<a href="https://dekoninklijkeloop.nl" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Website</a>
</p>
<p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">&copy; 2025 De Koninklijke Loop. Alle rechten voorbehouden.</p>
</div>`
  },
  update: {
    subject: 'Nieuwsbrief DKL25 - Update',
    content: `<div style="text-align: center; margin-bottom: 24px;">
<img src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png" alt="De Koninklijke Loop" style="max-width: 200px; width: 100%; height: auto; margin-bottom: 16px;">
</div>

<h2 style="color: #ff9328; margin-bottom: 16px;">Update van De Koninklijke Loop 2025</h2>

<p>Beste leden en geïnteresseerden,</p>

<p>Hier is een update over de voortgang van De Koninklijke Loop 2025:</p>

<div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
<h3 style="color: #374151; margin-top: 0;">📋 Laatste ontwikkelingen:</h3>
<ul style="color: #374151;">
<li style="margin-bottom: 8px;">[Update punt 1 - beschrijf hier de eerste update]</li>
<li style="margin-bottom: 8px;">[Update punt 2 - beschrijf hier de tweede update]</li>
<li style="margin-bottom: 8px;">[Update punt 3 - beschrijf hier de derde update]</li>
</ul>
</div>

<p>Blijf op de hoogte voor meer nieuws! Volg ons op social media voor dagelijkse updates.</p>

<p>Met sportieve groet,<br><strong>Team De Koninklijke Loop</strong></p>

<div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
<a href="https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Facebook</a> |
<a href="https://www.instagram.com/koninklijkeloop/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Instagram</a> |
<a href="https://dekoninklijkeloop.nl" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Website</a>
</p>
<p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">&copy; 2025 De Koninklijke Loop. Alle rechten voorbehouden.</p>
</div>`
  },
  herinnering: {
    subject: 'Nieuwsbrief DKL25 - Herinnering',
    content: `<div style="text-align: center; margin-bottom: 24px;">
<img src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png" alt="De Koninklijke Loop" style="max-width: 200px; width: 100%; height: auto; margin-bottom: 16px;">
</div>

<h2 style="color: #ff9328; margin-bottom: 16px;">Herinnering</h2>

<p>Beste leden en geïnteresseerden,</p>

<p>Een vriendelijke herinnering over een belangrijk moment:</p>

<div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
<h3 style="color: #ff9328; margin: 0 0 12px 0;">[Naam van het evenement]</h3>
<p style="margin: 8px 0; font-size: 16px;"><strong>Datum:</strong> [Datum invullen]</p>
<p style="margin: 8px 0; font-size: 16px;"><strong>Locatie:</strong> [Locatie invullen]</p>
<p style="margin: 8px 0; font-size: 16px;"><strong>Starttijd:</strong> [Tijd invullen]</p>
</div>

<p>We kijken er enorm naar uit om u te zien! Zorg ervoor dat u op tijd aanwezig bent voor een geweldige ervaring.</p>

<p>Voor vragen kunt u altijd contact met ons opnemen.</p>

<p>Met sportieve groet,<br><strong>Team De Koninklijke Loop</strong></p>

<div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
<a href="https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Facebook</a> |
<a href="https://www.instagram.com/koninklijkeloop/" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Instagram</a> |
<a href="https://dekoninklijkeloop.nl" style="color: #ff9328; text-decoration: none; margin: 0 8px;">Website</a>
</p>
<p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">&copy; 2025 De Koninklijke Loop. Alle rechten voorbehouden.</p>
</div>`
  }
} as const

type TemplateKey = keyof typeof NEWSLETTER_TEMPLATES

const TEMPLATE_OPTIONS = Object.entries(NEWSLETTER_TEMPLATES).map(([key, value]) => ({
  value: key as TemplateKey,
  label: value.subject
}))

// Define colors for the color picker
const COLORS = [
  '#000000', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6',
  '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14', '#868e96'
]

export function NewsletterEditor({ newsletter, onComplete, onCancel }: NewsletterEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('default')
  const [formData, setFormData] = useState({
    subject: newsletter?.subject || NEWSLETTER_TEMPLATES.default.subject,
    content: newsletter?.content || NEWSLETTER_TEMPLATES.default.content
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editorHeight, setEditorHeight] = useState(400)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const updateHeight = () => {
      setEditorHeight(window.innerWidth < 768 ? 250 : 400)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

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
    content: formData.content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      setFormData(prev => ({ ...prev, content: newContent }))
      setHasUnsavedChanges(true)
    },
    onCreate: ({ editor }) => {
      editor.commands.focus()
    }
  })


  // Function to handle image insertion
  const addImage = () => {
    const url = window.prompt('Afbeelding URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
      setHasUnsavedChanges(true)
    }
  }

  // Handle template selection
  const handleTemplateChange = (templateKey: TemplateKey) => {
    const template = NEWSLETTER_TEMPLATES[templateKey]
    setFormData({
      subject: template.subject,
      content: template.content
    })
    setSelectedTemplate(templateKey)
    editor?.commands.setContent(template.content)
    setHasUnsavedChanges(true)
  }

  // Handle subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubject = e.target.value
    setFormData(prev => ({ ...prev, subject: newSubject }))
    setHasUnsavedChanges(true)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)

      const newsletterData: CreateNewsletterData = {
        subject: formData.subject.trim(),
        content: formData.content.trim()
      }

      if (!newsletterData.subject) {
        setError('Onderwerp is verplicht')
        return
      }

      if (!newsletterData.content || !editor?.getText().trim()) {
        setError('Inhoud mag niet leeg zijn')
        return
      }

      // For new newsletters, this will be handled by the parent component
      // For existing ones, we update here
      if (newsletter) {
        await updateNewsletter(newsletter.id, newsletterData)
        toast.success('Nieuwsbrief succesvol bijgewerkt.')
      }

      setHasUnsavedChanges(false)
      onComplete(newsletterData)
    } catch (err) {
      console.error('Error saving newsletter:', err)
      setError('Er ging iets mis bij het opslaan')
      toast.error('Fout bij het opslaan van de nieuwsbrief.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel with unsaved changes warning
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true)
    } else {
      onCancel()
    }
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    onCancel()
  }

  return (
    <>
      <div className={`fixed inset-0 ${cc.overlay.medium} backdrop-blur-sm overflow-y-auto h-full w-full z-40 flex items-center justify-center p-2 sm:p-4`}>
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl mx-auto border border-gray-200 dark:border-gray-700 flex flex-col max-h-[98vh] sm:max-h-[95vh]">
          {/* Header */}
          <div className={`${cc.spacing.px.sm} sm:px-6 ${cc.spacing.py.md} sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-gray-800 rounded-t-xl`}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {newsletter ? 'Nieuwsbrief Bewerken' : 'Nieuwsbrief Aanmaken'}
            </h2>
            <button
              onClick={handleCancelClick}
              className={cc.button.icon({ color: 'secondary' })}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
            <div className={`${cc.spacing.container.sm} sm:p-6 ${cc.spacing.section.sm} sm:space-y-6`}>
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sjabloon
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value as TemplateKey)}
                  className={cc.form.input()}
                >
                  {TEMPLATE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className={cc.form.label()}>
                  Onderwerp *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  className={cc.form.input({ className: 'mt-1' })}
                  required
                  placeholder="Voer het onderwerp van de nieuwsbrief in"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className={cc.form.label()}>
                  Inhoud *
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 mt-1 shadow-sm">
                  <RichTextEditor editor={editor} style={{ minHeight: editorHeight }}>
                    <RichTextEditor.Toolbar sticky stickyOffset={0} className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 overflow-x-auto">
                      {/* Group 1: Basic Formatting & Color */}
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ColorPicker colors={COLORS} />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.Code />
                      </RichTextEditor.ControlsGroup>

                      {/* Group 2: Headings & Lists */}
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
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

                    <RichTextEditor.Content className={`${cc.spacing.container.sm} sm:p-6 prose prose-sm sm:prose-base dark:prose-invert max-w-none font-sans`} />
                  </RichTextEditor>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className={cc.alert({ status: 'error' })}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Fout</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`${cc.spacing.px.sm} sm:px-6 ${cc.spacing.py.md} sm:py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center ${cc.spacing.gap.md} sm:gap-0 flex-shrink-0 rounded-b-xl`}>
              <div className={`flex items-center ${cc.spacing.gap.sm}`}>
                {hasUnsavedChanges && (
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Niet-opgeslagen wijzigingen
                  </span>
                )}
              </div>

              <div className={`flex flex-col sm:flex-row ${cc.spacing.gap.sm} sm:gap-3 w-full sm:w-auto`}>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                  className={cc.button.base({ color: 'secondary' })}
                >
                  Annuleren
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!editor?.getText().trim()}
                  className={cc.button.base({ color: 'secondary' })}
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cc.button.base({ color: 'primary' })}
                >
                  {isSubmitting ? 'Opslaan...' : (newsletter ? 'Wijzigingen Opslaan' : 'Nieuwsbrief Opslaan')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className={`fixed inset-0 ${cc.overlay.medium} backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-2 sm:p-4`}>
          <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl mx-auto border border-gray-200 dark:border-gray-700 flex flex-col max-h-[95vh]">
            <div className={`${cc.spacing.px.sm} sm:px-6 ${cc.spacing.py.md} sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-xl`}>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Nieuwsbrief Preview
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className={cc.button.icon({ color: 'secondary' })}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className={`${cc.spacing.container.sm} sm:p-6 flex-grow overflow-y-auto`}>
              <div className={`mb-4 ${cc.spacing.section.xs} border-b border-gray-200 dark:border-gray-700 pb-4`}>
                <h4 className="font-medium text-gray-900 dark:text-white">{formData.subject}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Van: nieuwsbrief@dekoninklijkeloop.nl
                </p>
              </div>

              <div className={`bg-gray-100 dark:bg-gray-800 ${cc.spacing.container.sm} sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm`}>
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none font-sans"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>

              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                Dit is een voorbeeldweergave. De uiteindelijke nieuwsbrief kan er anders uitzien in verschillende e-mailclients.
              </p>
            </div>

            <div className={`${cc.spacing.px.sm} sm:px-6 ${cc.spacing.py.md} sm:py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-b-xl`}>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className={cc.button.base({ color: 'secondary' })}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Wijzigingen annuleren"
        message="Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?"
        confirmText="Ja, annuleren"
        cancelText="Nee, ga terug"
        variant="warning"
      />
    </>
  )
}