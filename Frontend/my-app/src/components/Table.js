import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Box, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogBox from "./DialogBox.js";
import Snackbar from "@mui/material/Snackbar";
import { useTheme } from "@mui/material/styles";

const Table = ({
  clear,
  groupValue,
  selectOptions,
  selectOption,
  selectSR,
  setSelectOption,
  setSelectOptions,
  setSelectedOptions,
  setSelectSR,
  setPaymentId,
  paymentId,
  planID,
  setPlanID,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [currency, setCurrency] = useState("");
  const [mode, setMode] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [deletedEntries, setDeletedEntries] = useState([]);
  const [serialNo, setSerialNo] = useState("");
  const [dltOpen, setDltOpen] = React.useState(false);
  const [edtOpen, setEdtOpen] = React.useState(false);
  const [submitOpen, setSubmitOpen] = React.useState(false);
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [usedCombinations, setUsedCombinations] = useState([]);
  const [newPaymentId, setNewPaymentId] = useState(null); 

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
    setSerialNo(entry.serialNo);
    setOpen(true);
  };

  //edit msg close
  const handleEdtClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setEdtOpen(false);
  };

  //delete button
  const handleDelete = (index) => {
    const entryToDelete = entries[index];
    setDeletedEntries([...deletedEntries, entryToDelete.serialNo]);
    setEntries(entries.filter((_, i) => i !== index));
    console.log("delete", deletedEntries);
    setDltOpen(true);
  };

  //delete msg close
  const handleDltClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setDltOpen(false);
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
    setUsedCombinations([]);
  };

  //submit button
  const submitToGoogleSheets = async () => {
    try {
      // Fetch the last paymentId and planId from the backend
      const response = await axios.get(
        `${process.env.REACT_APP_FRONTEND}/api/getLastIds`
      );
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
      setNewPaymentId(newPaymentId); // Update state with newPaymentId

      // Submit the combined data to Google Sheets
      try {
        const submitResponse = await axios.post(
          `${process.env.REACT_APP_FRONTEND}/api/submit`,
          {
            data: combinedData,
          }
        );
        console.log("Data submitted successfully:", submitResponse.data);
        setMode("");
        setAmount("");
        setRemarks("");
        setEntries([]);
        setCurrency("");
        setEditIndex(-1);
        clear();
        setSubmitOpen(true);
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    } catch (error) {
      console.error("Error fetching last IDs:", error);
    }
  };

  //submit msg close
  const handleSubmitClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSubmitOpen(false);
  };

  //fetch button
  const fetchPaymentData = async () => {
    try {
      console.log(`Fetching payment data for paymentId: ${paymentId}`);
      const response = await axios.get(
        `${process.env.REACT_APP_FRONTEND}/api/fetch?paymentId=${paymentId}`
      );
      console.log("Response received:", response.data);

      if (response.data.success) {
        const paymentData = response.data.data;

        const formattedEntries = paymentData.map((data, index) => ({
          currency: { label: data[8] },
          mode: data[9],
          amount: data[10],
          remarks: data[11],
          serialNo: data[2],
        }));
        setEntries(formattedEntries);

        if (paymentData.length > 0) {
          const [firstData] = paymentData;
          const employeeIds = firstData[3]?.split(",") || [];
          const employeeNames = firstData[4]?.split(",") || [];

          const employeeData = employeeIds.map((id, index) => ({
            id: id.trim(),
            name: employeeNames[index]?.trim(),
          }));

          const selectedOptions = employeeData.map((emp) => ({
            value: emp.id,
            label: `${emp.id} - ${emp.name}`,
          }));

          const formattedData = employeeIds
            .map((id, index) => `${id}-${employeeNames[index]}`)
            .join(" , ");

          setSelectedOptions(selectedOptions);
          setSelectOption(firstData[5]);
          setSelectOptions(firstData[6]);
          setSelectSR(firstData[7]);
          setPlanID(firstData[1]);
        }
      } else {
        console.error("Payment ID not found or no data returned");
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  };

  //update button
  const handleUpdateData = async (entries) => {
    try {
      console.log("Received parameters:", { entries });

      const employeeIds = groupValue
        .split(", ")
        .map((entry) => entry.split(" - ")[0]);
      const employeeNames = groupValue
        .split(", ")
        .map((entry) => entry.split(" - ")[1]);

      for (const entry of entries) {
        const url = `${process.env.REACT_APP_FRONTEND}/api/updateGoogleSheet?paymentId=${paymentId}&serialNo=${serialNo}`;
        const entryData = {
          paymentId: paymentId,
          planID: planID,
          serialNo: entry.serialNo,
          employeeIds: employeeIds.join(", "),
          employeeNames: employeeNames.join(", "),
          selectOption: selectOption,
          selectOptions: selectOptions,
          selectSR: selectSR,
          currency: entry.currency,
          mode: entry.mode,
          amount: entry.amount,
          remarks: entry.remarks,
          deletedEntries,
        };

        console.log("Data sent for update:", entryData);
        const response = await axios.put(url, entryData);
        console.log("Data update request sent:", response);
        console.log("Data updated successfully:", response.data);
        setMode("");
        setAmount("");
        setRemarks("");
        setEntries([]);
        setCurrency("");
        setEditIndex(-1);
        clear();
        setUpdateOpen(true);
      }
      const Data = {
        paymentId,
        deletedEntries,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_FRONTEND}/api/deleteGoogleSheet`,
        Data
      );
      setDeletedEntries([]);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  //update msg close
  const handleUpdateClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setUpdateOpen(false);
  };

  return (
    <>
      <DialogBox
        open={open}
        close={handleClickClose}
        serialNo={serialNo}
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
        setEdtOpen={setEdtOpen}
        setUsedCombinations={setUsedCombinations}
        usedCombinations={usedCombinations}
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
                sm: "70%", // Set width to 70% for small screens
                md: "50%", // Set width to 50% for medium screens
                lg: "44%", // Set width to 50% for large screens
                xl: "40%", // Set width to 50% for extra-large screens
              },
              overflow: "auto",
              mt: 10,
              height: 280,
              coverflowY: "scroll",
              "&::-webkit-scrollbar": {
                width: "12px",
                height: "12px",
              },
            }}>
            <table cellSpacing={0}>
              <thead>
                <tr>
                  <th>
                    <IconButton onClick={handleClickOpen}>
                      <AddIcon
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
          <div className="btn">
            {location.pathname === "/TripPage" ? (
              <div>
                <Button type="submit" onClick={submitToGoogleSheets}>
                  SUBMIT
                </Button>
                <Button type="clear" onClick={handleClear}>
                  CLEAR
                </Button>
              </div>
            ) : location.pathname === "/TripPage2" ? (
              <div>
                <Button onClick={() => handleUpdateData(entries)}>
                  Update
                </Button>
                <Button type="clear" onClick={handleClear}>
                  CLEAR
                </Button>
                <Button type="fetch" onClick={fetchPaymentData}>
                  Fetch
                </Button>
              </div>
            ) : null}
          </div>
          <Snackbar // delete button message
            open={dltOpen}
            autoHideDuration={2000}
            onClose={handleDltClose}
            message="Data Deleted Successfully"
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "white",
                color: "red",
                paddingLeft: "20px",
                maxWidth: "250px",
              },
            }}
          />
          <Snackbar // edit button message
            open={edtOpen}
            autoHideDuration={2000}
            onClose={handleEdtClose}
            message="Data Edited Successfully"
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "white",
                color: "black",
                paddingLeft: "20px",
                maxWidth: "250px",
              },
            }}
          />
          <Snackbar // submit button message
            open={submitOpen}
            autoHideDuration={2000}
            onClose={handleSubmitClose}
            message={`Data Submitted Successfully PaymentId: PAY-${String(newPaymentId).padStart(5, "0")}`} 
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "white",
                color: "green",
                paddingLeft: "20px",
                maxWidth: "250px",
              },
            }}
          />

          <Snackbar // update button message
            open={updateOpen}
            autoHideDuration={2000}
            onClose={handleUpdateClose}
            message="Data Updated Successfully"
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "white",
                color: "black",
                paddingLeft: "20px",
                maxWidth: "250px",
              },
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default Table;
