import React, { useState } from "react";
import axios from "axios";

const Xyz = () => {

  const [Data, setData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...Data,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      username: Data.username,
      password: Data.password,
      email: Data.email
    };

    axios.post("http://localhost:5000", userData)
      .then((response) => {
        console.log(response.status, response.data.token);
        
        setData({
          username: "",
          password: "",
          email: ""
        });
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      });
  };

  const [input, setInput] = useState('');
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:7000', {
        params: { q: input }
      });
      
      const filteredData = response.data.map(row => [row[1], row[2]]);
      setdata(filteredData);
    } 
    catch (error) {
      console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
      };
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <label>Username</label><br />
          <input type="text" name="username" id="username" value={Data.username}
            onChange={handleChange} /><br />

          <label>Password</label><br />
          <input type="password" name="password" id="password" value={Data.password}
            onChange={handleChange} /><br />

          <label>Email</label><br />
          <input type="email" name="email" id="email" value={Data.email}
            onChange={handleChange} /><br />

          <button type="submit">Submit</button><br></br><br></br>
        </form>
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Username"
        /><br></br>
        <button onClick={fetchData}>Fetch</button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form>
            {data.map((row, rowIndex) => (
              <div key={rowIndex} style={{ marginBottom: '20px' }}>
                {row.map((cell, cellIndex) => (
                  <div key={cellIndex} style={{ marginBottom: '10px' }}>
                    <label>
                      {['Password', 'Email'][cellIndex]}<br></br>
                      <input type="text" value={cell} readOnly />
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </form>
        )}
      </div>
    </>
  );
};
  

export default Xyz;
