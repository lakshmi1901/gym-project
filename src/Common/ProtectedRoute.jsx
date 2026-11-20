import { Navigate } from "react-router-dom";
import { isLoggedIn, clearAuth } from "./Api/auth";

// Pages inside need a valid (non-expired) JWT, otherwise go to login.
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    clearAuth();
    return <Navigate to="/loginpage" replace />;
  }
  return children;
};

export default ProtectedRoute;
