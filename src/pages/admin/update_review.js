import React, { useState,useEffect } from 'react';
import axios from 'axios';
import base_url from '../base_url';
import { Link, useParams,useNavigate } from 'react-router-dom';

const UpdateReview = () => {
    const [review, setReview] = useState({
        title: '',
        description: '',
        thumbnail: '',
        review: ''
      });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const {review_id} = useParams()
  const navigate = useNavigate()


  const handleChange = (e) => {
    const { name, value } = e.target;
    setReview(prevReview => ({
      ...prevReview,
      [name]: value
    }));
  };


  useEffect(() => {
    const fetchReview = async () => {
      try {
        const token = localStorage.getItem('admin_token')

        const response = await axios.get(`${base_url}/admin/reviews/${review_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data)
        setReview(response.data.review);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchReview();
  }, [review_id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token')
      let formData = new FormData()
      formData.append('title', review.title)
      formData.append('description', review.description)
      formData.append('thumbnail', review.thumbnail)
      formData.append('review', review.review)

      const response = await axios.put(`${base_url}/reviews/${review_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.message === 'Review updated successfully') {
        setSuccess(true);
        // Optionally, you can reset the form or update your UI to reflect the updated review
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mt-5">
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Title</label>
        <input type="text" className="form-control" id="title" name="title" value={review.title} onChange={handleChange} placeholder="Title" />
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <input type="text" className="form-control" id="description" name="description" value={review.description} onChange={handleChange} placeholder="Description" />
      </div>
      <div className="mb-3">
        <label htmlFor="thumbnail" className="form-label">Thumbnail</label>
        <input type="text" className="form-control" id="thumbnail" name="thumbnail" value={review.thumbnail} onChange={handleChange} placeholder="Thumbnail" />
      </div>
      <div className="mb-3">
        <label htmlFor="review" className="form-label">Review</label>
        <textarea className="form-control" id="review" name="review" value={review.review} onChange={handleChange} placeholder="Review" />
      </div>
      <button type="submit" className="btn btn-primary">Update Review</button>
      <button className="btn btn-danger " onClick={()=>navigate(-1)} style={{marginLeft:20}}>Close</button>

    </form>
    {error && <p>Error: {error}</p>}
    {success && <p className="text-success">Review updated successfully</p>}
  </div>
  );
};

export default UpdateReview;
