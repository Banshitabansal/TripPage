import React, { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
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

const FormFields = ({ page }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupValue, setGroupValue] = useState("");
  const [options, setOptions] = useState([]);
  const [selectOption, setSelectOption] = useState("");
  const [selectOptions, setSelectOptions] = useState("");
  const [selectSR, setSelectSR] = useState("");
  const [planID, setPlanID] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  // Fetch employee id from Google Sheets
  useEffect(() => {
    const employeeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_FRONTEND}/api/employeeData`
        );
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      }
    };
    employeeData();
  }, []);

  // Employee id handler
  const handleChange = (event, newValue) => {
    setSelectedOptions(newValue);
  };

  // Select type useEffect
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

  // Select dept handler
  const handleSelectChange = (event) => {
    setSelectOptions(event.target.value);
  };

  // SR No handler
  const handleChangeSR = (event) => {
    setSelectSR(event.target.value);
  };

  // Plan ID handler
  const handleChangePlanId = (event) => {
    setPlanID(event.target.value);
  };

  // Payment ID handler
  const handlePaymentIdChange = async (event) => {
    setPaymentId(event.target.value);
  };

  // Fetch payment ID and plan ID from Google Sheets and MongoDB
  useEffect(() => {
    if (page === "TripPage") {
      const fetchLastIds = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_FRONTEND}/api/getLastIds`
          );
          const { lastPaymentId, lastPlanID } = response.data;
          setPaymentId(lastPaymentId);
          setPlanID(lastPlanID);
        } catch (error) {
          console.error("Error fetching last IDs:", error);
        }
      };

      fetchLastIds();
    }
  }, [page]);

  // Clear button
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
        <Box
          sx={{
            mt: {
              xs: 0,
              md: 6,
            },
            pt: 3, pb: 3, pl: 5, pr: 0,
          }}>
          <Grid
            container
            spacing={2}
            direction={page === "TripPage2" ? "row" : "row"}
            sx={{
              // Adjust grid layout based on page
              display: "flex",
              flexWrap: "wrap",
              // Make sure all items take full width on mobile view
              "& .MuiGrid-item": {
                flexBasis:
                  page === "TripPage2"
                    ? "calc(100% / 6 - 16px)"
                    : "calc(100% / 4 - 16px)",
                maxWidth:
                  page === "TripPage2"
                    ? "calc(100% / 6 - 16px)"
                    : "calc(100% / 4 - 16px)",
              },
              // Ensure items stack properly on mobile
              "@media (max-width:600px)": {
                "& .MuiGrid-item": {
                  flexBasis: "calc(100% / 2 - 16px)",
                  maxWidth: "calc(100% / 2 - 16px)",
                },
              },
            }}>
            <Grid item xs={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                disableCloseOnSelect
                getOptionLabel={(option) => option.title}
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                      />
                      {option.label}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Employee ID" required />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Box
                      key={index}
                      component="span"
                      {...getTagProps({ index })}>
                      {option.label}
                      {index < value.length - 1 ? ", " : ""}
                    </Box>
                  ))
                }
                fullWidth
                sx={{
                  "& .MuiAutocomplete-inputRoot": {
                    display: "flex",
                    flexWrap: "nowrap",
                    overflowX: "hidden",
                  },
                  "& .MuiAutocomplete-tag": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
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

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Select Dept.</InputLabel>
                <Select
                  value={selectOptions}
                  onChange={handleSelectChange}
                  label="Select Dept.">
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {selectOptions === "Service" && (
              <Grid item xs={6} md={3}>
                <Box>
                  <TextField
                    onChange={handleChangeSR}
                    value={selectSR}
                    label="SR No."
                    required
                    fullWidth
                    size="small"
                  />
                </Box>
              </Grid>
            )}

            {page === "TripPage2" && (
              <>
                <Grid item xs={6} md={3}>
                  <Box>
                    <TextField
                      onChange={handleChangePlanId}
                      value={planID}
                      label="Plan ID"
                      required
                      fullWidth
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Box>
                    <TextField
                      label="Payment ID"
                      value={paymentId}
                      onChange={handlePaymentIdChange}
                      required
                      fullWidth
                      size="small"
                    />
                  </Box>
                </Grid>
              </>
            )}
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
