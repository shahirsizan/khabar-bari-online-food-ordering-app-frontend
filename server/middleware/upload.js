import multer from "multer";

// We use memoryStorage so the file is kept in RAM (buffer)
// instead of saving it to your server's disk.
export const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size to 5MB
});
