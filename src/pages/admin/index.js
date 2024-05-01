import React,{useEffect, useState} from "react";

import base_url from "../base_url";
import axios from "axios";
import AdminBooks from "./books";

const AdminHome = ()=>{
  const [books, setBooks] = useState([]);
  const fetchBooks = async () => {
    try {
        const response = await axios.get(`${base_url}/admin/books/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('admin_token')}`
            }
          });
      
        setBooks(response.data.books);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
};

useEffect(()=>{
  fetchBooks();
},[])
return(
  <div className="container">
    <button className="btn btn-danger mt-3" onClick={()=>{
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }}>Logout</button>

    <br />
    <br />

    <AdminBooks books={books} fetchBooks={fetchBooks}/>
  </div>
)
}

export default AdminHome