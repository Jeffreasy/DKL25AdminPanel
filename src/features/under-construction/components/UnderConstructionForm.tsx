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
    isActive: false,
    title: 'Onder Constructie',
    message: 'Deze website is momenteel onder constructie...',
    footerText: 'Bedankt voor uw geduld!',
    logoUrl: '',
    expectedDate: null,
    socialLinks: [],
    progressPercentage: 0,
    contactEmail: '',
    newsletterEnabled: false,
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
          isActive: data.isActive,
          title: data.title,
          message: data.message,
          footerText: data.footerText,
          logoUrl: data.logoUrl,
          expectedDate: data.expectedDate ? new Date(data.expectedDate).toISOString().slice(0, 16) : null,
          socialLinks: data.socialLinks,
          progressPercentage: data.progressPercentage,
          contactEmail: data.contactEmail,
          newsletterEnabled: data.newsletterEnabled,
        });
        setId(data.id);
      } catch (error) {
        console.error('Error loading under construction data:', error);
        setMessage('Fout bij het laden van gegevens');
        setMessageType('error');
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
    if (formData.progressPercentage < 0 || formData.progressPercentage > 100) {
      setMessage('Voortgangspercentage moet tussen 0 en 100 liggen');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      setMessage('Voer een geldig e-mailadres in');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : null,
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
      socialLinks: [...prev.socialLinks, newSocialLink],
    }));
    setNewSocialLink({ platform: '', url: '' });
  };

  const handleRemoveSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {message && (
        <div
          className={`p-4 mb-6 rounded-md border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="isActive" className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
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
            value={formData.footerText}
            onChange={(e) => setFormData((prev) => ({ ...prev, footerText: e.target.value }))}
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
            value={formData.logoUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
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
            value={formData.expectedDate || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, expectedDate: e.target.value || null }))}
            className={cc.form.input({ className: 'mt-1' })}
            aria-label="Verwachte lanceringsdatum"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Selecteer de verwachte datum en tijd voor de lancering (voor countdown).
          </p>
        </div>

        <div>
          <label className={cc.form.label()}>Sociale media links</label>
          <div className="space-y-2">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.map((l, i) =>
                        i === index ? { ...l, platform: e.target.value } : l
                      ),
                    }))
                  }
                  className={cc.form.input({ className: 'mt-1 flex-1' })}
                  placeholder="Platform (bijv. Twitter)"
                  aria-label={`Platform voor sociale media link ${index + 1}`}
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.map((l, i) =>
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
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                  aria-label={`Verwijder sociale media link ${index + 1}`}
                >
                  Verwijder
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSocialLink.platform}
                onChange={(e) =>
                  setNewSocialLink((prev) => ({ ...prev, platform: e.target.value }))
                }
                className={cc.form.input({ className: 'mt-1 flex-1' })}
                placeholder="Platform (bijv. Twitter)"
                aria-label="Nieuw platform voor sociale media link"
              />
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
                className={cc.button.base({ color: 'secondary', className: 'mt-1' })}
                aria-label="Voeg sociale media link toe"
              >
                Toevoegen
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Voeg links toe naar sociale media accounts die op de onder constructie pagina worden getoond.
          </p>
        </div>

        <div>
          <label htmlFor="progressPercentage" className={cc.form.label()}>
            Voortgangspercentage
          </label>
          <input
            type="number"
            id="progressPercentage"
            value={formData.progressPercentage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                progressPercentage: parseInt(e.target.value) || 0,
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
            value={formData.contactEmail}
            onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
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
              checked={formData.newsletterEnabled}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, newsletterEnabled: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
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