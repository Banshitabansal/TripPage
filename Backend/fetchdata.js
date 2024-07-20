import express from 'express';
import {google} from 'googleapis';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const sheetId = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8'; 
const range = 'Data!A:C';



const auth = new google.auth.GoogleAuth({
  keyFile: './secret.json', 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.get('/', async (req, res) => {
  const searchTerm = req.query.q;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values || [];
    const filteredRows = rows.filter(row => row.some(cell => cell.includes(searchTerm)));
    res.json(filteredRows);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
