// This service handles interactions with the Walrus decentralized storage
import axios from 'axios';

// Walrus API configuration
const WALRUS_API_URL = 'https://api.walrus.storage';
const WALRUS_GATEWAY_URL = 'https://gateway.walrus.storage';

// Initialize Walrus API client
const walrusClient = axios.create({
  baseURL: WALRUS_API_URL,
  timeout: 30000, // 30 seconds timeout for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload a file to Walrus storage
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - The upload result
 */
export const uploadFile = async (file, onProgress = () => { }) => {
  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);

    // Get upload URL from Walrus API
    const { data: uploadData } = await walrusClient.post('/upload/prepare', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    // Upload the file to the provided URL
    const uploadResponse = await axios.put(uploadData.uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      },
    });

    // Finalize the upload
    const { data: finalizeData } = await walrusClient.post('/upload/finalize', {
      uploadId: uploadData.uploadId,
    });

    return {
      success: true,
      fileHash: finalizeData.fileHash,
      fileSize: file.size,
      mimeType: file.type,
      url: `${WALRUS_GATEWAY_URL}/${finalizeData.fileHash}`
    };
  } catch (error) {
    console.error('Error uploading file to Walrus:', error);
    throw error;
  }
};

/**
 * Retrieve a file from Walrus storage
 * @param {string} fileHash - The hash of the file to retrieve
 * @returns {Promise<Blob>} - The file blob
 */
export const retrieveFile = async (fileHash) => {
  try {
    // Get the file from Walrus gateway
    const response = await axios.get(`${WALRUS_GATEWAY_URL}/${fileHash}`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    console.error('Error retrieving file from Walrus:', error);
    throw error;
  }
};

/**
 * Check if a file exists in Walrus storage
 * @param {string} fileHash - The hash of the file to check
 * @returns {Promise<boolean>} - Whether the file exists
 */
export const checkFileExists = async (fileHash) => {
  try {
    // Check if the file exists by making a HEAD request
    const response = await axios.head(`${WALRUS_GATEWAY_URL}/${fileHash}`);
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    console.error('Error checking file existence in Walrus:', error);
    throw error;
  }
};

/**
 * Get the URL for a file in Walrus storage
 * @param {string} fileHash - The hash of the file
 * @returns {string} - The URL
 */
export const getFileUrl = (fileHash) => {
  return `${WALRUS_GATEWAY_URL}/${fileHash}`;
};

/**
 * Get file metadata from Walrus storage
 * @param {string} fileHash - The hash of the file
 * @returns {Promise<Object>} - The file metadata
 */
export const getFileMetadata = async (fileHash) => {
  try {
    const { data } = await walrusClient.get(`/files/${fileHash}/metadata`);
    return data;
  } catch (error) {
    console.error('Error getting file metadata from Walrus:', error);
    throw error;
  }
};

/**
 * Upload a large file to Walrus storage using chunked upload
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - The upload result
 */
export const uploadLargeFile = async (file, onProgress = () => { }) => {
  try {
    // Chunk size: 5MB
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Initialize multipart upload
    const { data: initData } = await walrusClient.post('/upload/multipart/init', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      totalChunks,
    });

    const { uploadId } = initData;
    const uploadedParts = [];

    // Upload each chunk
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      // Get part upload URL
      const { data: partData } = await walrusClient.post('/upload/multipart/part', {
        uploadId,
        partNumber: i + 1,
      });

      // Upload the chunk
      const partResponse = await axios.put(partData.uploadUrl, chunk, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          const chunkProgress = progressEvent.loaded / progressEvent.total;
          const overallProgress = ((i + chunkProgress) / totalChunks) * 100;
          onProgress(Math.round(overallProgress));
        },
      });

      uploadedParts.push({
        partNumber: i + 1,
        etag: partResponse.headers.etag,
      });
    }

    // Complete multipart upload
    const { data: completeData } = await walrusClient.post('/upload/multipart/complete', {
      uploadId,
      parts: uploadedParts,
    });

    return {
      success: true,
      fileHash: completeData.fileHash,
      fileSize: file.size,
      mimeType: file.type,
      url: `${WALRUS_GATEWAY_URL}/${completeData.fileHash}`
    };
  } catch (error) {
    console.error('Error uploading large file to Walrus:', error);
    throw error;
  }
};
