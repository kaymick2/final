import { Navigate } from "react-router-dom"

const AuthRequired=({children}) =>{
    const token = localStorage.getItem('token')
    if(token){
        return children
    }else{
        return <Navigate to="/login" />
    }
}

export default AuthRequired