import React, { useEffect, useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { supabase } from '../../../lib/supabase';
import { Z_INDEX } from '../../../constants/zIndex';
import type { Photo } from '../types';

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
    if (!scriptLoaded || !window.cloudinary) {
      setError('Cloudinary widget script niet geladen.');
      return;
    }

    setError(null);

    const widget = window.cloudinary.createMediaLibrary(
      {
        cloud_name: CLOUD_NAME,
        api_key: API_KEY,
        multiple: true, // Allow selecting multiple images
        // Add other configuration options if needed
      },
      {
        insertHandler: async (data: { assets: CloudinaryAsset[] }) => {
          if (!data.assets || data.assets.length === 0) {
            onClose(); // Close modal if no assets selected
            return;
          }

          setIsProcessing(true);
          setError(null);
          
          try {
            const startOrderNumber = await getLastOrderNumber();
            let currentOrder = startOrderNumber;

            // TODO: Add duplicate check logic here
            // Fetch existing URLs/public_ids from Supabase?
            // const { data: existingPhotos, error: fetchError } = await supabase.from('photos').select('url, id'); // Example
            // if (fetchError) throw fetchError;
            // const existingUrls = new Set(existingPhotos?.map(p => p.url) || []);

            const photosToInsert: Partial<Photo>[] = [];

            for (const asset of data.assets) {
              // if (existingUrls.has(asset.secure_url)) continue; // Skip duplicates

              photosToInsert.push({
                url: asset.secure_url,
                thumbnail_url: asset.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'), // Basic thumbnail generation
                title: asset.original_filename || asset.public_id,
                alt_text: asset.original_filename || asset.public_id,
                visible: true,
                order_number: currentOrder++,
                year: targetYear || String(new Date().getFullYear()), // Use targetYear or default
              });
            }

            if (photosToInsert.length > 0) {
                const { error: insertError } = await supabase
                  .from('photos')
                  .insert(photosToInsert);
          
                if (insertError) throw insertError;
            }

            onComplete(); // Refresh photo list in PhotosOverview
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
      <div className={`fixed inset-0 bg-black/30 dark:bg-black/60`} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Importeer vanuit Cloudinary
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800/50 text-sm">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Klik op de knop hieronder om je Cloudinary bibliotheek te openen en foto's te selecteren voor import.
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={openWidget}
              disabled={!scriptLoaded || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isProcessing ? 'Bezig...' : !scriptLoaded ? 'Laden...' : 'Open Cloudinary'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Declare Cloudinary on window object for TypeScript
declare global {
  interface Window {
    cloudinary: any;
  }
} 