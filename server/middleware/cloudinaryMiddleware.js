const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Custom Multer storage engine for Cloudinary
 * Replaces the legacy `multer-storage-cloudinary` package to eliminate peer dependency conflicts
 * with modern cloudinary v2+ releases.
 */
class CloudinaryStorage {
  constructor(opts = {}) {
    this.cloudinary = opts.cloudinary || cloudinary;
    this.params = opts.params || {};
  }

  _handleFile(req, file, cb) {
    const publicId = typeof this.params.public_id === 'function'
      ? this.params.public_id(req, file)
      : this.params.public_id;
    const folder = typeof this.params.folder === 'function'
      ? this.params.folder(req, file)
      : this.params.folder;

    const uploadOptions = {
      overwrite: true,
      resource_type: 'image',
    };

    if (folder) uploadOptions.folder = folder;
    if (publicId) uploadOptions.public_id = publicId;
    if (this.params.allowed_formats) uploadOptions.allowed_formats = this.params.allowed_formats;

    const uploadStream = this.cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, result) => {
        if (err) return cb(err);
        cb(null, {
          path: result.secure_url,
          size: result.bytes,
          filename: result.public_id,
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    if (file && file.filename) {
      this.cloudinary.uploader.destroy(file.filename, { invalidate: true }, cb);
    } else {
      cb(null);
    }
  }
}

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'webp'],
    public_id: (req, file) => `user-${req.user.id}`, // Automatically overwrites existing
  },
});

// Configure Multer with limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

module.exports = upload;
