import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.Secret_File,
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const client = await auth.getClient();
const sheets = google.sheets({ version: "v4", auth: client });
const GOOGLE_SHEET_ID = process.env.Google_Sheet_Id;

export { auth, sheets, GOOGLE_SHEET_ID };
