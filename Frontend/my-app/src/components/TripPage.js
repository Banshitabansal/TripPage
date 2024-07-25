import React, { useState, useEffect } from 'react';
import {
  Autocomplete, Box, TextField, InputLabel, MenuItem,
  FormControl, Select, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, createSvgIcon
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import './TripPage.css';

const GOOGLE_SHEET_ID = '1aDOWPqem6US77ATiVTV1sgx2bq8RWVyYzgnMgzIW3k8';
const GOOGLE_API_KEY = 'AIzaSyB33lFh3E-yrpDAeCEgFYZAxJsXpcu2-_Y';
const RANGE = 'EmployeeData!A2:B'; 

const config = {
  cUrl: "https://api.countrystatecity.in/v1",
  cKey: "NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==",
  currencyUrl: "https://open.er-api.com/v6/latest",
};

const TripPage = () => {
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


  //select type  
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


  //plus icon for dialog box
  const PlusIcon = createSvgIcon(
    <svg stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>,
    'Plus'
  );


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
    setGroupValue('');
    setSelectOption('');
    setSelectOptions('');
    setSelectSR('');
    setMode('');
    setAmount('');
    setRemarks('');
    setEntries([]);
    setCurrency(''); 
    setEditIndex(-1);
    setPaymentId('');
    setSelectPlanID('');
  };


  //submit button
  const submitToGoogleSheets = async () => {
    try {
      // Fetch the last paymentId and planID from the backend
      const response = await axios.get('http://localhost:3002/getLastIds');
      const { lastPaymentId, lastPlanID } = response.data;

      // Increment the last paymentId and planID by 1
      const newPaymentId = lastPaymentId + 1;
      const newPlanID = lastPlanID + 1;

      const formData = {
        selectOption,
        selectOptions,
        selectSR,
        paymentId: `PAY-${String(newPaymentId).padStart(5, '0')}`
      };

      const employeeIds = groupValue.split(', ').map(entry => entry.split(' - ')[0]);
      const employeeNames = groupValue.split(', ').map(entry => entry.split(' - ')[1]);

      const combinedData = entries.map((entry, index) => {
        const { currency, mode, amount, remarks, serialNo } = entry;
        return {
          ...formData,
          planID: `PLN-${String(newPlanID + index).padStart(3, '0')}`,
          employeeId: employeeIds.join(', '), 
          employeeName: employeeNames.join(', '), 
          currency: currency?.value || currency,
          mode,
          amount,
          remarks,
          serialNo: serialNo || index + 1
        };
      });

      // Update state with the new values
      setPaymentId(newPaymentId);
      setSelectPlanID(newPlanID + entries.length);

      // Submit the combined data to Google Sheets
      try {
        const submitResponse = await axios.post('http://localhost:3002/submit', {
          data: combinedData
        });
        console.log('Data submitted successfully:', submitResponse.data);
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    } catch (error) {
      console.error('Error fetching last IDs:', error);
    }
  };

  // useEffect to initialize the fetch of the last IDs on component mount
  useEffect(() => {
    const fetchLastIds = async () => {
      try {
        const response = await axios.get('http://localhost:3002/getLastIds');
        const { lastPaymentId, lastPlanID } = response.data;
        setPaymentId(lastPaymentId);
        setSelectPlanID(lastPlanID);
      } catch (error) {
        console.error('Error fetching last IDs:', error);
      }
    };
  
    fetchLastIds();
  }, []);

  
  return (
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
              '& fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&:hover fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgb(94, 93, 93)',
              },
            }}
          />
        </div>

        <div>
          <FormControl
            sx={{
              m: 1, minWidth: 250, position: 'absolute', left: 330, top: 2,
              '& fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&:hover fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgb(94, 93, 93)',
              },
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
              '& fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&:hover fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgb(94, 93, 93)',
              },
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
                '& fieldset': {
                  borderColor: 'rgb(94, 93, 93)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgb(94, 93, 93)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(94, 93, 93)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgb(94, 93, 93)',
                },
              }}size="small">
              <TextField onChange={handleChangeSR} value={selectSR} label="SR No." required sx={{ width: 180 }} size='small' />
            </Box>
          )}
        </div>

        <div>
          <Box
            sx={{
              '& > :not(style)': { m: 1, width: '17ch' }, position: 'absolute', top: 2, left: 955,
              '& fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&:hover fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgb(94, 93, 93)',
              },
            }}size="small">
            <TextField onChange={handleChangePlanID} value={planID} label="Plan ID" required sx={{ width: 180 }} size='small' />
          </Box>
        </div>

        <div>
          <Box
            sx={{'& > :not(style)': { m: 1, width: '24ch' }, position: 'absolute', top: 2, left: 1125,
              '& fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&:hover fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(94, 93, 93)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgb(94, 93, 93)',
              },
            }} size="small">
            <TextField label="Payment ID" value={paymentId}  onChange={handlePaymentIdChange} required sx={{ width: 220 }} size='small' />
          </Box>
        </div>  
      </div>

      <div className='Secondary'>
        <h1>Trip Payment Request</h1>
        <div className='TableContainer'>

          <Dialog open={open} onClose={handleClose}>
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
                    '& fieldset': {
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                    },
                  }}
                  renderInput={(params) => <TextField {...params} label="Currency" />}
                />
                <FormControl sx={{
                  m: 1, minWidth: 215, position: 'relative', left: 230, bottom: 12,
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
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
                    backgroundColor: 'rgb(94, 93, 93)',
                    '& > :not(style)': { m: 1, width: '25ch' },
                    '& fieldset': {
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                    },
                  }}
                >
                  <TextField
                    id="amount"
                    label="Amount (units)"
                    variant="outlined"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <TextField
                    id="remarks"
                    label="Remarks"
                    variant="outlined"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
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
                    <Stack direction="row" spacing={3}>
                      <PlusIcon />
                    </Stack>
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
                  <td>{entry.serialNo || (index + 1)}</td>
                  <td>{entry.currency?.label}</td>
                  <td>{entry.mode}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='btn'>
          <Button type='submit' onClick={submitToGoogleSheets}>SUBMIT</Button>
          <Button type='clear' onClick={handleClear}>CLEAR</Button>
        </div>
      </div>
    </div>
  );
};

export default TripPage;
