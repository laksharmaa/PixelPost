import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

export const uploadFile = async (imageData, imageName) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(imageName);
    const base64Data = imageData.split(',')[1] || imageData;
    const buffer = Buffer.from(base64Data, 'base64');

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Image upload failed:', error.name || 'Error');
    throw new Error('Failed to upload image');
  }
};

export const deleteFile = async (fileUrl) => {
  try {
    const blobName = fileUrl.split('/').pop();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  } catch (error) {
    console.error('Image deletion failed:', error.name || 'Error');
    throw new Error('Failed to delete image');
  }
};