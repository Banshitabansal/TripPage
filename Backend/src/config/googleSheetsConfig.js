import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    private_key: process.env.Private_Key.replace(/\\n/g, '\n'),
    client_email: process.env.Client_Email,
  },
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const client = await auth.getClient();
const sheets = google.sheets({ version: "v4", auth: client });
const GOOGLE_SHEET_ID = process.env.Google_Sheet_Id;

export { auth, sheets, GOOGLE_SHEET_ID };
