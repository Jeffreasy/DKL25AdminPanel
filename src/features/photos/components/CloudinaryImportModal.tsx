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
      loadCloudinaryScript(() => setScriptLoaded(true));
    }
  }, [open]);

  const openWidget = useCallback(() => {
    if (!scriptLoaded || !(window as any).cloudinary) {
      setError('Cloudinary widget script niet geladen.');
      return;
    }

    setError(null);

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
          
          try {
            const { data: existingPhotos, error: fetchError } = await supabase
              .from('photos')
              .select('url');

            if (fetchError) {
              throw new Error('Kon bestaande foto URLs niet ophalen: ' + fetchError.message);
            }

            const existingUrls = new Set(existingPhotos?.map(p => p.url) || []);
            
            const startOrderNumber = await getLastOrderNumber();
            let currentOrder = startOrderNumber;
            const photosToInsert: Partial<Photo>[] = [];

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
                order_number: currentOrder++,
                year: targetYear || String(new Date().getFullYear()),
              });
            }

            if (photosToInsert.length > 0) {
                const { error: insertError } = await supabase
                  .from('photos')
                  .insert(photosToInsert);
          
                if (insertError) throw insertError;
                
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
          } catch (err) {
            console.error("Error importing photos:", err);
            setError(err instanceof Error ? err.message : "Importeren mislukt");
          } finally {
            setIsProcessing(false);
          }
        }
      }
    );

    widget.show();
  }, [scriptLoaded, onClose, onComplete, targetYear]);

  return (
    <Dialog open={open} onClose={() => !isProcessing && onClose()} className={`relative z-[${Z_INDEX.BASE_MODAL + 1}]`}>
      <div className={`fixed inset-0 bg-black/30 dark:bg-black/70`} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={cc.card({ className: 'w-full max-w-md p-0' })}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Dialog.Title as="h2" className="text-lg font-medium text-gray-900 dark:text-white">
              Importeer vanuit Cloudinary
            </Dialog.Title>
            <button 
              onClick={onClose}
              className={cc.button.icon({ color: 'secondary' })}
              title="Sluiten"
              disabled={isProcessing}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className={cc.alert({ status: 'error', className: 'mb-4' })}>
                {error}
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Klik op de knop hieronder om je Cloudinary bibliotheek te openen en foto's te selecteren voor import.
            </p>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className={cc.button.base({ color: 'secondary' })}
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={openWidget}
              disabled={!scriptLoaded || isProcessing}
              className={cc.button.base({ color: 'primary' })}
            >
              {isProcessing ? 'Bezig...' : !scriptLoaded ? 'Laden...' : 'Open Cloudinary'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 