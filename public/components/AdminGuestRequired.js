import { Navigate } from "react-router-dom"

const AdminGuestRequired = ({children})=>{
    const admin_token = localStorage.getItem('admin_token')

    if(admin_token){
        return <Navigate to={'/admin/'}/>
    }else{
        return children
    }
}

export default AdminGuestRequired