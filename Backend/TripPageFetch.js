import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import mongoose from 'mongoose';
import Entry from './models/Entry.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const GOOGLE_SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';
const RANGE = 'Entries!A2:M';

const auth = new google.auth.GoogleAuth({
    keyFile: './secret.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Entries', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.get('/fetch', async (req, res) => {
    const { paymentId } = req.query;

    try {
        // Fetch data from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: RANGE,
        });

        const dataFromSheets = response.data.values || [];

        // Filter out rows where column 0 is the paymentId and column 12 is not 'Deleted'
        const filteredDataFromSheets = dataFromSheets.filter(row => row[0] === paymentId && row[12] !== 'Deleted');

        // Fetch data from MongoDB
        const filteredDataFromMongoDB = await Entry.find({ paymentId: paymentId, status: { $ne: 'Deleted' } });

        // Combine data from Google Sheets and MongoDB
        const combinedData = [
            // ...filteredDataFromSheets,
            ...filteredDataFromMongoDB.map(entry => [
                entry.paymentId,
                entry.planID,
                entry.serialNo,
                entry.employeeId, 
                entry.employeeName, 
                entry.selectOption,
                entry.selectOptions,
                entry.selectSR,
                entry.currency,
                entry.mode,
                entry.amount,
                entry.remarks,
                entry.status,
            ])
        ];

        if (combinedData.length > 0) {
            res.json({ success: true, data: combinedData });
        } else {
            res.json({ success: false, message: 'Payment ID not found or marked as deleted' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});