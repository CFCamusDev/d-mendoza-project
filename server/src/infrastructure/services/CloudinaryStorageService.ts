import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from '@domain/services/IStorageService';

export class CloudinaryStorageService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(fileBuffer: Buffer, fileName: string, folder: string = 'profiles'): Promise<string> {
    return new Promise((resolve, reject) => {
      // Remove extensions and append timestamp for uniqueness
      const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${cleanFileName}_${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading image to Cloudinary:', error);
            return reject(new Error('Error al subir la imagen al servidor de almacenamiento'));
          }
          if (!result) {
            return reject(new Error('No se recibió resultado de la subida a Cloudinary'));
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}
