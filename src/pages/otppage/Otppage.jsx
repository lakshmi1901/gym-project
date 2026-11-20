import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../otppage/otppage.css";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";
import { getErrorMessage } from "../../Common/Api/auth";

const Otppage = () => {
  const navigate = useNavigate();

  const [handleOtp1, setHandleOtp1] = useState("");
  const [handleOtp2, setHandleOtp2] = useState("");
  const [handleOtp3, setHandleOtp3] = useState("");
  const [handleOtp4, setHandleOtp4] = useState("");

  const email = sessionStorage.getItem("gym_reset_email");

  // no email entered on the previous page -> start again
  useEffect(() => {
    if (!email) navigate("/Forgetpassword", { replace: true });
  }, [email, navigate]);

  const HandleApi_1 = async () => {
    try {
      await axios.post(`${Endpoint}/auth/forgot-password`, { email });
      alert("A new OTP has been generated.");
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const HandleSend = async () => {
    const otp = handleOtp1 + handleOtp2 + handleOtp3 + handleOtp4;

    try {
      const { data } = await axios.post(`${Endpoint}/auth/verify-otp`, {
        email,
        otp,
      });
      sessionStorage.setItem("gym_reset_token", data.resetToken);
      navigate("/Resetpassword");
    } catch (err) {
      alert(getErrorMessage(err, "OTP is incorrect !"));
    }
  };
  

  return (
    <>
      <div className="login_page_Otppage">
        <div className="login_form_Otppage">
          <div className="form_head_Otppage">
            <div className="form_circle_Otppage"></div>
            <div className="form_circle_content_Otppage">
              <p className="form_head1_Otppage">
                Beast Forces <br /> Gym
              </p>
            </div>
            <p className="login_Otppage">Enter Your OTP</p>
            <div className="otp_space">
              <input
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp_input"
                onChange={(event) => setHandleOtp1(event.target.value)}
                
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp_input"
                onChange={(event) => setHandleOtp2(event.target.value)}
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp_input"
                onChange={(event) => setHandleOtp3(event.target.value)}
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp_input"
                onChange={(event) => setHandleOtp4(event.target.value)}
              />
            </div>
          </div>

          <div className="login_inputs_Otppage">
            <div className="input_box_Otppage"></div>

            <button className="Otppage_button" onClick={HandleSend}>
              Send
            </button>

            <Link
              to="/Otppage"
              className="otp_page"
              onClick={(event) => {
                event.preventDefault();
                HandleApi_1();
              }}
            >
              <p className="resend_otp">Resend the OTP</p>
            </Link>
            {/* <Link className="otp_page">
              <p className="resend_otp">Resend the OTP</p>
            </Link> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Otppage;
