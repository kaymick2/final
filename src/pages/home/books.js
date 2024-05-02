import React, { useState } from "react";
import base_url from "../base_url";
import axios from "axios";
import { Link } from "react-router-dom";

const Books = ({ books, fetchBooks }) => {
    const [isDeleted, setDeleted] = useState(false);

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
            fetchBooks();
        } catch (error) {
            if (error && error.response.data.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Error deleting book:', error);
            }
        }
    };

    return (
        <div className="container" style={styles.container}>
            <h1 style={styles.header}>Books</h1>
            <div className="row" style={styles.row}>
                {books.map((book, index) => (
                    <div className="col-md-4 mb-4" key={index} style={styles.bookContainer}>
                        <div className="card" style={styles.card}>
                            <img src={`${base_url}/static/uploads/${book.thumbnail}`} alt={book.title} style={styles.image}/>
                            <div className="card-body">
                                <h5 className="card-title">{book.title}</h5>
                                <p className="card-text">ISBN: {book.isbn}</p>
                                <p className="card-text">Author: {book.author_info?.username}</p>
                                <br />
                                <Link className="btn btn-success" to={`/book/${book._id}`} style={styles.button}>View</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#333', // Dark background
        color: '#fff', // Light text for readability
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(255, 255, 255, 0.1)' // Lighter shadow for dark mode
    },
    header: {
        color: '#fff', // Light text color
        marginBottom: '20px'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap'
    },
    bookContainer: {
        marginBottom: '20px',
        flex: '1 1 30%', // Adjusted for 4 items per row
        maxWidth: '30%', // Ensure no more than 4 items per row
    },
    card: {
        backgroundColor: '#424242', // Darker card background
        boxShadow: '0 4px 8px rgba(255, 255, 255, 0.1)', // Lighter shadow for dark mode
        borderRadius: '8px',
        color: 'white',
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '250px',
        objectFit: 'cover' // Ensures the image covers the area without distortion
    },
    button: {
        backgroundColor: '#28a745', // Keep button color for contrast
        borderColor: '#28a745',
        color: '#e4e2b7',
        fontWeight: 'bold'
    }
};
export default Books;