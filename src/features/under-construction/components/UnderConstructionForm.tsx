import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { UnderConstructionFormData } from '../types';
import { underConstructionService } from '../services/underConstructionService';
import { cc } from '../../../styles/shared';

interface Props {
  onSave?: () => void;
}

interface SocialLink {
  platform: string;
  url: string;
}

export function UnderConstructionForm({ onSave }: Props) {
  const [formData, setFormData] = useState<UnderConstructionFormData>({
    is_active: false,
    title: 'Onder Constructie',
    message: 'Deze website is momenteel onder constructie...',
    footer_text: 'Bedankt voor uw geduld!',
    logo_url: '',
    expected_date: null,
    social_links: [],
    progress_percentage: 0,
    contact_email: '',
    newsletter_enabled: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [newSocialLink, setNewSocialLink] = useState<SocialLink>({ platform: '', url: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await underConstructionService.getUnderConstruction();
        setFormData({
          is_active: data.isActive,
          title: data.title,
          message: data.message,
          footer_text: data.footerText || '',
          logo_url: data.logoUrl || '',
          expected_date: data.expectedDate ? new Date(data.expectedDate).toISOString().slice(0, 16) : null,
          social_links: data.socialLinks || [],
          progress_percentage: data.progressPercentage || 0,
          contact_email: data.contactEmail || '',
          newsletter_enabled: data.newsletterEnabled,
        });
        setId(data.id);
      } catch (error) {
        // Only show error for actual API errors, not for expected 404s
        if (!(error instanceof Error) || !error.message.includes('404')) {
          console.error('Error loading under construction data:', error);
          setMessage('Fout bij het laden van gegevens');
          setMessageType('error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Client-side validatie
    if (formData.progress_percentage < 0 || formData.progress_percentage > 100) {
      setMessage('Voortgangspercentage moet tussen 0 en 100 liggen');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      setMessage('Voer een geldig e-mailadres in');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        expected_date: formData.expected_date ? new Date(formData.expected_date).toISOString() : null,
      };
      if (id) {
        await underConstructionService.updateUnderConstruction(id, payload);
      } else {
        const newData = await underConstructionService.createUnderConstruction(payload);
        setId(newData.id);
      }
      setMessage('Onder constructie instellingen succesvol opgeslagen');
      setMessageType('success');
      onSave?.();
    } catch (err) {
      console.error('Error saving under construction:', err);
      setMessage('Er is een fout opgetreden bij het opslaan');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      setMessage('Vul zowel platform als URL in');
      setMessageType('error');
      return;
    }
    if (!/^https?:\/\//.test(newSocialLink.url)) {
      setMessage('URL moet beginnen met http:// of https://');
      setMessageType('error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, newSocialLink],
    }));
    setNewSocialLink({ platform: '', url: '' });
  };

  const handleRemoveSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <>
      {message && (
        <div
          className={`${cc.spacing.container.sm} mb-6 rounded-md border flex items-center ${cc.spacing.gap.md} animate-in slide-in-from-top-2 duration-300 ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className={cc.spacing.section.md}>
        <div>
          <label htmlFor="isActive" className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
              aria-label="Onder constructie pagina activeren"
            />
            <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Onder constructie pagina actief
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Als dit is ingeschakeld, wordt de frontend onder constructie pagina getoond.
          </p>
        </div>

        <div>
          <label htmlFor="title" className={cc.form.label()}>
            Titel <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className={cc.form.input({ className: 'mt-1' })}
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="message" className={cc.form.label()}>
            Bericht <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            rows={4}
            className={cc.form.input({ className: 'mt-1' })}
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="footerText" className={cc.form.label()}>
            Footer tekst <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="footerText"
            value={formData.footer_text}
            onChange={(e) => setFormData((prev) => ({ ...prev, footer_text: e.target.value }))}
            className={cc.form.input({ className: 'mt-1' })}
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="logoUrl" className={cc.form.label()}>
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            value={formData.logo_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
            className={cc.form.input({ className: 'mt-1' })}
            placeholder="https://example.com/logo.png"
            aria-label="URL van het logo"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Voer de URL in van het logo dat op de onder constructie pagina wordt getoond.
          </p>
        </div>

        <div>
          <label htmlFor="expectedDate" className={cc.form.label()}>
            Verwachte lanceringsdatum
          </label>
          <input
            type="datetime-local"
            id="expectedDate"
            value={formData.expected_date || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, expected_date: e.target.value || null }))}
            className={cc.form.input({ className: 'mt-1' })}
            aria-label="Verwachte lanceringsdatum"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Selecteer de verwachte datum en tijd voor de lancering (voor countdown).
          </p>
        </div>

        <div>
          <label className={cc.form.label()}>Sociale media links</label>
          <div className={cc.spacing.section.xs}>
            {formData.social_links.map((link, index) => (
              <div key={index} className={`flex items-center ${cc.spacing.gap.sm}`}>
                <select
                  value={link.platform}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      social_links: prev.social_links.map((l, i) =>
                        i === index ? { ...l, platform: e.target.value } : l
                      ),
                    }))
                  }
                  className={cc.form.select({ className: 'mt-1 flex-1' })}
                  aria-label={`Platform voor sociale media link ${index + 1}`}
                >
                  <option value="">Selecteer platform</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Website">Website</option>
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      social_links: prev.social_links.map((l, i) =>
                        i === index ? { ...l, url: e.target.value } : l
                      ),
                    }))
                  }
                  className={cc.form.input({ className: 'mt-1 flex-1' })}
                  placeholder="https://example.com"
                  aria-label={`URL voor sociale media link ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSocialLink(index)}
                  className={cc.button.iconDanger({ size: 'sm', className: 'mt-1' })}
                  aria-label={`Verwijder sociale media link ${index + 1}`}
                  title="Verwijder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className={`flex items-center ${cc.spacing.gap.sm}`}>
              <select
                value={newSocialLink.platform}
                onChange={(e) =>
                  setNewSocialLink((prev) => ({ ...prev, platform: e.target.value }))
                }
                className={cc.form.select({ className: 'mt-1 flex-1' })}
                aria-label="Nieuw platform voor sociale media link"
              >
                <option value="">Selecteer platform</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="Website">Website</option>
              </select>
              <input
                type="url"
                value={newSocialLink.url}
                onChange={(e) =>
                  setNewSocialLink((prev) => ({ ...prev, url: e.target.value }))
                }
                className={cc.form.input({ className: 'mt-1 flex-1' })}
                placeholder="https://example.com"
                aria-label="Nieuwe URL voor sociale media link"
              />
              <button
                type="button"
                onClick={handleAddSocialLink}
                className={cc.button.base({ color: 'primary', className: 'mt-1' })}
                aria-label="Voeg sociale media link toe"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Voeg links toe naar sociale media accounts (Facebook, Instagram, Twitter, YouTube, LinkedIn, TikTok) die op de onder constructie pagina worden getoond.
          </p>
        </div>

        <div>
          <label htmlFor="progressPercentage" className={cc.form.label()}>
            Voortgangspercentage
          </label>
          <input
            type="number"
            id="progressPercentage"
            value={formData.progress_percentage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                progress_percentage: parseInt(e.target.value) || 0,
              }))
            }
            min="0"
            max="100"
            className={cc.form.input({ className: 'mt-1' })}
            aria-label="Voortgangspercentage"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Voer een percentage in (0-100) voor de voortgangsbalk op de onder constructie pagina.
          </p>
        </div>

        <div>
          <label htmlFor="contactEmail" className={cc.form.label()}>
            Contact e-mail
          </label>
          <input
            type="email"
            id="contactEmail"
            value={formData.contact_email}
            onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
            className={cc.form.input({ className: 'mt-1' })}
            placeholder="info@koninklijkeloop.nl"
            aria-label="Contact e-mailadres"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Voer het e-mailadres in dat bezoekers kunnen gebruiken voor contact.
          </p>
        </div>

        <div>
          <label htmlFor="newsletterEnabled" className="flex items-center">
            <input
              type="checkbox"
              id="newsletterEnabled"
              checked={formData.newsletter_enabled}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, newsletter_enabled: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
              aria-label="Nieuwsbrief signup activeren"
            />
            <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Nieuwsbrief signup actief
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Schakel een nieuwsbrief signup-formulier in op de onder constructie pagina.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cc.button.base({ color: 'primary' })}
            aria-label={isSubmitting ? 'Bezig met opslaan' : 'Instellingen opslaan'}
          >
            {isSubmitting ? 'Bezig...' : 'Opslaan'}
          </button>
        </div>
      </form>
    </>
  );
}