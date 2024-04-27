import { Navigate } from "react-router-dom";

const AdminAuthRequired = ({children})=>{
    const admin_token = localStorage.getItem('admin_token');

    if(admin_token){
        return children
    }else{
        return <Navigate to="/admin/login" />
    }
}

export default AdminAuthRequired;