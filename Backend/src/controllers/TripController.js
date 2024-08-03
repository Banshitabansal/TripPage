import { google } from "googleapis";
import { auth, sheets, GOOGLE_SHEET_ID } from "../config/googleSheetsConfig.js";
import Entry from "../models/Entry.js";

const RANGE = "Entries!A2:M";
const range = 'EmployeeData!A2:B';

//function for append data to googlesheet
async function appendData(auth, data) {
  const sheets = google.sheets({ version: "v4", auth });
  const resource = {
    values: data,
  };
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    resource,
  });
}

//function for fetch last ids from googlesheet
async function fetchLastIdsFromGoogleSheets(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;
  let lastPaymentId = 0;
  let lastPlanID = 0;

  if (rows && rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    lastPaymentId = parseInt(lastRow[0].split("-")[1], 10) || 0;
    lastPlanID = parseInt(lastRow[1].split("-")[1], 10) || 0;
  }

  return { lastPaymentId, lastPlanID };
}

//function for fetch last ids from mongodb
async function fetchLastIdsFromMongoDB() {
  const lastEntry = await Entry.findOne().sort({ _id: -1 }).exec();
  if (lastEntry) {
    const lastPaymentId = parseInt(lastEntry.paymentId.split("-")[1], 10) || 0;
    const lastPlanID = parseInt(lastEntry.planID.split("-")[1], 10) || 0;
    return { lastPaymentId, lastPlanID };
  }
  return { lastPaymentId: 0, lastPlanID: 0 };
}

//function for update data in googlesheet and mongodb
async function getSheetData(auth) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: RANGE,
  });
  return response.data.values;
}

//fetch Employee Id data to googlesheet
const employeeData = async (req, res) => {
  try {
    const authClient = await auth.getClient();

    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: GOOGLE_SHEET_ID,
      range: range,
    });

    const data = response.data.values;
    const formattedOptions = data.map((row) => ({
      value: row[0],
      label: `${row[0]} - ${row[1]}`,
    }));
    res.json(formattedOptions);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).json({ error: 'Error fetching data from Google Sheets' });
  }
};

//fetch last ids from googlesheet and mongodb
const getLastIds = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.Secret_File,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const googleSheetIds = await fetchLastIdsFromGoogleSheets(authClient);
    const mongoDBIds = await fetchLastIdsFromMongoDB();

    // Compare and determine the highest IDs
    const lastPaymentId = Math.max(
      googleSheetIds.lastPaymentId,
      mongoDBIds.lastPaymentId
    );
    const lastPlanID = Math.max(
      googleSheetIds.lastPlanID,
      mongoDBIds.lastPlanID
    );

    res.json({ lastPaymentId, lastPlanID });
  } catch (error) {
    console.error("Error fetching last IDs:", error);
    res.status(500).send("Internal Server Error");
  }
};

//submit data to googlesheet and mongodb
const submitData = async (req, res) => {
  const { data } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).send("Invalid data format");
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: "./secret.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  try {
    const authClient = await auth.getClient();
    const formattedData = data.map((row) => [
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
      row.remarks,
    ]);

    // Save to Google Sheets
    await appendData(authClient, formattedData);

    // Save to MongoDB
    const entries = data.map((row) => new Entry(row));
    await Entry.insertMany(entries);

    res.status(200).send("Data submitted successfully");
  } catch (error) {
    console.error("Error submitting data:", error);
    res.status(500).send("Error submitting data");
  }
};

//fetch data from googlesheet and mongodb
const fetchEntries = async (req, res) => {
  const { paymentId } = req.query;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: RANGE,
    });

    const dataFromSheets = response.data.values || [];
    const filteredDataFromSheets = dataFromSheets.filter(
      (row) => row[0] === paymentId && row[12] !== "Deleted"
    );

    const filteredDataFromMongoDB = await Entry.find({
      paymentId: paymentId,
      status: { $ne: "Deleted" },
    });

    const combinedData = [
      ...filteredDataFromMongoDB.map((entry) => [
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
      ]),
    ];

    if (combinedData.length > 0) {
      res.json({ success: true, data: combinedData });
    } else {
      res.json({
        success: false,
        message: "Payment ID not found or marked as deleted",
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//update data in googlesheet and mongodb
const updateSheetData = async (req, res) => {
  const {
    paymentId,
    planId,
    serialNo,
    employeeIds,
    employeeNames,
    selectOption,
    selectOptions,
    selectSR,
    currency,
    mode,
    amount,
    remarks,
    deletedEntries,
  } = req.body;

  if (!paymentId || !serialNo) {
    console.error("Invalid data format:", req.body);
    return res.status(400).send("Invalid data format");
  }

  try {
    const authClient = await auth.getClient();
    const sheetData = await getSheetData(authClient);

    const rowIndex =
      sheetData.findIndex(
        (row) => row[0] === paymentId && row[2] === serialNo
      ) + 1;

    if (rowIndex === -1) {
      console.error("Entry not found:", { paymentId, serialNo });
      return res.status(404).send("Entry not found");
    }

    const formattedData = [
      paymentId,
      planId,
      serialNo,
      employeeIds,
      employeeNames,
      selectOption,
      selectOptions,
      selectSR,
      currency.label,
      mode,
      amount,
      remarks,
    ];

    console.log("Updating row at index:", rowIndex);
    console.log("Formatted data:", formattedData);

    // Update MongoDB
    const update = {
      planId,
      employeeIds,
      employeeNames,
      selectOption,
      selectOptions,
      selectSR,
      currency: currency.label,
      mode,
      amount,
      remarks,
    };
    await Entry.findOneAndUpdate({ paymentId, serialNo }, update, {
      upsert: true,
    });

    const range = `Entries!A${rowIndex + 1}:M${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      resource: { values: [formattedData] },
    });

    res.status(200).send("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Error updating data");
  }
};

//delete data from googlesheet and mongodb
const deleteData = async (req, res) => {
  try {
    const { paymentId, deletedEntries } = req.body;

    const getRows = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Entries!A:M",
    });

    const rows = getRows.data.values;
    const dataRows = rows.slice(1);

    for (let entry of deletedEntries) {
      let rowIndex = -1;
      for (let i = 0; i < dataRows.length; i++) {
        const [paymentID, planID, serialNO] = dataRows[i];
        if (paymentID === paymentId && serialNO === entry) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        const range = `Entries!M${rowIndex + 1}`;
        await sheets.spreadsheets.values.update({
          auth,
          spreadsheetId: GOOGLE_SHEET_ID,
          range: range,
          valueInputOption: "USER_ENTERED",
          resource: {
            values: [["Deleted"]],
          },
        });

        // Mark as deleted in MongoDB
        await Entry.findOneAndUpdate(
          { paymentId, serialNo: entry },
          { status: "Deleted" }
        );
      } else {
        console.log(
          `Row with serialNo=${entry} and paymentId=${paymentId} not found`
        );
      }
    }

    res.status(200).send("Cells updated successfully");
  } catch (error) {
    console.error("Error updating cell in Google Sheets:", error);
    res.status(500).send("An error occurred while updating the cell.");
  }
};

export { employeeData, getLastIds, submitData, fetchEntries, updateSheetData, deleteData };