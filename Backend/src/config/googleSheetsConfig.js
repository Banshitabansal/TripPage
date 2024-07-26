import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
    keyFile: 'secret.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const GOOGLE_SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';


export {auth, sheets, GOOGLE_SHEET_ID};
