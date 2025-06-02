import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const uploadOnCloudinary = async (filePath, folderName, fileName) => {
    try {
        if(!filePath) return null;
        const imageExtensions = [".jpg", ".jpeg", ".png"]
        const fileExtension = path.extname(filePath).toLowerCase()
        const resourceType = imageExtensions.includes(fileExtension)?"image":"raw"

        const publicId = `${folderName}/${fileName}`
        const uploadOptions = {
            resource_type: resourceType,
            folder: folderName,
            public_id: publicId,
            overwrite: true,
            invalidate: true
        }
        const response = await cloudinary.uploader.upload(filePath, uploadOptions);
        
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
}

export{uploadOnCloudinary};