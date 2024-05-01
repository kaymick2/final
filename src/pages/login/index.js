// Login.js

import React, { useState } from 'react';
import axios from 'axios';
import base_url from '../base_url';
import { Link } from 'react-router-dom';

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
      let _FormData = new FormData()
      _FormData.append('username', formData.username)
      _FormData.append('password',formData.password)
      const response = await axios.post(`${base_url}/token`, _FormData);
      localStorage.setItem('token',response.data.access_token);
      window.location = "/"
      
    } catch (error) {
     if(error && error.response.data.detail){
        alert(error.response.data.detail)

     }else{
      alert("Something went wrong.Please try again")
     }
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input type="text" className="form-control" id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <br />
        <Link to={'/register'} >dont have an account?want to register</Link>
      </form>
    </div>
  );
};

export default Login;
