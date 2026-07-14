import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });

    export const uploadImage = async (image) => {
        try {
            const result = await cloudinary.uploader.upload(image, {
                resource_type: 'auto',
            });
            return result.url;
        } catch (error) {
          fs.unlinkSync(image);
          return null;
        }
    }
    