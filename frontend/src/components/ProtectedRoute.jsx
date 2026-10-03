import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const access = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  if (!access) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
}

export default ProtectedRoute;