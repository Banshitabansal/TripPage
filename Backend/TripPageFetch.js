import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const GOOGLE_SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';
const RANGE = 'Entries!A2:L';

const auth = new google.auth.GoogleAuth({
    keyFile: './secret.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.get('/fetch', async (req, res) => {
    const { paymentId } = req.query;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: RANGE,
        });

        const data = response.data.values;
        
        const filteredData = data.filter(row => row[0] === paymentId);

        if (filteredData.length > 0) {
            res.json({ success: true, data: filteredData });
        } else {
            res.json({ success: false, message: 'Payment ID not found' });
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
