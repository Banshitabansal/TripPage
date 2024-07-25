import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { google } from 'googleapis';
import Entry from './models/Entry.js';

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

const SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';
const RANGE = 'Entries!A2:L'; 

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Entries', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

async function appendData(auth, data) {
  const sheets = google.sheets({ version: 'v4', auth });
  const resource = {
    values: data,
  };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    resource,
  });
}

app.post('/submit', async (req, res) => {
  const { data } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).send('Invalid data format');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: './secret.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  try {
    const authClient = await auth.getClient();
    const formattedData = data.map(row => [
      row.paymentId,
      row.planID,
      row.serialNo,
      row.employeeId, 
      row.employeeName, 
      row.selectOption,
      row.selectOptions,
      row.selectSR,
      row.currency,
      row.mode,
      row.amount,
      row.remarks
    ]);

    // Save to Google Sheets
    await appendData(authClient, formattedData);

    // Save to MongoDB
    const entries = data.map(row => new Entry(row));
    await Entry.insertMany(entries);

    res.status(200).send('Data submitted successfully');
  } catch (error) {
    console.error('Error submitting data:', error);
    res.status(500).send('Error submitting data');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
