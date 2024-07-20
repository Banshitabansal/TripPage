import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; 
import { google } from 'googleapis';

const app = express();
const port = 3003;

app.use(bodyParser.json());
app.use(cors());

const SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';
const RANGE = 'Entries!A2:L'; 

const auth = new google.auth.GoogleAuth({
  keyFile: './secret.json', 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function getSheetData(auth) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  return response.data.values;
}


const updateSheetData = async (auth, rowIndex, updateData) => {
  const range = `Entries!A${rowIndex + 1}:L${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [updateData] },
  });
};

app.put('/updateGoogleSheet', async (req, res) => {
  const { paymentId, planId, serialNo, employeeIds, employeeNames, selectOption, selectOptions, selectSR,  currency, mode, amount, remarks } = req.body;
  console.log("pay",req.body)
  if (!paymentId || !serialNo) {
    console.error('Invalid data format:', req.body);
    return res.status(400).send('Invalid data format');
  }

  try {
    const authClient = await auth.getClient();
    const sheetData = await getSheetData(authClient);

    const rowIndex = sheetData.findIndex(
      row => row[0] === paymentId && row[2] === serialNo
    ) + 1;
    console.log("row",rowIndex);
    if (rowIndex === -1) {
      console.error('Entry not found:', { paymentId, serialNo });
      return res.status(404).send('Entry not found');
    }

    const formattedData = [paymentId, planId, serialNo, employeeIds, employeeNames, selectOption, selectOptions, selectSR,  currency.label, mode, amount, remarks];

    console.log('Updating row at index:', rowIndex);
    console.log('Formatted data:', formattedData);

    await updateSheetData(authClient, rowIndex, formattedData);
    res.status(200).send('Data updated successfully');
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).send('Error updating data');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
