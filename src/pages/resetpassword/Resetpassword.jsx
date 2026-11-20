import React, { useState } from "react";
import "../resetpassword/resetpassword.css";

import { Link, useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";
import { getErrorMessage } from "../../Common/Api/auth";

const Resetpassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetpass1, setResetpPass1] = useState("");
  const [resetpass2, setResetpPass2] = useState("");

  const navigate1 = useNavigate();

  const HandleResetPass = async () => {
    if (resetpass1 !== resetpass2) {
      alert("Passwords do not match !!");
      return;
    }
    if (
      resetpass1.length < 8 ||
      !/[A-Za-z]/.test(resetpass1) ||
      !/\d/.test(resetpass1)
    ) {
      alert("Password must be at least 8 characters with a letter and a number.");
      return;
    }

    const resetToken = sessionStorage.getItem("gym_reset_token");
    if (!resetToken) {
      alert("Please verify your OTP first.");
      navigate1("/Forgetpassword");
      return;
    }

    try {
      // the server stores the new password as an argon2 hash
      await axios.post(`${Endpoint}/auth/reset-password`, {
        resetToken,
        password: resetpass1,
      });
      sessionStorage.removeItem("gym_reset_token");
      sessionStorage.removeItem("gym_reset_email");
      alert("Password updated. Please login.");
      navigate1("/Loginpage");
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="Resetpassword_page">
        <div className="Resetpassword_form">
          <div className="Resetpassword_form_head">
            <div className="Resetpassword_form_circle"></div>

            <div className="Resetpassword_form_circle_content">
              <p className="Resetpassword_form_head1">
                Beast Forces <br />
                Gym
              </p>
            </div>

            <p className="Resetpassword_login">Reset Password</p>

            <p className="Resetpassword_text">
              Enter your new password below,
              <br />
              we are just being extra safe
            </p>
          </div>

          <div className="Resetpassword_inputs">
            <div className="Resetpassword_input_box">
              <LockIcon className="Resetpassword_icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                className="Resetpassword_input"
                onChange={(event) => setResetpPass1(event.target.value)}
              />

              {showPassword ? (
                <VisibilityOffIcon
                  className="Resetpassword_password_icon"
                  onClick={() => setShowPassword(false)}
                  sx={{ fontSize: 18 }}
                />
              ) : (
                <VisibilityIcon
                  className="Resetpassword_password_icon"
                  onClick={() => setShowPassword(true)}
                  sx={{ fontSize: 18 }}
                />
              )}
            </div>

            <div className="Resetpassword_input_box">
              <LockIcon className="Resetpassword_icon" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="Resetpassword_input"
                onChange={(event) => setResetpPass2(event.target.value)}
              />

              {showConfirmPassword ? (
                <VisibilityOffIcon
                  sx={{ fontSize: 18 }}
                  className="Resetpassword_password_icon"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <VisibilityIcon
                  sx={{ fontSize: 18 }}
                  className="Resetpassword_password_icon"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>

            {/* <Link to={"/Loginpage"}>
              <button className="Resetpassword_button" onClick={HandleResetPass}>Save</button>
            </Link> */}

            <button className="Resetpassword_button" onClick={HandleResetPass}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Resetpassword;
