import React,{useEffect, useState} from "react";
import CreateBook from "./create_book";
import Books from "./books";
import base_url from "../base_url";
import axios from "axios";

const Home = ()=>{
  const [books, setBooks] = useState([]);
  const fetchBooks = async () => {
    try {
        const response = await axios.get(`${base_url}/books/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }}>Logout</button>

    <br />
    <CreateBook fetchBooks={fetchBooks}/>
    <br />
    <Books books={books} fetchBooks={fetchBooks}/>
  </div>
)
}

export default Home