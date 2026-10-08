import multer from 'multer';

const allowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 Megabytes max limit
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, PNG, and JPG/JPEG files are accepted.`));
    }
  }
});
