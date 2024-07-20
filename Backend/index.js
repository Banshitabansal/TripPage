import express from 'express';
import { ZodError, z } from 'zod';
import sheets, { SHEET_ID } from './sheetClient.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

const userDataSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/', async (req, res) => {
  try {
    const body = userDataSchema.parse(req.body);

    const rows = [body.username, body.password, body.email];
    console.log('Rows to be added:', rows);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Data!A:C',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rows],
      },
    });

    console.log('Google Sheets API response:', response);
    res.json({ message: 'Data added successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation Error:', error.errors);
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Internal Server Error:', error.message);
      if (error.response && error.response.data) {
        console.error('Error response data:', error.response.data);
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
