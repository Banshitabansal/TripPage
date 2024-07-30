import express from "express";
import {
  getLastIds,
  submitData,
  fetchEntries,
  updateSheetData,
  deleteData,
} from "../controllers/TripController.js";

const router = express.Router();

router.get("/getLastIds", getLastIds);

router.post("/submit", submitData);

router.get("/fetch", fetchEntries);

router.put("/updateGoogleSheet", updateSheetData);

router.post("/deleteGoogleSheet", deleteData);

export default router;
