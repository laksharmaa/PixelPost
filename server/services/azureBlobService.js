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

