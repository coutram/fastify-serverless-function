const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToStorage = async (file) => {
  try {
    const buffer = await file.toBuffer();
    const key = `campaign/campaign-icons/${Date.now()}-${file.filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Generate a signed URL for the uploaded file
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return signedUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

module.exports = {
  uploadToStorage,
}; 