import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadDoctorImage(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'medical-center/doctors',
        public_id: `doctor_${Date.now()}`,
        overwrite: false,
        quality: 'auto',
        transformation: [
          { width: 400, height: 400, gravity: 'face', crop: 'thumb' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteDoctorImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

export async function getSecureUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return null;
  return cloudinaryUrl.replace(/^http:/, 'https:');
}

export default {
  uploadDoctorImage,
  deleteDoctorImage,
  getSecureUrl
};