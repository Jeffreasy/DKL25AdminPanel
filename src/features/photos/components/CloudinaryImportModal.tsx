import React, { useEffect, useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { supabase } from '../../../lib/supabase';
import { Z_INDEX } from '../../../constants/zIndex';
import type { Photo } from '../types';
import { cc } from '../../../styles/shared';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  thumbnail_url?: string;
  original_filename?: string;
  width?: number;
  height?: number;
  // Add other relevant fields returned by Cloudinary
}

interface CloudinaryImportModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  targetYear: string; // To assign a year to imported photos
}

// Helper to load the Cloudinary script
const loadCloudinaryScript = (callback: () => void) => {
  const existingScript = document.getElementById('cloudinary-widget-script');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://media-library.cloudinary.com/global/all.js';
    script.id = 'cloudinary-widget-script';
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
    script.onerror = () => { // DEBUG: Add error handler
    };
  } else {
    if (callback) callback();
  }
};

// Function to get the last order number (similar to PhotoForm)
const getLastOrderNumber = async (): Promise<number> => {
    const { data, error } = await supabase
      .from('photos')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1)
      .single()
  
    if (error && error.code !== 'PGRST116') { // Ignore "query returned no rows" error
      console.error("Error fetching last order number:", error);
      return 0;
    }
    return (data?.order_number || 0) + 1
}

export function CloudinaryImportModal({ open, onClose, onComplete, targetYear }: CloudinaryImportModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCloudinaryScript(() => {
        setScriptLoaded(true);
      });
    }
  }, [open]);

  const openWidget = useCallback(() => {
    if (!scriptLoaded || !(window as any).cloudinary) {
      setError('Cloudinary widget script niet geladen.');
      return;
    }

    setError(null);

    // DEBUG: Log the actual values being used
    console.log('[CloudinaryImportModal] Using Cloud Name:', CLOUD_NAME);
    console.log('[CloudinaryImportModal] Using API Key:', API_KEY ? API_KEY.substring(0, 5) + '...' : 'undefined'); // Log only a prefix for security

    try { // DEBUG: Wrap widget creation in try-catch
      const widget = (window as any).cloudinary.createMediaLibrary(
        {
          cloud_name: CLOUD_NAME,
          api_key: API_KEY,
          multiple: true, // Allow selecting multiple images
          // Add other configuration options if needed
        },
        {
          insertHandler: async (data: { assets: CloudinaryAsset[] }) => {
            if (!data.assets || data.assets.length === 0) {
              onClose();
              return;
            }

            setIsProcessing(true);
            setError(null);
            let skippedCount = 0;
            let photosToInsert: Partial<Photo>[] = [];

            try {
              const { data: existingPhotos, error: fetchError } = await supabase
                .from('photos')
                .select('url');

              if (fetchError) {
                throw new Error('Kon bestaande foto URLs niet ophalen: ' + fetchError.message);
              }

              const existingUrls = new Set(existingPhotos?.map(p => p.url) || []);

              for (const asset of data.assets) {
                if (existingUrls.has(asset.secure_url)) {
                  skippedCount++;
                  continue;
                }

                photosToInsert.push({
                  url: asset.secure_url,
                  thumbnail_url: asset.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'),
                  title: asset.original_filename || asset.public_id,
                  alt_text: asset.original_filename || asset.public_id,
                  visible: true,
                  year: targetYear || String(new Date().getFullYear()),
                  description: "",
                });
              }

              if (photosToInsert.length > 0) {
                  // DEBUG: Log the exact data being sent to Supabase
                  console.log("[CloudinaryImportModal] Data to insert:", JSON.stringify(photosToInsert, null, 2));

                  const { error: insertError } = await supabase
                    .from('photos')
                    .insert(photosToInsert);

                  if (insertError) {
                    // Log the full error object for more details
                    console.error('[CloudinaryImportModal] Supabase insert error object:', insertError);
                    throw insertError;
                  }
              }

              // Success path: Only runs if try block succeeded
              setIsProcessing(false);
              if (photosToInsert.length > 0) {
                  toast.success(
                    `${photosToInsert.length} foto${photosToInsert.length !== 1 ? '' : 's'} succesvol geïmporteerd.` +
                    (skippedCount > 0 ? ` ${skippedCount} reeds bestaande overgeslagen.` : '')
                  );
              } else if (skippedCount > 0) {
                  toast(`${skippedCount} foto${skippedCount !== 1 ? '' : 's'} overgeslagen (reeds aanwezig).`);
              } else {
                  toast("Geen nieuwe foto's geselecteerd voor import.");
              }

              onComplete();
              onClose();

            } catch (err) { // Catch block for fetch or insert errors
              setError(err instanceof Error ? err.message : "Importeren mislukt");
              setIsProcessing(false); // Stop processing on error
            }
          }
        }
      );

      widget.show();

    } catch (widgetError) { // DEBUG: Catch errors during widget creation/show
        setError('Cloudinary widget kon niet worden geopend.');
    }
  }, [scriptLoaded, onClose, onComplete, targetYear]);

  return (
    <Dialog open={open} onClose={() => !isProcessing && onClose()} className={`relative z-[${Z_INDEX.BASE_MODAL + 1}]`}>
      {/* Fixed backdrop */}
      <div className={`fixed inset-0 bg-black/30 dark:bg-black/70 z-[${Z_INDEX.BASE_MODAL + 1}]`} aria-hidden="true" />

      {/* Full screen container to center the panel */}
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.BASE_MODAL + 1}]`}>
        <Dialog.Panel className={cc.card({ className: "w-full max-w-md p-0 flex flex-col max-h-[90vh]"})}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900 dark:text-white">
              Importeer vanuit Cloudinary
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={cc.button.icon({ color: 'secondary', className: 'disabled:opacity-50'})}
              title="Sluiten"
            >
              <span className="sr-only">Sluiten</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 flex-grow flex flex-col items-center justify-center text-center">
            {error && (
              <div className={cc.alert({ status: 'error', className: 'mb-4 w-full text-left' })}>
                {error}
              </div>
            )}

            {isProcessing ? (
               <div className="flex flex-col items-center gap-4">
                 <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                 </svg>
                 <p className="text-gray-600 dark:text-gray-400">Foto's verwerken...</p>
               </div>
            ) : scriptLoaded ? (
              <button
                onClick={openWidget}
                className={cc.button.base({ color: 'primary' })}
              >
                Open Cloudinary Media Library
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">Cloudinary widget laden...</p>
              </div>
            )}
             <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Nieuwe foto's worden geïmporteerd met het jaar {targetYear}.
             </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}