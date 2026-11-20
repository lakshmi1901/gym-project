import React from "react";
import page1a from "../../assets/projectimg/page1.png";
import "../homepage/getstartpage.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Loginpage from "../loginpages/Loginpage";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";


const Getstartpage = () => {
  return (
    <>
      <div className="start_page">
        <div className="top_lefthead">
          <div className="circle"></div>
          <p>
            <b className="beast_force">Beast Forces</b>
          </p>
        </div>
        <div className="centre_content">
          <p className="get_ready">Get Ready</p>
          <br />
          <p className="shape">Shape your body</p>
          <br />
          <em className="content1a">
            “The harder you work and the more prepared you are <br /> for
            something, you’re going to be able to persevere <br />
            through anything.”
          </em>
          <br />
          {/* <div className="btn_getstart"></div> */}
          <Link to="/Loginpage" style={{textDecoration:"none"}}>
            <div className="btn_getstart"><p className="Get_Starteda">Get Started</p></div>
          </Link>

        </div>
        <div className="social_container">
          <a
            className="icon_circle"
            href="https://www.facebook.com/photo/?fbid=1160752516464739&set=a.181386401068027&__cft__[0]=AZikZCnCR0VjhRtTBNygsrcp0Of2YOhCi06elcVdO8zkLQBBdJ2jmHIqXMZ6rJIh9bT5hc1aF6hBkZERLOsHTwTxUwjXTfCZDMptQiTiIuIylH0tAuPUnW61opQLPsQuNwwnoXxjnV3TjatHAMcmRrZGBII5bGieC-QSQ4SHgIZgJZZw8Fy3m6J3YR5g54iJ5xYPqyhKQNzayeY&__tn__=EH-R"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Beast Forces Gym on Facebook"
          >
            <FacebookIcon />
          </a>

          <a
            className="icon_circle"
            href="https://www.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Google"
          >
            <GoogleIcon />
          </a>

          <a
            className="icon_circle"
            href="https://www.instagram.com/gym_dudes/#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Beast Forces Gym on Instagram"
          >
            <InstagramIcon />
          </a>

          <a
            className="icon_circle"
            href="https://whatsapp.com/channel/0029VbBT0iy9hXFBgoEmQg32"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Beast Forces Gym on WhatsApp"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>
    </>
  );
};

export default Getstartpage;
