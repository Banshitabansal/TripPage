import React, { useState } from "react";
import axios from "axios";
import { Box, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogBox from "./DialogBox.js";

const Table = () => {
  const [entries, setEntries] = useState([]);
  const [currency, setCurrency] = useState("");
  const [mode, setMode] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupValue, setGroupValue] = useState("");
  const [selectOption, setSelectOption] = useState("");
  const [selectOptions, setSelectOptions] = useState("");
  const [selectSR, setSelectSR] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [selectPlanID, setSelectPlanID] = useState("");

  //edit button
  const handleEdit = (index) => {
    const entry = entries[index];
    setCurrency(entry.currency);
    setMode(entry.mode);
    setAmount(entry.amount);
    setRemarks(entry.remarks);
    setEditIndex(index);
    setOpen(true);
  };

  //delete button
  const handleDelete = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  //clear button
  const handleClear = () => {
    setSelectedOptions([]);
    setGroupValue("");
    setSelectOption("");
    setSelectOptions("");
    setSelectSR("");
    setMode("");
    setAmount("");
    setRemarks("");
    setEntries([]);
    setCurrency("");
    setEditIndex(-1);
    setPaymentId("");
    setSelectPlanID("");
  };

  const handleClickClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const submitToGoogleSheets = async () => {
    try {
      // Fetch the last paymentId and planID from the backend
      const response = await axios.get("http://localhost:3001/api/getLastIds");
      const { lastPaymentId, lastPlanID } = response.data;

      // Increment the last paymentId and planID by 1
      const newPaymentId = lastPaymentId + 1;
      const newPlanID = lastPlanID + 1;

      const formData = {
        selectOption,
        selectOptions,
        selectSR,
        paymentId: `PAY-${String(newPaymentId).padStart(5, "0")}`,
      };

      const employeeIds = groupValue
        .split(", ")
        .map((entry) => entry.split(" - ")[0]);
      const employeeNames = groupValue
        .split(", ")
        .map((entry) => entry.split(" - ")[1]);

      const combinedData = entries.map((entry, index) => {
        const { currency, mode, amount, remarks, serialNo } = entry;
        return {
          ...formData,
          planID: `PLN-${String(newPlanID + index).padStart(3, "0")}`,
          employeeId: employeeIds.join(", "),
          employeeName: employeeNames.join(", "),
          currency: currency?.value || currency,
          mode,
          amount,
          remarks,
          serialNo: serialNo || index + 1,
        };
      });

      // Update state with the new values
      setPaymentId(newPaymentId);
      setSelectPlanID(newPlanID + entries.length);

      // Submit the combined data to Google Sheets
      try {
        const submitResponse = await axios.post(
          "http://localhost:3001/api/submit",
          {
            data: combinedData,
          }
        );
        console.log("Data submitted successfully:", submitResponse.data);
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    } catch (error) {
      console.error("Error fetching last IDs:", error);
    }
  };

  return (
    <>
      <DialogBox
        open={open}
        close={handleClickClose}
        currency={currency}
        setCurrency={setCurrency}
        mode={mode}
        setMode={setMode}
        amount={amount}
        setAmount={setAmount}
        remarks={remarks}
        setRemarks={setRemarks}
        entries={entries}
        setEntries={setEntries}
        editIndex={editIndex}
        setEditIndex={setEditIndex}
      />

      <div className="Secondary">
        <h1>Trip Payment Request</h1>
        <div className="TableContainer">
          <Box>
            <table className="EntriesTable">
              <thead>
                <tr>
                  <th>
                    <IconButton>
                      <AddIcon
                        onClick={handleClickOpen}
                        sx={{
                          width: 55,
                        }}
                      />
                    </IconButton>
                  </th>
                  <th>Sr.</th>
                  <th>Currency</th>
                  <th>Payment Mode</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td>
                      <IconButton onClick={() => handleEdit(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </td>
                    <td>{entry.serialNo || index + 1}</td>
                    <td>{entry.currency?.label}</td>
                    <td>{entry.mode}</td>
                    <td>{entry.amount}</td>
                    <td>{entry.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </div>
        <div className="btn">
          <Button type="submit" onClick={submitToGoogleSheets}>
            SUBMIT
          </Button>
          <Button type="clear" onClick={handleClear}>
            CLEAR
          </Button>
        </div>
      </div>
    </>
  );
};

export default Table;
