import { uploadToS3, getPresignedUrl } from "../aws/s3UploadService.js";
import connection from "../database/connection.js";
import fs from "fs";

export const uploadMultipleMedia = async (req, res) => {
  try {
    const userid = req.user.id;
    const { eventid, formid } = req.body;
    const files = req.files;
    if (!files || !files.length) return res.status(400).json({ error: "No files uploaded" });
    const uploadedResults = [];

    // Fetch event_name from event_details
    const eventResult = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT event_name FROM event_details WHERE id = ?",
        [eventid],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
    if (!eventResult.length) return res.status(404).json({ error: "Event not found" });
    const eventName = eventResult[0].event_name;

    // Fetch user email from users
    const userResult = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT email FROM user WHERE id = ?",
        [userid],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
    if (!userResult.length) return res.status(404).json({ error: "User not found" });
    const userEmail = userResult[0].email;

    for (const file of files) {
      // Construct S3 key: event_name/user_email/filename
      const s3Key = `${eventName}/${userEmail}/${file.filename}`;
      await uploadToS3(file.path, s3Key, file.mimetype);

      const data = {
        field_name: file.fieldname,
        file_key: s3Key, // Store S3 key
        file_name: file.originalname,
        mime_type: file.mimetype,
      };

      await new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO media_files (field_name, file_key, file_name, mime_type, event_id, form_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [data.field_name, data.file_key, data.file_name, data.mime_type, eventid, formid, userid],
          (err, result) => {
            fs.unlinkSync(file.path);
            if (err) return reject(err);
            uploadedResults.push({ id: result.insertId, field: data.field_name });
            resolve();
          }
        );
      });
    }

    res.status(201).json({ message: "All files uploaded", files: uploadedResults });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const getMediaById = (req, res) => {
  const { id } = req.params;

  connection.query("SELECT * FROM media_files WHERE id = ?", [id], async (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!rows.length) return res.status(404).json({ error: "File not found" });

    const file = rows[0];
    try {
      const url = await getPresignedUrl(file.file_key); // Generate presigned URL
      res.json({ mimeType: file.mime_type, url });
    } catch (e) {
      console.error("Presign error:", e);
      res.status(500).json({ error: "Could not generate file URL" });
    }
  });
};

export const getMediaByField = (req, res) => {
  const { field } = req.params;

  connection.query("SELECT * FROM media_files WHERE field_name = ?", [field], async (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!rows.length) return res.status(404).json({ error: "No file found for this field" });

    const results = [];
    for (const row of rows) {
      const url = await getPresignedUrl(row.file_key); // Generate presigned URL
      results.push({ field_name: row.field_name, mimeType: row.mime_type, url });
    }

    res.json({ files: results });
  });
};