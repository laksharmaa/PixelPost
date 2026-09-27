import * as cloudinaryStorage from '../storage/cloudinaryStorage.js';

const providers = {
  cloudinary: cloudinaryStorage
};

const providerName = process.env.STORAGE_PROVIDER || 'cloudinary';
const storageProvider = providers[providerName];

if (!storageProvider) {
  throw new Error(`Unsupported storage provider: ${providerName}`);
}

export const uploadFile = (...args) => storageProvider.uploadFile(...args);
export const deleteFile = (...args) => storageProvider.deleteFile(...args);