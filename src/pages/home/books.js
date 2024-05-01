
import React,{ useState } from "react";
import base_url from "../base_url";
import axios from "axios";
import { Link } from "react-router-dom";
const Books = ({books,fetchBooks}) => {
   
    const [isDeleted,setDeleted] = useState(false)
    const handleDelete = async (id) => {
        try {
          // Make DELETE request to the API endpoint
          const response = await axios.delete(`${base_url}/books/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          // If successful, set deleted state to true
          setDeleted(true);
          fetchBooks()
        } catch (error) {
            if(error && error.response.data.detail){
                alert(error.response.data.detail)
            }else{
                alert('Error deleting book:', error);

            }
        }
      };
    return (
        <div className="container border p-4">
        <h1 className="mb-4">Books</h1>
        <div className="row">
            {books.map((book, index) => (
                <div className="col-md-4 mb-4" key={index}>
                    <div className="card">
                        <img src={`${base_url}/static/uploads/${book.thumbnail}`}  alt={book.title} style={{width:'100%',height:250}}/>
                        <div className="card-body">
                            <h5 className="card-title">{book.title}</h5>
                            <p className="card-text">ISBN: {book.isbn}</p>
                            <p className="card-text">Author: {book.author_info?.username}</p>
                        </div>
                        <br />
                        <Link className="btn btn-success" to={`/book/${book._id}`}>View</Link>
                       
                        
                    </div>
                </div>
            ))}
        </div>
    </div>
    

    );
};

export default Books;