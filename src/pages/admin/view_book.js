import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import base_url from '../base_url';

const AdminViewBook = () => {
  const [book, setBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editedReview, setEditedReview] = useState({ _id:'',rating:0,description:'' });
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);

  const [EditBookDetails,setEditBookDetails] = useState({isbn:'',title:''});
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {id} = useParams()

  const handleDelete = async (id) => {
    try {
      // Make DELETE request to the API endpoint
      const response = await axios.delete(`${base_url}/admin/books/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      // If successful, set deleted state to true
      alert("Book deleted successfully")
      window.location = "/admin/"
    } catch (error) {
        if(error && error.response.data.detail){
            alert(error.response.data.detail)
        }else{
            alert('Error deleting book:', error);

        }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating: rating });
  };

  const handleSubmitReview = async () => {
    
    try {
      let formData = new FormData()
      formData.append('description',newReview.comment)
      formData.append('rating',newReview.rating)
      formData.append('book_id',id.toString())
      const response = await axios.post(`${base_url}/admin/reviews/`, formData,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      setNewReview({ rating: 0, comment: '' });

      alert("Review added successfully")
      fetchReviews()
    } catch (error) {
      setError(error.message);
    }
  };


  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/reviews?book_id=${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
     
      setReviews(response.data.reviews);
    } catch (error) {
      setError(error.message);
    }
  };


  const handleDeleteReview = async (id) => {
    try {
      await axios.delete(`${base_url}/admin/reviews/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      fetchReviews()
    } catch (error) {
      alert('Error deleting review:', error);
      // Handle error
    }
  };

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/books/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`
          }
        });

    
      setBook(response.data.book);
     
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEditClick = (title,isbn) => {
    setEditBookDetails({title,isbn})
    setShowModal(true);
  };


  const handleSaveChanges =  async() => {
    if(EditBookDetails.isbn.length<1 || EditBookDetails.title.length<1){
        alert("All the fields are required")
        return false
    }

    try {

       
        let formData = new FormData()
        
        formData.append('title',EditBookDetails.title)
        formData.append('isbn',EditBookDetails.isbn)
        formData.append('book_id',id)
        await axios.put(`${base_url}/admin/books/${book._id}`, formData,{
            headers: {
              Authorization: `Bearer ${localStorage.getItem('admin_token')}`
            }
  
        });
        alert("Book updated successfully")
        setEditBookDetails({title:'',isbn:''})
        fetchBookDetails()
        setShowModal(false);
      } catch (error) {
        console.log(error)
        alert("Something Went Wrong.Please try again");
        // Handle error
      }
  };


  const handleClickEditReview = (_id,rating,description)=>{
    setEditedReview({_id,description,rating})
    setShowEditReviewModal(true)
  }

  const handleUpdateReview =  async() => {

    if(editedReview.description.length<1 || editedReview.rating <1){
        alert("All the fields are required")
        return false
    }
    try {
        let formData = new FormData()
        formData.append('description',editedReview.description)
        formData.append('rating',editedReview.rating)
        formData.append('review_id',editedReview._id.toString())
        const response = await axios.put(`${base_url}/admin/reviews/`, formData,{
            headers: {
              Authorization: `Bearer ${localStorage.getItem('admin_token')}`
            }
        })
        alert("Review updated successfully")
        setEditedReview({_id:'',description:'',rating:0})
        setShowEditReviewModal(false)
        fetchReviews()
      } catch (error) {
        alert("Something went wrong.Please try again")
        console.error('Error updating review:', error);
       
      }
  };


  useEffect(() => {
   
    fetchBookDetails();
    fetchReviews()
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mt-4">
    <div className="row">
        <div className="col-md-4">
            <img src={`${base_url}/static/uploads/${book.thumbnail}`} className="img-fluid" alt={book.title} />
        </div>
        <div className="col-md-8">
            <h1>{book.title}</h1>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Author:</strong> {book.author_info?.username}</p>
            <hr />
            
                <button onClick={() => handleDelete(book._id)} className="btn btn-danger">Delete</button>
           

           
                <button onClick={() => handleEditClick(book.title,book.isbn)} className="btn btn-primary" style={{marginLeft:20}}>Edit</button>
           
        </div>
    </div>
    <br />
    <hr />
     {/* Reviews Section */}
     <div className="row">
        
        <div className="col-md-6">


             {/* Add Review Form */}
          {/* <h4>Add a Review</h4>
          <div className="form-group">
            <label>Rating:</label>
            <div>
              {[1, 2, 3, 4, 5].map((rating) => (
                <span key={rating} onClick={() => handleRatingChange(rating)} style={{ cursor: 'pointer',fontSize:30 }}>
                  {rating <= newReview.rating ? '\u2605' : '\u2606'}
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea name="comment" value={newReview.comment} onChange={handleInputChange} className="form-control" rows="3"></textarea>
          </div>
          <button onClick={handleSubmitReview} className="btn btn-primary">Submit Review</button>
 */}

        <br />
        <hr />


          <h3>Reviews</h3>
          {/* Display Existing Reviews Here */}
          {reviews?.map((review, index) => (
            <div key={index} className="mb-3 border p-3">

              <b>Posted by: {review.author?.username}</b>
              <p><strong>Rating:</strong> {review.rating} out of 5</p>
             
              <p><strong>Description:</strong> {review.description}</p>

              <hr />
           
                <button onClick={() => handleDeleteReview(review._id)} className="btn btn-danger">Delete</button>
           

           
                <button  className="btn btn-primary" onClick={()=>handleClickEditReview(review._id,review.rating,review.description)} style={{marginLeft:20}}>Edit</button>
          
            </div>
          ))}
          <hr />
         
        </div>
      </div>



        {/* Modal */}
        {showModal && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Book</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={EditBookDetails.title} onChange={(e) => setEditBookDetails({title:e.target.value,isbn:EditBookDetails.isbn})} className="form-control" />
                </div>
                <div className="form-group">
                  <label>ISBN</label>
                  <input type="text" value={EditBookDetails.isbn} onChange={(e) => setEditBookDetails({isbn:e.target.value,title:EditBookDetails.title})} className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>Save changes</button>
              </div>
            </div>
          </div>
     

        </div>
      )}



      {/* Edit Review Modal */}
      {showEditReviewModal && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Review</h5>
                <button type="button" className="close" onClick={() => setShowEditReviewModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" value={editedReview.description} onChange={(e) => setEditedReview({ ...editedReview, description: e.target.value })} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <span key={rating} onClick={(e) => setEditedReview({ ...editedReview, rating })}  style={{ cursor: 'pointer', fontSize: 30 }}>
                      {rating <= editedReview.rating ? '\u2605' : '\u2606'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditReviewModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateReview}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}


</div>

  );
};

export default AdminViewBook;
