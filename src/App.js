import React from "react";
import {
  BrowserRouter as Router,
  Routes as Switch,
  Route
} from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import GuestRequired from "./components/GuestRequired";
import AuthRequired from "./components/AuthRequired";
import Home from "./pages/home";
import AdminLogin from "./pages/admin/login";
import AdminGuestRequired from "./components/AdminGuestRequired";

import AdminAuthRequired from "./components/AdminAuthRequired";
import AdminReviews from "./pages/admin/reviews";
import UpdateReview from "./pages/admin/update_review";


const App = ()=>{
  return(
    <Router>
        <Switch>
          <Route path="/register" element={
          <GuestRequired>
            <Register />
          </GuestRequired>
          } />

          <Route path="/login" element={
          <GuestRequired>
              <Login />
          </GuestRequired>
          } />

          <Route path="/" element={<AuthRequired>
            <Home />
          </AuthRequired>} />



          <Route path="/admin/login" element={<AdminGuestRequired>
            <AdminLogin />
          </AdminGuestRequired>} />

          <Route path="/admin/" element={<AdminAuthRequired>
            <AdminReviews />
          </AdminAuthRequired>} />

          <Route path="/admin/edit/review/:review_id" element={<AdminAuthRequired>
            <UpdateReview />
          </AdminAuthRequired>} />


        </Switch>
    </Router>
  )
}

export default App