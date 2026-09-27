import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const getPublicIdFromUrl = (fileUrl) => {
  const url = new URL(fileUrl);
  if (url.hostname !== 'res.cloudinary.com') {
    return null;
  }

  const uploadPath = url.pathname.split('/upload/')[1];
  if (!uploadPath) {
    return null;
  }

  const pathParts = uploadPath.split('/');
  const versionIndex = pathParts.findIndex((part) => /^v\d+$/.test(part));
  const assetPath = pathParts.slice(versionIndex + 1).join('/');
  if (!assetPath) {
    return null;
  }

  return decodeURIComponent(assetPath).replace(/\.[^/.]+$/, '');
};

export const uploadFile = async (imageData, imageName) => {
  try {
    const dataUri = imageData.startsWith('data:')
      ? imageData
      : `data:image/jpeg;base64,${imageData}`;
    const publicId = imageName.replace(/\.[^.]+$/, '');
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: publicId,
      resource_type: 'image',
      overwrite: true
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary image upload failed:', {
      name: error.name || 'Error',
      statusCode: error.http_code || error.statusCode || null,
      message: error.message || 'No provider error message'
    });
    throw new Error('Failed to upload image');
  }
};

export const deleteFile = async (fileUrl) => {
  try {
    const publicId = getPublicIdFromUrl(fileUrl);
    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error('Cloudinary image deletion failed:', error.name || 'Error');
    throw new Error('Failed to delete image');
  }
};