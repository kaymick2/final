import React, { useEffect, useState } from "react";
import CreateBook from "./create_book";
import Books from "./books";
import base_url from "../base_url";
import axios from "axios";

const Home = () => {
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

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="container" style={styles.container}>
      <button style={styles.logoutButton} onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }}>Logout</button>

      <div style={styles.createBook}>
        <CreateBook fetchBooks={fetchBooks} />
      </div>

      <div style={styles.books}>
        <Books books={books} fetchBooks={fetchBooks} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#1B1A55',  // Dark background for dark mode
    color: '#e4e2b7',  // Light text color for readability in dark mode
    padding: '20px'
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',  // Keeping the button color for contrast
    color: 'e4e2b7',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '20px',
    alignSelf: 'flex-end'  // Right-justifies the button within its flex container
  },
  createBook: {
    width: '100%',
    maxWidth: '600px',
    marginBottom: '20px'
  },
  books: {
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 4px 8px rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1a1a1a',
    color: '#e4e2b7',
  },
};


export default Home;
