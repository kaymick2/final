import React, { useState } from 'react';
import axios from 'axios';
import base_url from '../base_url';
import { Link } from 'react-router-dom';
import logo from './logo.png'

const Login = () => {
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
      const response = await axios.post(`${base_url}/token`, _FormData);
      localStorage.setItem('token', response.data.access_token);
      window.location = "/";
    } catch (error) {
      if (error && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Something went wrong. Please try again");
      }
    }
  };

  return (
    <div className="container" style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
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
        <br />
        <Link to={'/register'} style={styles.link}>Don't have an account? Register here.</Link>
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
    width:'100vw',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    backgroundColor: '#1B1A55',  // Dark background color
    color: '#ffffff',  // Light text color for readability
    textAlign: 'center'
  },
  logo: {
    width: '100px', // Adjust size as needed
    marginBottom: '20px'
  },
  form: {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(255, 255, 255, 0.1)',  // Lighter shadow for dark mode
    backgroundColor: '#1a1a1a',  // Darker form background
    width: '90%',
    color: 'white',  // Ensuring text inside the form is light colored
    maxWidth: '400px'
  },
  label: {
    float: 'left',
    marginBottom: '10px',
    color: '#eae2b7'  // Light mustard color for labels for better visibility
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #555',  // Darker border for inputs
    backgroundColor: '#333',  // Dark input fields
    color: 'white'  // Text color in inputs
  },
  button: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0056b3',  // Slightly darker blue for the button
    color: 'white',
    cursor: 'pointer'
  },
  link: {
    marginTop: '15px',
    color: '#1a90ff',  // Brighter link color for better visibility in dark mode
    textDecoration: 'none'
  }
};

export default Login;
