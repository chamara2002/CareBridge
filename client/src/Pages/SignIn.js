import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mother");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && password) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");

        if (data.token) {
          // Use the context login function instead of directly setting localStorage
          login(data.token, role);
          alert("Login successful");

          // Redirect based on user role
          if (role === "mother") {
            navigate("/Mother/MotherDashboard");
          } else if (role === "midwife") {
            navigate("/dashboard");
          } else if (role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard"); // Default fallback
          }
        } else {
          alert("Login failed: No token received");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed: " + error.message);
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="mother">Mother</option>
            <option value="midwife">Midwife</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;