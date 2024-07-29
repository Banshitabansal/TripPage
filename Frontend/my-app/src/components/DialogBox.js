import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

// currency
const config = {
  cUrl: "https://api.countrystatecity.in/v1",
  cKey: "NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==",
  currencyUrl: "https://open.er-api.com/v6/latest",
};

const DialogBox = ({
  open,
  close,
  currency,
  setCurrency,
  mode,
  setMode,
  amount,
  setAmount,
  remarks,
  setRemarks,
  entries,
  setEntries,
  editIndex,
  setEditIndex,
}) => {
  const [currencyOptions, setCurrencyOptions] = useState([]);

  // handle currency
  const handleCurrencyChange = (event, newValue) => {
    setCurrency(newValue);
  };

  // handle payment mode
  const handleChangeMode = (event) => {
    setMode(event.target.value);
  };

  // fetch currency from currency API
  useEffect(() => {
    const fetchCurrencyOptions = async () => {
      try {
        const url = `${config.currencyUrl}`;
        console.log("Request URL:", url);

        const response = await axios.get(url);

        const data = response.data;
        console.log("Data received:", data);

        const formattedCurrencyOptions = Object.keys(data.rates).map(
          (code) => ({
            value: code,
            label: `${code}`,
          })
        );

        setCurrencyOptions(formattedCurrencyOptions);
      } catch (error) {
        console.error("Error fetching currency data:", error);
      }
    };

    fetchCurrencyOptions();
  }, []);

  // close button
  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    close();
    setMode("");
    setAmount("");
    setRemarks("");
    setEditIndex(-1);
    setCurrency("");
  };

  // save button
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const newEntry = { currency, mode, amount, remarks };

    if (editIndex >= 0) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = newEntry;
      setEntries(updatedEntries);
    } else {
      setEntries([...entries, newEntry]);
    }
    handleClose();
  };

  return (
    <>
      <Box>
        <Dialog open={open} onClose={handleClose}>
          <form onSubmit={handleFormSubmit} className="Dialog">
            <DialogTitle className="Title">
              ADD PAYMENT REQUEST ENTRY
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Autocomplete
                    disablePortal
                    options={currencyOptions}
                    value={currency}
                    onChange={handleCurrencyChange}
                    required
                    renderInput={(params) => (
                      <TextField {...params} label="Currency" />
                    )}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      value={mode}
                      label="Payment Mode"
                      onChange={handleChangeMode}>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="Bank">Bank</MenuItem>
                      <MenuItem value="Cash">Cash</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="amount"
                    label="Amount (units)"
                    variant="outlined"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="remarks"
                    label="Remarks"
                    variant="outlined"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button type="submit">Save</Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
};

export default DialogBox;
