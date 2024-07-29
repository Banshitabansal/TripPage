import React, { useState, useEffect } from 'react';
import {
  Autocomplete, Box, TextField, InputLabel, MenuItem,
  FormControl, Select, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, createSvgIcon
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import './TripPage2.css';
import { darkTheme, lightTheme} from '../theme.js';

const GOOGLE_SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';
const GOOGLE_API_KEY = 'AIzaSyB33lFh3E-yrpDAeCEgFYZAxJsXpcu2-_Y';
const RANGE = 'EmployeeData!A2:B'; 

const config = {
  cUrl: "https://api.countrystatecity.in/v1",
  cKey: "NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==",
  currencyUrl: "https://open.er-api.com/v6/latest",
};

const TripPage2 = () => {
  const theme = useTheme();
  const [options, setOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupValue, setGroupValue] = useState('');
  const [selectOption, setSelectOption] = useState('');
  const [selectOptions, setSelectOptions] = useState('');
  const [selectSR, setSelectSR] = useState('');
  const [planID, setSelectPlanID] = useState('');
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mode, setMode] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [currency, setCurrency] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [deletedEntries, setDeletedEntries] = useState([]);
  

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
        console.error('Error fetching data from Google Sheets:', error);
      }
    };
    fetchData();
  }, []);


  //select type (form field) 
  useEffect(() => {
    if (selectedOptions.length > 0) {
      const concatenatedValues = selectedOptions.map(option => option.label).join(', ');
      setGroupValue(concatenatedValues);
      setSelectOption(selectedOptions.length === 1 ? 'Individual' : 'Group');
    } else {
      setGroupValue('');
      setSelectOption('');
    }
  }, [selectedOptions]);


  //fetch currency from currency api
  const fetchCurrencyOptions = async () => {
    try {
      const url = `${config.currencyUrl}`;
      console.log('Request URL:', url);
      
      const response = await axios.get(url);
      
      const data = response.data;
      console.log('Data received:', data);
  
      const formattedCurrencyOptions = Object.keys(data.rates).map((code) => ({
        value: code,
        label: `${code}`,
      }));
  
      setCurrencyOptions(formattedCurrencyOptions);
    } catch (error) {
      console.error('Error fetching currency data:', error);
  
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };


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
    fetchCurrencyOptions();
  };


  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  const handleChangeMode = (event) => {
    setMode(event.target.value);
  };


  const handleCurrencyChange = (event, newValue) => {
    setCurrency(newValue);
  };
  

  const handlePaymentIdChange = async (event) => {
    setPaymentId(event.target.value);
  };


  //close button
  const handleClose = () => {
    setOpen(false);
    setMode('');
    setAmount('');
    setRemarks('');
    setEditIndex(-1);
    setCurrency('');
  };


  //save button
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const newEntry = { currency, mode, amount, remarks, serialNo};
  
    if (editIndex >= 0) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = newEntry;
      setEntries(updatedEntries);
    } else {
      setEntries([...entries, newEntry]);
    }
    handleClose();
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


  //delete button
  const handleDelete = (index) => {
    const entryToDelete = entries[index];
    setDeletedEntries([...deletedEntries, entryToDelete.serialNo]);
    setEntries(entries.filter((_, i) => i !== index));
    console.log("delete",deletedEntries)
  };
 


  //clear button
  const handleClear = () => {
    setSelectedOptions([]);
    setGroupValue('');
    setSelectOption('');
    setSelectOptions('');
    setSelectSR('');
    setSelectPlanID('');
    setMode('');
    setAmount('');
    setRemarks('');
    setEntries([]);
    setCurrency(''); 
    setEditIndex(-1);
    setPaymentId('');
  };


  //fetch data from googlesheet
  const fetchPaymentData = async () => {
    try {
      console.log(`Fetching payment data for paymentId: ${paymentId}`);
      const response = await axios.get(`http://localhost:3001/api/fetch?paymentId=${paymentId}`);
      console.log('Response received:', response.data);
  
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
          const employeeIds = firstData[3]?.split(',') || [];
          const employeeNames = firstData[4]?.split(',') || [];
          
          const employeeData = employeeIds.map((id, index) => ({
            id: id.trim(),
            name: employeeNames[index]?.trim(),
          }));

          const selectedOptions = employeeData.map(emp => ({
            value: emp.id,
            label: `${emp.id} - ${emp.name}`,
          }));

          const formattedData = employeeIds.map((id, index) => `${id}-${employeeNames[index]}`).join(' , ');
      
          setSelectedOptions(selectedOptions);
          setSelectOption(firstData[5]);
          setSelectOptions(firstData[6]);
          setSelectSR(firstData[7]);
          setSelectPlanID(firstData[1]);
        }
      } else {
        console.error('Payment ID not found or no data returned');
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  };
  

  //update data in googlesheet
  const handleUpdateData = async (entries) => {
    try {
      console.log('Received parameters:', { entries }); 

      const employeeIds = groupValue.split(', ').map(entry => entry.split(' - ')[0]);
      const employeeNames = groupValue.split(', ').map(entry => entry.split(' - ')[1]);

      for (const entry of entries) {

        const url = `http://localhost:3001/api/updateGoogleSheet?paymentId=${paymentId}&serialNo=${serialNo}`;
        const entryData = {
          paymentId: paymentId,
          planID: planID,
          serialNo: entry.serialNo,
          employeeIds: employeeIds.join(', '), 
          employeeNames: employeeNames.join(', '),
          selectOption: selectOption,
          selectOptions: selectOptions,
          selectSR: selectSR,
          currency: entry.currency,
          mode: entry.mode,
          amount: entry.amount,
          remarks: entry.remarks,
          deletedEntries,
        };
        
        console.log('Data sent for update:', entryData);
        const response = await axios.put(url, entryData);
        console.log('Data update request sent:', response);
        console.log('Data updated successfully:', response.data);
      }
      const Data = {
        paymentId,
        deletedEntries,
      }

      const response = await axios.post('http://localhost:3001/api/deleteGoogleSheet', Data);
      setDeletedEntries([]);

    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
    <div className={`ModalContainer ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <nav className='Navbar'>
        <p>NESSCO</p>
        <a href='#'>Trip Plan</a>
        <a href='#'>Trip Search</a>
        <a href='#'>Sign In</a>
        <Button onClick={toggleTheme} sx={{ position: 'absolute', right: 0, top: 5 }}>
          <LightModeIcon />
        </Button>
      </nav>

      <div className='FormContainer'>
        <div>
          <Autocomplete
            multiple
            size='small'
            value={selectedOptions}
            onChange={handleChange}
            options={options}
            renderInput={(params) => (
              <TextField {...params} label="Employee ID" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((options, index) => (
                <span key={index} {...getTagProps({ index })} className="tag">
                  {options.label}{index < value.length - 1 ? ', ' : ''}
                </span>
              ))
            }
            sx={{
              width: 300,
              position: 'absolute',
              left: 20,
              top: 2,
              padding: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            style={{ color: theme.palette.text.primary}}
          />
        </div>

        <div>
          <FormControl
            sx={{
              m: 1, minWidth: 250, position: 'absolute', left: 330, top: 2,
            }} size="small">
            <InputLabel>Select Type</InputLabel>
            <Select value={selectOption} readOnly label="Select Type">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Individual">Individual</MenuItem>
              <MenuItem value="Group">Group</MenuItem>
            </Select>
            </FormControl>
        </div>

        <div>
          <FormControl
            sx={{
              m: 1, minWidth: 324, position: 'absolute', top: 2, left: 605,
            }} size="small">
            <InputLabel>Select Dept.</InputLabel>
            <Select value={selectOptions} onChange={handleSelectChange} label="Select Dept.">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Service">Service</MenuItem>
              <MenuItem value="Operations">Operations</MenuItem>
            </Select>
          </FormControl>

          {selectOptions === 'Service' && (
            <Box
              sx={{
                '& > :not(style)': { m: 1, width: '15ch' }, position: 'absolute', top: 2, left: 800,
            
              }}size="small">
              <TextField onChange={handleChangeSR} value={selectSR} label="SR No." required sx={{ width: 180 }} size='small' />
            </Box>
          )}
        </div>

        <div>
          <Box
            sx={{
              '& > :not(style)': { m: 1, width: '17ch' }, position: 'absolute', top: 2, left: 955,
            }}size="small">
            <TextField onChange={handleChangePlanID} value={planID} label="Plan ID" required sx={{ width: 180 }} size='small' />
          </Box>
        </div>

        <div>
          <Box
            sx={{'& > :not(style)': { m: 1, width: '24ch' }, position: 'absolute', top: 2, left: 1125,             
            }} size="small">
            <TextField label="Payment ID" value={paymentId}  onChange={handlePaymentIdChange} required sx={{ width: 220 }} size='small' />
          </Box>
        </div>  
      </div>

      <div className='Secondary'>
        <h1>Trip Payment Request</h1>
        <div className='TableContainer'>

          <Dialog open={open} onClose={handleClose} >
            <form onSubmit={handleFormSubmit} className='Dialog'>
              <DialogTitle className='Title'>ADD PAYMENT REQUEST ENTRY</DialogTitle>
              <DialogContent>
                <Autocomplete
                  disablePortal
                  options={currencyOptions}
                  value={currency}
                  onChange={handleCurrencyChange}
                  required
                  sx={{
                    m: 1, width: 215, position: 'relative', top: 60,
                    '& .css-p1olib-MuiAutocomplete-endAdornment' :{
                      top : -43,
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Currency" />}
                />
                <FormControl sx={{
                  m: 1, minWidth: 215, position: 'relative', left: 230, bottom: 12,
                }}>
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    value={mode}
                    label="Payment Mode"
                    onChange={handleChangeMode}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Bank">Bank</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                  </Select>
                </FormControl>
                
                <Box
                  sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                  }}
                >
                  <TextField
                    id="remarks"
                    label="Remarks"
                    variant="outlined"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                  />
                  <TextField
                    id="amount"
                    label="Amount (units)"
                    variant="outlined"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button type="submit">Save</Button>
                <Button onClick={handleClose}>Close</Button>
              </DialogActions>
            
            </form>
          
          </Dialog>

          <table className="EntriesTable">
            <thead>
              <tr>
                <th>
                  <Button onClick={handleClickOpen}>
                    <AddIcon />
                  </Button>
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
                    <Button onClick={() => handleEdit(index)}><EditIcon fontSize='small' />|</Button>
                    <Button onClick={() => handleDelete(index)}><DeleteIcon fontSize='small'/></Button>
                  </td>
                  <td>{entry.serialNo}</td>
                  <td>{entry.currency?.label}</td>
                  <td>{entry.mode}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='btn2'>
          <Button onClick={() => handleUpdateData(entries)}>Update</Button>
          <Button type='clear' onClick={handleClear}>CLEAR</Button>
          <Button type='fetch' onClick={fetchPaymentData}>Fetch</Button>
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
};

export default TripPage2;