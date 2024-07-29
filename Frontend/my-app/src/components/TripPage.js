import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import "./TripPage.css";
import { darkTheme, lightTheme } from "../theme.js";
import Navbar from "./Navbar.js";
import Table from "./Table.js";

const GOOGLE_SHEET_ID = "1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8";
const GOOGLE_API_KEY = "AIzaSyB33lFh3E-yrpDAeCEgFYZAxJsXpcu2-_Y";
const RANGE = "EmployeeData!A2:B";



const TripPage = () => {
  const theme = useTheme();
  const [options, setOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupValue, setGroupValue] = useState("");
  const [selectOption, setSelectOption] = useState("");
  const [selectOptions, setSelectOptions] = useState("");
  const [selectSR, setSelectSR] = useState("");
  const [planID, setSelectPlanID] = useState("");
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mode, setMode] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [currency, setCurrency] = useState("");
  const [paymentId, setPaymentId] = useState("");

  //fetch employee id from googlesheet
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`
        );
        const data = response.data.values;
        const formattedOptions = data.map((row) => ({
          value: row[0],
          label: `${row[0]} - ${row[1]}`,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
      }
    };
    fetchData();
  }, []);

  //select type
  useEffect(() => {
    if (selectedOptions.length > 0) {
      const concatenatedValues = selectedOptions
        .map((option) => option.label)
        .join(", ");
      setGroupValue(concatenatedValues);
      setSelectOption(selectedOptions.length === 1 ? "Individual" : "Group");
    } else {
      setGroupValue("");
      setSelectOption("");
    }
  }, [selectedOptions]);

  const handleChange = (event, newValue) => {
    setSelectedOptions(newValue);
  };

  const handleChangeSR = (event) => {
    setSelectSR(event.target.value);
  };

  const handleChangePlanID = (event) => {
    setSelectPlanID(event.target.value);
  };

  const handleSelectChange = (event) => {
    setSelectOptions(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickClose = () => {
    setOpen(false);
  };

  const handlePaymentIdChange = async (event) => {
    setPaymentId(event.target.value);
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

  //submit button
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

  // useEffect to initialize the fetch of the last IDs on component mount
  useEffect(() => {
    const fetchLastIds = async () => {
      try {
        const response = await axios.get("http://localhost:3002/getLastIds");
        const { lastPaymentId, lastPlanID } = response.data;
        setPaymentId(lastPaymentId);
        setSelectPlanID(lastPlanID);
      } catch (error) {
        console.error("Error fetching last IDs:", error);
      }
    };

    fetchLastIds();
  }, []);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div
        className={`ModalContainer ${isDarkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        

        <Table />

        <div className="FormContainer">
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Autocomplete
                multiple
                size="small"
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                renderInput={(params) => (
                  <TextField {...params} label="Employee ID" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((options, index) => (
                    <span
                      key={index}
                      {...getTagProps({ index })}
                      className="tag">
                      {options.label}
                      {index < value.length - 1 ? ", " : ""}
                    </span>
                  ))
                }
                fullWidth
                style={{ color: theme.palette.text.primary }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Type</InputLabel>
                <Select value={selectOption} readOnly label="Select Type">
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Individual">Individual</MenuItem>
                  <MenuItem value="Group">Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Dept.</InputLabel>
                <Select
                  value={selectOptions}
                  onChange={handleSelectChange}
                  label="Select Dept.">
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {selectOptions === "Service" && (
              <Grid item xs={6} sm={4} md={2}>
                <Box fullWidth size="small">
                  <TextField
                    onChange={handleChangeSR}
                    value={selectSR}
                    label="SR No."
                    required
                    size="small"
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={6} sm={4} md={2}>
              <Box fullWidth size="small">
                <TextField
                  onChange={handleChangePlanID}
                  value={planID}
                  label="Plan ID"
                  required
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box fullWidth size="small">
                <TextField
                  label="Payment ID"
                  value={paymentId}
                  onChange={handlePaymentIdChange}
                  required
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TripPage;
