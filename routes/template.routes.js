import express from "express";
import { createNewTemplate, deleteTemplateData, getTemplate, getTemplateByNameController, getTemplates, updateTemplateData } from "../controller/template.controller.js";

const router = express.Router();

// GET ALL (event wise)
router.get("/", getTemplates);

// GET ONE
router.get("/:id", getTemplate);

// CREATE
router.post("/", createNewTemplate);

// UPDATE
router.put("/:id", updateTemplateData);

// DELETE
router.delete("/:id", deleteTemplateData);



router.get("/by-name", getTemplateByNameController);
export default router;