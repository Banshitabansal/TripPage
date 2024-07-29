import React from "react";
import { Box, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogBox from "./DialogBox.js";

const Table = () => {
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
