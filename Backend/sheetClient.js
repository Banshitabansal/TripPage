import { google } from 'googleapis';

const SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';  

const auth = new google.auth.GoogleAuth({
    keyFile: './secret.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export default sheets;
export { SHEET_ID };
