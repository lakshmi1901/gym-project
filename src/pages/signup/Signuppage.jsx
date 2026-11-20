import React, { useState } from "react";
import "../signup/signuppage.css";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";
import { getErrorMessage } from "../../Common/Api/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signuppage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const validate = () => {
    if (form.name.trim().length < 2) return "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) return "Please enter a valid email.";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return "Password must contain a letter and a number.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return "";
  };

  const handleSignup = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    try {
      setLoading(true);
      // server stores the account with an argon2 hashed password
      await axios.post(`${Endpoint}/auth/register`, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      alert("Account created successfully! Please login.");
      navigate("/loginpage", { state: { email: form.email.trim() } });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the account."));
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") handleSignup();
  };

  return (
    <>
      <div className="signup_page">
        <div className="signup_form">
          <div className="signup_head">
            <div className="signup_circle"></div>
            <p className="signup_brand">
              Beast Forces <br />
              Gym
            </p>
          </div>

          <p className="signup_title">
            <u>Create Account</u>
          </p>

          <div className="signup_input_box">
            <PersonIcon className="signup_icon" />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              onKeyDown={handleEnter}
              autoComplete="name"
            />
          </div>

          <div className="signup_input_box">
            <EmailIcon className="signup_icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleEnter}
              autoComplete="email"
            />
          </div>

          <div className="signup_input_box">
            <LockIcon className="signup_icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 8, letters & numbers)"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleEnter}
              autoComplete="new-password"
            />
            {showPassword ? (
              <VisibilityOffIcon
                className="signup_eye"
                sx={{ fontSize: 18 }}
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <VisibilityIcon
                className="signup_eye"
                sx={{ fontSize: 18 }}
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          <div className="signup_input_box">
            <LockIcon className="signup_icon" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={handleChange}
              onKeyDown={handleEnter}
              autoComplete="new-password"
            />
            {showConfirm ? (
              <VisibilityOffIcon
                className="signup_eye"
                sx={{ fontSize: 18 }}
                onClick={() => setShowConfirm(false)}
              />
            ) : (
              <VisibilityIcon
                className="signup_eye"
                sx={{ fontSize: 18 }}
                onClick={() => setShowConfirm(true)}
              />
            )}
          </div>

          <p className="signup_error">{error}</p>

          <button
            className="signup_button"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Create Account"}
          </button>

          <p className="signup_footer">
            Already have an account?{" "}
            <Link to="/loginpage" className="signup_link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signuppage;
