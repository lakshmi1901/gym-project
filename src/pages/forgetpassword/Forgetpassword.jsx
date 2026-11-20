// import React from "react";
import React, { useState } from "react";
import "../forgetpassword/forgetpassword.css";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";
import { getErrorMessage } from "../../Common/Api/auth";

const Forgetpassword = () => {
  const [inpForget, setInpForget] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgetInp = (event) => {
    setInpForget(event.target.value);
  };

  const navigate1 = useNavigate();

  const handleFrgtt = async () => {
    const email = inpForget.trim();
    if (!email) {
      alert("Please enter your email !");
      return;
    }

    try {
      setLoading(true);
      // the server generates the OTP (it is printed in the server terminal)
      await axios.post(`${Endpoint}/auth/forgot-password`, { email });
      sessionStorage.setItem("gym_reset_email", email);
      navigate1("/Otppage");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login_page_forgetpassword">
        <div className="login_form_forgetpassword">
          <div className="form_head_forgetpassword">
            <div className="form_circle_forgetpassword"></div>
            <div className="form_circle_content_forgetpassword">
              <p className="form_head1_forgetpassword">
                Beast Forces <br /> Gym
              </p>
            </div>
            <p className="login_forgetpassword">Forget Your Password ?</p>
            <p className="reveive_opt">
              Enter your email below to receive your OTP
            </p>
          </div>

          <div className="login_inputs_forgetpassword">
            <div className="input_box_forgetpassword">
              <EmailIcon className="icon_forgetpassword" />
              <input 
              type="email" 
              placeholder="Email"
              onChange={handleForgetInp}
               />
            </div>
            
              <button 
              className="forgetpassword_button" 
              onClick={handleFrgtt}
              disabled={loading}>Send</button>
            
            {/* <Link to={"/Otppage"}>
              <button className="forgetpassword_button">Send</button>
            </Link> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Forgetpassword;
