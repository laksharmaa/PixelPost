import * as azureBlobStorage from '../storage/azureBlobStorage.js';

const providers = {
  azure: azureBlobStorage
};

const providerName = process.env.STORAGE_PROVIDER || 'azure';
const storageProvider = providers[providerName];

if (!storageProvider) {
  throw new Error(`Unsupported storage provider: ${providerName}`);
}

export const uploadFile = (...args) => storageProvider.uploadFile(...args);
export const deleteFile = (...args) => storageProvider.deleteFile(...args);