interface ImageUploadOptions {
  onProgress?: (percent: number) => void;
  onSuccess?: (result: ImageUploadResult) => void;
  onError?: (error: Error) => void;
}

interface BatchUploadOptions {
  onProgress?: (percent: number) => void;
  onSuccess?: (result: BatchUploadResult) => void;
  onError?: (error: Error) => void;
  onFileProgress?: (params: { fileIndex: number; fileName: string; progress: number }) => void;
  onBatchProgress?: (params: { completed: number; total: number; currentFile?: string }) => void;
}

interface ImageUploadResult {
  success: boolean;
  data: {
    public_id: string;
    url: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

interface BatchUploadResult {
  success: boolean;
  data: Array<{
    public_id: string;
    url: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  }>;
  uploaded_count: number;
  total_files: number;
  mode: string;
}

interface ChatMessageResult {
  success: boolean;
  message: {
    id: string;
    channel_id: string;
    content: string;
    image_url?: string;
    created_at: string;
  };
}

export class ImageUploadClient {
  private authToken: string;
  private apiBaseUrl: string;
  private maxFileSize: number;
  private maxBatchSize: number;
  private allowedTypes: string[];

  constructor(config: {
    authToken: string;
    apiBaseUrl?: string;
    maxFileSize?: number;
    maxBatchSize?: number;
    allowedTypes?: string[];
  }) {
    this.authToken = config.authToken;
    this.apiBaseUrl = config.apiBaseUrl || '/api';
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxBatchSize = config.maxBatchSize || 10;
    this.allowedTypes = config.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
  }

  private getHeaders(includeContentType: boolean = true): HeadersInit {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.authToken}`
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  private validateFile(file: File): void {
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`);
    }
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large: ${file.size} bytes (max ${this.maxFileSize})`);
    }
  }

  async uploadImage(file: File, options: ImageUploadOptions = {}): Promise<ImageUploadResult> {
    this.validateFile(file);

    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && response.success) {
            options.onSuccess?.(response);
            resolve(response);
          } else {
            const error = new Error(response.message || 'Upload failed');
            options.onError?.(error);
            reject(error);
          }
        } catch (error) {
          options.onError?.(error as Error);
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error = new Error('Network error');
        options.onError?.(error);
        reject(error);
      };

      xhr.open('POST', `${this.apiBaseUrl}/api/images/upload`);
      const headers = this.getHeaders(false);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(formData);
    });
  }

  async uploadBatchImages(files: File[], options: BatchUploadOptions = {}): Promise<BatchUploadResult> {
    if (files.length > this.maxBatchSize) {
      throw new Error(`Too many files: ${files.length} (max ${this.maxBatchSize})`);
    }

    files.forEach(file => this.validateFile(file));

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && response.success) {
            options.onSuccess?.(response);
            resolve(response);
          } else {
            const error = new Error(response.message || 'Batch upload failed');
            options.onError?.(error);
            reject(error);
          }
        } catch (error) {
          options.onError?.(error as Error);
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error = new Error('Network error');
        options.onError?.(error);
        reject(error);
      };

      xhr.open('POST', `${this.apiBaseUrl}/api/images/batch-upload?mode=parallel`);
      const headers = this.getHeaders(false);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(formData);
    });
  }

  async uploadBatchImagesSequential(files: File[], options: BatchUploadOptions = {}): Promise<BatchUploadResult> {
    if (files.length > this.maxBatchSize) {
      throw new Error(`Too many files: ${files.length} (max ${this.maxBatchSize})`);
    }

    const results: ImageUploadResult['data'][] = [];
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadImage(file, {
          onProgress: (progress) => {
            options.onFileProgress?.({
              fileIndex: i,
              fileName: file.name,
              progress
            });
          }
        });
        results.push(result.data);
        completed++;
        options.onBatchProgress?.({
          completed,
          total: files.length,
          currentFile: file.name
        });
      } catch (error) {
        options.onError?.(error as Error);
        throw error;
      }
    }

    const batchResult: BatchUploadResult = {
      success: true,
      data: results,
      uploaded_count: results.length,
      total_files: files.length,
      mode: 'sequential'
    };

    options.onSuccess?.(batchResult);
    return batchResult;
  }

  async sendChatImage(channelId: string, file: File, caption: string = '', options: ImageUploadOptions = {}): Promise<ChatMessageResult> {
    this.validateFile(file);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && response.success) {
            options.onSuccess?.(response);
            resolve(response);
          } else {
            const error = new Error(response.message || 'Chat image send failed');
            options.onError?.(error);
            reject(error);
          }
        } catch (error) {
          options.onError?.(error as Error);
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error = new Error('Network error');
        options.onError?.(error);
        reject(error);
      };

      xhr.open('POST', `${this.apiBaseUrl}/api/chat/channels/${channelId}/messages`);
      const headers = this.getHeaders(false);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(formData);
    });
  }

  async getImageMetadata(publicId: string): Promise<ImageUploadResult['data']> {
    const response = await fetch(`${this.apiBaseUrl}/api/images/${publicId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get image metadata');
    }

    return await response.json();
  }

  async deleteImage(publicId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/images/${publicId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  }
}