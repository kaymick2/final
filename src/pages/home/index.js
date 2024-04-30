import React, { useState, useEffect } from 'react';
import axios from 'axios';
import base_url from '../base_url';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    title: '',
    description: '',
    review: '',
    thumbnail: ''
  });
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${base_url}/reviews`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReviews(response.data.reviews);
    } catch (error) {
      setError(error.message);
    }
  };
  const handleAddReview = async () => {
    try {
      
      let formData = new FormData()
      formData.append('title', newReview.title)
      formData.append('description', newReview.description)
      formData.append('review', newReview.review)
      formData.append('thumbnail', newReview.thumbnail)

      const token = localStorage.getItem('token');
      await axios.post(`${base_url}/reviews`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
     
      fetchReviews();
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="container">
           <button
            type="button"
            className="btn btn-primary mt-3"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            >
            Create review
            </button>

            
        <button className='btn btn-danger float-right mt-3' style={{marginLeft:10}} onClick={()=>{
            localStorage.removeItem('token');
            window.location.href = '/login';
        }}>Logout</button>


      <h1 className="mt-5 mb-4">Reviews List</h1>
      {error && <p>Error: {error}</p>}
      <div className="row">
        {reviews.map((review,index) => (
          <div key={index} className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <img src={review.thumbnail} style={{width:'100%',height:280}}/>
              <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginTop:5,marginBottom:20}}>
               
              </div>
 
              <h5 className="card-title">{review.title}</h5>
              <p className="card-text"><b>author: </b>{review.author?.username}</p>
 
              <p className="card-text"><b>description: </b>{review.description}</p>
 
              <p className="card-text"><b>review: </b>{review.review}</p>
 
 
            </div>
          </div>
        </div>
        ))}
      </div>


   
 <>
  {/* Modal */}
  <div
    className="modal fade"
    id="exampleModal"
    tabIndex={-1}
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel">
            Add Reviews
          </h1>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <div className="modal-body">
        <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={newReview.title}
                  onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  value={newReview.description}
                  onChange={e => setNewReview({ ...newReview, description: e.target.value })}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="review" className="form-label">
                  Review
                </label>
                <textarea
                  className="form-control"
                  id="review"
                  value={newReview.review}
                  onChange={e => setNewReview({ ...newReview, review: e.target.value })}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="thumbnail" className="form-label">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="thumbnail"
                  value={newReview.thumbnail}
                  onChange={e => setNewReview({ ...newReview, thumbnail: e.target.value })}
                />
              </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button type="button" onClick={handleAddReview} className="btn btn-primary">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</>


    </div>
  );
};

export default Home;
