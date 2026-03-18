import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../aws/s3Client.js";

export const uploadToS3 = async (filePath, fileKey, mimeType) => {
  const stream = fs.createReadStream(filePath);

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: stream,
      ContentType: mimeType,
    },
  });

  await upload.done();
};

export const getPresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
};