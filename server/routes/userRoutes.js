import express from "express";
import { notImplemented } from "../controllers/userController.js";

const router = express.Router();

router.get("/", notImplemented);

export default router;
