import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../aws/s3Client.js";

export const getPresignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await connection.query(
      "SELECT file_key FROM media_files WHERE id = ?",
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "File not found" });

    const signedUrl = await getPresignedUrl(rows[0].file_key);
    res.json({ url: signedUrl });
  } catch (err) {
    console.error("View error:", err);
    res.status(500).json({ error: "Could not generate URL" });
  }
};