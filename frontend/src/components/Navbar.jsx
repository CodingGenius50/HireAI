import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const access = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-700"
          >
            HireAI
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">

            {/* Common */}
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              Jobs
            </Link>

            {/* Job Seeker */}
            {access && role === "JOB_SEEKER" && (
              <>
                <Link
                  to="/my-applications"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  My Applications
                </Link>

                <Link
                  to="/cv"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  My CV
                </Link>
              </>
            )}

            {/* Recruiter */}
            {access && role === "RECRUITER" && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  Dashboard
                </Link>

                <Link
                  to="/recruiter/company"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  Company
                </Link>

                <Link
                  to="/recruiter/jobs"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  Manage Jobs
                </Link>

                <Link
                  to="/recruiter/applicants"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  Applicants
                </Link>
              </>
            )}

            {/* Login / Register / Logout */}
            {!access ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Logout
              </button>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;