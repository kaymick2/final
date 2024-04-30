import { Navigate } from "react-router-dom";

const GuestRequired = ({children}) =>{
    const token = localStorage.getItem('token');
    if(token){
        return <Navigate to={'/'}/>
    }else{
        return children;
    }
}

export default GuestRequired;