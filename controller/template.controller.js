import {
  getTemplatesByEvent,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateByName,
} from "../service/template.service.js";

// ✅ GET ALL
export const getTemplates = async (req, res) => {
  try {
    const { eventId } = req.query;

    const data = await getTemplatesByEvent(eventId);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ONE
export const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId } = req.query;

    const data = await getTemplateById(id, eventId);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE
export const createNewTemplate = async (req, res) => {
  try {
    const id = await createTemplate(req.body);

    res.json({ success: true, message: "Created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
export const updateTemplateData = async (req, res) => {
  try {
    const { id } = req.params;

    await updateTemplate(id, req.body);

    res.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE
export const deleteTemplateData = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId } = req.body;

    await deleteTemplate(id, eventId);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTemplateByNameController = async (req, res) => {
  try {
    const { name, eventId } = req.query;

    console.log("Searching:", name, eventId);

    const data = await getTemplateByName(name, eventId);

    console.log("DB Result:", data);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};