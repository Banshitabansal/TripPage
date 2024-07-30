import React, { useState } from "react";
import axios from "axios";
import { Box, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogBox from "./DialogBox.js";

const Table = ({
  clear,
  groupValue,
  selectOptions,
  selectOption,
  selectSR,
}) => {
  const [entries, setEntries] = useState([]);
  const [currency, setCurrency] = useState("");
  const [mode, setMode] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [planID, setPlanID] = useState("");

  //dialog close
  const handleClickClose = () => {
    setOpen(false);
  };

  //dialog open
  const handleClickOpen = () => {
    setOpen(true);
  };

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
    setMode("");
    setAmount("");
    setRemarks("");
    setEntries([]);
    setCurrency("");
    setEditIndex(-1);
    clear();
  };

  //submit button
  const submitToGoogleSheets = async () => {
    try {
      // Fetch the last paymentId and planId from the backend
      const response = await axios.get("http://localhost:3001/api/getLastIds");
      const { lastPaymentId, lastPlanID } = response.data;

      // Increment the last paymentId and planId by 1
      const newPaymentId = lastPaymentId + 1;
      const newPlanId = lastPlanID + 1;

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
          planID: `PLN-${String(newPlanId + index).padStart(3, "0")}`,
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
      setPlanID(newPlanId + entries.length);

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

      <Box className="TableBackground">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <h1>Trip Payment Request</h1>
          <Box
            sx={{
              width: {
                xs: "90%", // Set width to 90% for extra-small screens
                sm: "80%", // Set width to 80% for small screens
                md: "70%", // Set width to 70% for medium screens
                lg: "45%", // Set width to 45% for large screens
                xl: "50%", // Set width to 50% for extra-large screens
              },
              overflow: 'auto',
              mt: 10,
              height: 300,
              coverflowY: 'scroll',
              '&::-webkit-scrollbar': {
                width: '12px',
                height: '12px',
              },
            }}>
            <table cellSpacing={0}>
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
          <div className="btn" >
            <Button type="submit" onClick={submitToGoogleSheets}>
              SUBMIT
            </Button>
            <Button type="clear" onClick={handleClear}>
              CLEAR
            </Button>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default Table;
