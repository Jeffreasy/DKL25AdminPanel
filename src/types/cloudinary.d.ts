// Define the structure for the Cloudinary object attached to the window
// This can be expanded if more Cloudinary widget features are used elsewhere

// Define the Cloudinary Asset structure globally
interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  thumbnail_url?: string;
  original_filename?: string;
  width?: number;
  height?: number;
  // Add other relevant fields returned by Cloudinary
}

declare global {
  interface Window {
    cloudinary?: {
      createMediaLibrary: (
        config: {
          cloud_name?: string;
          api_key?: string;
          multiple?: boolean;
          // Add other config options as needed
        },
        callbacks: {
          insertHandler: (data: { assets: CloudinaryAsset[] }) => void; // Use specific type
          // Add other callbacks as needed
        }
      ) => {
        show: () => void;
        // Add other widget methods as needed
      };
      // Add other top-level Cloudinary methods if needed
    };
  }
}

// Removed the export {} to make this an ambient declaration file 