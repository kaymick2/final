import React, { useState } from 'react';
import axios from 'axios';
import base_url from '../base_url';
import logo from './logo.png';  // Ensure the logo is imported

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let _FormData = new FormData();
      _FormData.append('username', formData.username);
      _FormData.append('password', formData.password);
      const response = await axios.post(`${base_url}/admin/token`, _FormData);
      localStorage.setItem('admin_token', response.data.access_token);
      window.location = "/admin/";
    } catch (error) {
      if(error && error.response.data.detail){
        alert(error.response.data.detail);
      } else {
        alert("Something Went Wrong");
      }
    }
  };

  return (
    <div className="container" style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <h1>Admin</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label" style={styles.label}>Username</label>
          <input type="text" className="form-control" id="username" name="username" value={formData.username} onChange={handleChange} required style={styles.input} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label" style={styles.label}>Password</label>
          <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} />
        </div>
        <button type="submit" className="btn btn-primary" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '300vh', // This might be a typo; usually, you would want 100vh or 100vw
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    backgroundColor: '#1B1A55', // Dark background color
    color: '#ffffff', // Light text color for readability
    textAlign: 'center'
  },
  logo: {
    width: '100px', // Adjust size as needed
    marginBottom: '20px'
  },
  form: {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(255, 255, 255, 0.1)', // Lighter shadow for dark mode
    backgroundColor: '#1a1a1a', // Darker form background
    width: '90%',
    color: 'white', // Ensuring text inside the form is light colored
    maxWidth: '400px'
  },
  label: {
    float: 'left',
    marginBottom: '10px',
    color: '#eae2b7' // Light mustard color for labels for better visibility
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #555', // Darker border for inputs
    backgroundColor: '#333', // Dark input fields
    color: 'white' // Text color in inputs
  },
  button: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0056b3', // Slightly darker blue for the button
    color: 'white',
    cursor: 'pointer'
  }
};

export default AdminLogin;
