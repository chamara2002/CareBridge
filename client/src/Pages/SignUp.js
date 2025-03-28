import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate(); // Initialize navigate hook

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('mother');
  const [nic, setNic] = useState('');
  const [villageCode, setVillageCode] = useState('');
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [serviceNo, setServiceNo] = useState('');
  const [mohBranch, setMohBranch] = useState('');
  const [adminKey, setAdminKey] = useState(''); // Admin access key
  const [errorMessage, setErrorMessage] = useState(''); // Error message for validation

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error message
    setErrorMessage('');

    // Client-side Validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    // Email Validation (basic)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    // Admin Access Key Validation
    if (role === 'admin' && adminKey !== 'Admin@123') {
      setErrorMessage('Invalid Admin Access Key');
      return;
    }

    const userData = {
      name,
      email,
      password,
      role,
      nic,
      villageCode,
      address,
      birthdate,
      serviceNo,
      mohBranch,
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.status === 201) {
        alert(data.message);
        // Redirect to Sign In page after successful signup
        navigate('/signin');
      } else {
        setErrorMessage(data.message || 'Server error');
      }
    } catch (err) {
      setErrorMessage('Server error');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>

        {/* Display error message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Role Selection */}
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="mother">Mother</option>
            <option value="midwife">Midwife</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Mother-Specific Fields */}
        {role === 'mother' && (
          <>
            <input
              type="text"
              placeholder="Village Code"
              value={villageCode}
              onChange={(e) => setVillageCode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="date"
              placeholder="Birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </>
        )}

        {/* Midwife-Specific Fields */}
        {role === 'midwife' && (
          <>
            <input
              type="text"
              placeholder="NIC"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
            />
            <input
              type="text"
              placeholder="Service No"
              value={serviceNo}
              onChange={(e) => setServiceNo(e.target.value)}
            />
            <input
              type="text"
              placeholder="MOH Branch"
              value={mohBranch}
              onChange={(e) => setMohBranch(e.target.value)}
            />
            <input
              type="date"
              placeholder="Birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </>
        )}

        {/* Admin Access Key */}
        {role === 'admin' && (
          <input
            type="password"
            placeholder="Admin Access Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            required
          />
        )}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
