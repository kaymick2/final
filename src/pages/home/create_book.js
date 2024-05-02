import React, { useState } from 'react';
import axios from 'axios';
import base_url from '../base_url';

const CreateBook = ({fetchBooks}) => {
    const [title, setTitle] = useState('');
    const [isbn, setIsbn] = useState('');
  
    const [thumbnail, setThumbnail] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('isbn', isbn);
           
            formData.append('thumbnail', thumbnail);

            const response = await axios.post(`${base_url}/books/`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,

                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.message === 'Book created successfully') {
                setSuccess(true);
                setTitle('');
                setIsbn('');
                setThumbnail(null);
                fetchBooks();
            }
        } catch (error) {
            setSuccess(false);
            setError(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Create Book</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label" style={styles.label}>Title</label>
                    <input type="text" className="form-control" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} />
                </div>
                <div className="mb-3">
                    <label htmlFor="isbn" className="form-label" style={styles.label}>ISBN</label>
                    <input type="text" className="form-control" id="isbn" required value={isbn} onChange={(e) => setIsbn(e.target.value)} style={styles.input} />
                </div>
               
                <div className="mb-3">
                    <label htmlFor="thumbnail" className="form-label" style={styles.label}>Thumbnail</label>
                    <input type="file" className="form-control" id="thumbnail" required onChange={(e) => setThumbnail(e.target.files[0])} style={styles.inputFile} />
                </div>
                <button type="submit" className="btn btn-primary" style={styles.button}>Create Book</button>
            </form>
            {error && <p className="text-danger mt-3" style={styles.errorText}>Error: {error}</p>}
            {success && <p className="text-success mt-3" style={styles.successText}>Book created successfully</p>}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(255, 255, 255, 0.1)',  // Lighter shadow for dark mode
        backgroundColor: '#424242',  // Darker form background
        color: 'white',  // Ensuring text inside the form is light colored
      },
    header: {
        textAlign: 'center',
        color: 'white'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        color:'white',
        gap: '20px'
    },
    label: {
        marginBottom: '5px',
        color: 'white'
    },
    input: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
    inputFile: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: '#fff'
    },
    button: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    errorText: {
        color: '#dc3545'
    },
    successText: {
        color: '#28a745'
    }
};

export default CreateBook;
