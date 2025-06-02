import multer from "multer";
import path from "path";

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"]

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase()
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"))
    }
}

export const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024*1024*5} });