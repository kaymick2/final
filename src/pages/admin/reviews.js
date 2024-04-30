import React, { useState, useEffect } from 'react';
import axios from 'axios';
import base_url from '../base_url';
import { Link } from 'react-router-dom';

const AdminReviews= () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${base_url}/admin/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReviews(response.data.reviews);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (reviewId) => {

    try {
    const token = localStorage.getItem('admin_token');

      const response = await axios.delete(`${base_url}/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setError("")
      fetchReviews()
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
       <button className='btn btn-danger float-right mt-3' style={{marginLeft:10}} onClick={()=>{
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
        }}>Logout</button>

      <h1 className="mt-5 mb-4">Reviews:</h1>
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      <div className="row">
        {reviews.map((review,index) => (
         <div key={index} className="col-md-4 mb-4">
         <div className="card">
           <div className="card-body">
             <img src={review.thumbnail} style={{width:'100%',height:280}}/>
             <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginTop:5,marginBottom:20}}>
              <button className='btn btn-danger' onClick={()=>handleDelete(review._id)}>Delete</button>
              <Link to={`/admin/edit/review/${review._id}`} className='btn btn-primary'>Edit</Link>

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

     

    </div>
  );
};

export default AdminReviews;
