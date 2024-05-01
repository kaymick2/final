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

import ViewBook from "./pages/home/view_book";
import AdminViewBook from "./pages/admin/view_book";
import AdminHome from "./pages/admin";


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


          <Route path="/book/:id" element={<AuthRequired>
            <ViewBook />
          </AuthRequired>} />

          

          {/* Admin Routes */}

          <Route path="/admin/login" element={<AdminGuestRequired>
            <AdminLogin />
          </AdminGuestRequired>} />


          <Route path="/admin" element={<AdminAuthRequired>
            <AdminHome />
          </AdminAuthRequired>} />


          <Route path="/admin/book/:id" element={<AdminAuthRequired>
            <AdminViewBook />
          </AdminAuthRequired>} />

        </Switch>
    </Router>
  )
}

export default App