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
                setTitle('')
                setIsbn('')
                setThumbnail(null)
                fetchBooks()
                // Optionally, you can reset the form or update your UI to reflect the created book
            }
        } catch (error) {
            setSuccess(false);

            setError(error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Create Book</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input type="text" className="form-control" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="isbn" className="form-label">ISBN</label>
                    <input type="text" className="form-control" id="isbn" required value={isbn} onChange={(e) => setIsbn(e.target.value)} />
                </div>
               
                <div className="mb-3">
                    <label htmlFor="thumbnail" className="form-label">Thumbnail</label>
                    <input type="file" className="form-control" id="thumbnail" required  onChange={(e) => setThumbnail(e.target.files[0])} />
                </div>
                <button type="submit" className="btn btn-primary">Create Book</button>
            </form>
            {error && <p className="text-danger mt-3">Error: {error}</p>}
            {success && <p className="text-success mt-3">Book created successfully</p>}
        </div>
    );
};

export default CreateBook;
