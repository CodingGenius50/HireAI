import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";
import CVUpload from "./pages/CVUpload";

import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterApplicants from "./pages/RecruiterApplicants";
import CompanyManagement from "./pages/CompanyManagement";
import JobManagement from "./pages/JobManagement";


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Public */}
        <Route path="/" element={<Jobs />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Job Seeker */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRole="JOB_SEEKER">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cv"
          element={
            <ProtectedRoute allowedRole="JOB_SEEKER">
              <CVUpload />
            </ProtectedRoute>
          }
        />


        {/* Recruiter */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/company"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <CompanyManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <JobManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/applicants"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <RecruiterApplicants />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;