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
  const range = `Entries!A${rowIndex + 1}:M${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [updateData] },
  });
};

app.put('/updateGoogleSheet', async (req, res) => {
  const { paymentId, planId, serialNo, employeeIds, employeeNames, selectOption, selectOptions, selectSR,  currency, mode, amount, remarks, deletedEntries} = req.body;
  console.log("delete",deletedEntries);
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


//delete data from googlesheet
const deleteData = async (req, res) => {
  try {
    const { paymentId, deletedEntries } = req.body; 
    console.log(req.body)


    console.log(req.body);
    
    const getRows = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SHEET_ID,
      range: 'Entries!A:M', 
    });
    
    const rows = getRows.data.values;
    const dataRows = rows.slice(1);
    
    for (let entry of deletedEntries) {
      
      let rowIndex = -1;
      for (let i = 0; i < dataRows.length; i++) {
        const [paymentID, planID, serialNO] = dataRows[i];
        console.log(`Checking row ${i + 1}: payment=${paymentID}, sr=${serialNO}`);
        if (paymentID === paymentId && serialNO === entry ) {
          rowIndex = i + 1; 
          break;
        }
      }
      
      if (rowIndex !== -1) {
       
        const range = `Entries!M${rowIndex + 1}`; 
        const update = await sheets.spreadsheets.values.update({
          auth,
          spreadsheetId: SHEET_ID,
          range: range,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['Deleted']], 
          },
        });

        console.log(`Row ${rowIndex} marked as deleted`);
      } else {
        console.log(`Row with sr=${entry} and date=${paymentId} not found`);
      }
    }
    
    res.status(200).send('Cells updated successfully');
  } catch (error) {
    console.error('Error updating cell in Google Sheets:', error);
    res.status(500).send('An error occurred while updating the cell.');
  }
};


app.post('/deleteGoogleSheet',deleteData)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});