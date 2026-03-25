import db from "../database/connection.js";

// ✅ GET ALL (by event)
export function getTemplatesByEvent(eventId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM email_templates 
      WHERE eventId = ?
      ORDER BY id DESC
    `;

    db.query(sql, [eventId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// ✅ GET SINGLE
export function getTemplateById(id, eventId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM email_templates 
      WHERE id = ? AND eventId = ?
    `;

    db.query(sql, [id, eventId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

// ✅ CREATE
export function createTemplate(data) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO email_templates (eventId, name, subject, content)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [data.eventId, data.name, data.subject, data.content],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
}

// ✅ UPDATE
export function updateTemplate(id, data) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE email_templates 
      SET subject = ?, content = ?
      WHERE id = ? AND eventId = ?
    `;

    db.query(
      sql,
      [data.subject, data.content, id, data.eventId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// ✅ DELETE
export function deleteTemplate(id, eventId) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM email_templates 
      WHERE id = ? AND eventId = ?
    `;

    db.query(sql, [id, eventId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}