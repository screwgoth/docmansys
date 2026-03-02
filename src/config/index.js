require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY || '24h'
  },
  
  document: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,tiff').split(',')
  },
  
  retention: {
    archiveAfterYears: parseInt(process.env.ARCHIVE_AFTER_YEARS) || 7
  },
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'docmansys',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  }
};
