import { Navigate } from 'react-router-dom'
import { estaAutenticado } from '../services/authService'

function PrivateRoute({ children }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" />
  }
  return children
}

export default PrivateRoute