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
              });
            }

            if (photosToInsert.length > 0) {
                const { error: insertError } = await supabase
                  .from('photos')
                  .insert(photosToInsert);

                if (insertError) {
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
            console.error("Error importing photos:", err);
            setError(err instanceof Error ? err.message : "Importeren mislukt");
            setIsProcessing(false); // Stop processing on error
          }
        }
      }
    );

    widget.show();
  }, [scriptLoaded, onClose, onComplete, targetYear]);

  return (
    <Dialog open={open} onClose={() => !isProcessing && onClose()} className={`relative z-[${Z_INDEX.BASE_MODAL + 1}]`}>
      {/* ... rest of the JSX ... */}
    </Dialog>
  );
}