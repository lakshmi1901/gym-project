
import React, { useState } from "react";
import "../loginpages/loginpagee.css";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";
import { saveAuth, getErrorMessage } from "../../Common/Api/auth";

const Loginpage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // when coming from "Create account" the email is filled in for you
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handlechange_one = (event_1) => {
    setPassword(event_1.target.value);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter email and password !");
      return;
    }

    try {
      setLoading(true);
      // server checks the argon2 hash and answers with a JWT token
      const { data } = await axios.post(`${Endpoint}/auth/login`, {
        email: email.trim(),
        password,
      });
      saveAuth(data.token, data.user);
      navigate("/TemporaryDrawer", { replace: true });
    } catch (err) {
      alert(getErrorMessage(err, "email or password is incorrect !"));
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <>
      <div className="login_page">

        <div className="login_form">

       
          <div className="form_head">

            <div className="form_circle"></div>

            <div className="form_circle_content">
              <p className="form_head1">
                Beast Forces <br />
                Gym
              </p>
            </div>

            <p className="login">
              <u>Login</u>
            </p>

          </div>


      
          <div className="login_inputs">

            <div className="input_box">

              <EmailIcon className="icon" />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleChange}
                onKeyDown={handleEnter}
              />

            </div>


            <div className="input_box">

              <LockIcon className="icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlechange_one}
                onKeyDown={handleEnter}
              />

              {showPassword ? (
                <VisibilityOffIcon
                  className="password_icon"
                  sx={{ fontSize: 18 }}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <VisibilityIcon
                  sx={{ fontSize: 18 }}
                  className="password_icon"
                  onClick={() => setShowPassword(true)}
                />
              )}

            </div>


            
            <Link
              to={"/Forgetpassword"}
              className="link_password"
            >
              forget password?
            </Link>


            
            <button
              className="login_button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Login"}
            </button>

            <p className="create_account_text">
              Don't have an account?{" "}
              <Link to="/signup" className="create_account_link">
                Create account
              </Link>
            </p>

          </div>

        </div>

      </div>
    </>
  );
};

export default Loginpage;