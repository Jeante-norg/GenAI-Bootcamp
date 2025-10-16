const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
const singleUpload = upload.single("file");
module.exports = { singleUpload };