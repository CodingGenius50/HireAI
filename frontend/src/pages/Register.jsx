import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("JOB_SEEKER");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("users/register/", {
        username,
        email,
        password,
        role,
      });

      alert("Registration successful!");
      navigate("/login");
    } 
    catch (error) {
  console.log("REGISTER ERROR:", error.response?.data);
  alert(JSON.stringify(error.response?.data));
 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-3 rounded mb-6"
        >
          <option value="JOB_SEEKER">Job Seeker</option>
          <option value="RECRUITER">Recruiter</option>
        </select>

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;