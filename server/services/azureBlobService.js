import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

export const uploadImage = async (imageData, imageName) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(imageName);

    // Strip any prefix from base64 data, if present
    const base64Data = imageData.split(",")[1] || imageData;
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload with specific HTTP headers to ensure proper handling
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });
    
    console.log("Image uploaded:", blockBlobClient.url);
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading image:", error.message);
    throw new Error("Failed to upload image to Azure Blob Storage");
  }
};

// Add a function to delete an image from Azure Blob Storage
export const deleteImage = async (imageUrl) => {
  try {
    const blobName = imageUrl.split("/").pop(); // Extract the blob name from the URL
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Delete the blob
    await blockBlobClient.delete();
    console.log("Image deleted from Azure Blob Storage:", imageUrl);
  } catch (error) {
    console.error("Error deleting image:", error.message);
    throw new Error("Failed to delete image from Azure Blob Storage");
  }
};
