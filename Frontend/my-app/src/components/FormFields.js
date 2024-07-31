import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import Table from "./Table.js";

const GOOGLE_SHEET_ID = "1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8";
const GOOGLE_API_KEY = "AIzaSyB33lFh3E-yrpDAeCEgFYZAxJsXpcu2-_Y";
const RANGE = "EmployeeData!A2:B";

const FormFields = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupValue, setGroupValue] = useState("");
  const [options, setOptions] = useState([]);
  const [selectOption, setSelectOption] = useState("");
  const [selectOptions, setSelectOptions] = useState("");
  const [selectSR, setSelectSR] = useState("");
  const [planID, setPlanID] = useState("");
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

  //employee id handler
  const handleChange = (event, newValue) => {
    setSelectedOptions(newValue);
  };

  //select type useEffect
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

  //select dept handler
  const handleSelectChange = (event) => {
    setSelectOptions(event.target.value);
  };

  //sr no handler
  const handleChangeSR = (event) => {
    setSelectSR(event.target.value);
  };

  //plan id handler
  const handleChangePlanId = (event) => {
    setPlanID(event.target.value);
  };

  //payment id handler
  const handlePaymentIdChange = async (event) => {
    setPaymentId(event.target.value);
  };

  //fetch payment id and plan id from googlesheet and mongodb
  useEffect(() => {
    const fetchLastIds = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/getLastIds"
        );
        const { lastPaymentId, lastPlanID } = response.data;
        setPaymentId(lastPaymentId);
        setPlanID(lastPlanID);
      } catch (error) {
        console.error("Error fetching last IDs:", error);
      }
    };

    fetchLastIds();
  }, []);

  //clear button
  const handleClear = () => {
    setSelectedOptions([]);
    setGroupValue("");
    setSelectOption("");
    setSelectOptions("");
    setSelectSR("");
    setPaymentId("");
    setPlanID("");
  };

  return (
    <>
      <Box className="FormContainer">
        <Box sx={{mt: 6, p: 3}}>
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
                  value.map((option, index) => (
                    <span
                      key={index}
                      {...getTagProps({ index })}
                      className="tag">
                      {option.label}
                      {index < value.length - 1 ? ", " : ""}
                    </span>
                  ))
                }
                fullWidth
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
                <Box fullWidth>
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
              <Box fullWidth>
                <TextField
                  onChange={handleChangePlanId}
                  value={planID}
                  label="Plan ID"
                  required
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box fullWidth>
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
        </Box>
      </Box>
      <Table
        clear={handleClear}
        selectOption={selectOption}
        selectOptions={selectOptions}
        selectSR={selectSR}
        paymentId={paymentId}
        groupValue={groupValue}
        planID={planID}
        setSelectedOptions={setSelectedOptions}
        setSelectOptions={setSelectOptions}
        setSelectOption={setSelectOption}
        setSelectSR={setSelectSR}
        setPaymentId={setPaymentId}
        setPlanID={setPlanID}
      />
    </>
  );
};

export default FormFields;
