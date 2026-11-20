import * as React from "react";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import "./drawer.css";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Popup from "../../../Common/popupcard/Popup.jsx";
import { useState } from "react";
import { clearAuth } from "../../../Common/Api/auth";


export default function TemporaryDrawer() {
  const [popup, setPopup] = useState(false);
  const [logout, setLogout] = useState(false);



  const navigate = useNavigate();
  const location = useLocation();


    const handleLogout = () => {

        clearAuth(); // remove the JWT
        navigate("/Loginpage", { replace: true });
    };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/TemporaryDrawer/dashboard_main",
    },

    {
      text: "View Registered",
      icon: <PeopleIcon />,
      path: "/TemporaryDrawer/viewregistered",
    },

    {
      text: "Payment History",
      icon: <PaymentIcon />,
      path: "/TemporaryDrawer/paymenthistory",
    },
  ];



  return (
    <>
      <div className="layout">
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: 260,
            flexShrink: 0,

            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
            },
          }}
        >
          <div className="drawer-container">
            <div className="drawer-header">
              <div className="drawer_circle"></div>

              <h2>Beast Forces</h2>
            </div>

            <Divider />

            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    className={
                      location.pathname.startsWith(item.path)
                        ? "drawer-btn active"
                        : "drawer-btn"
                    }
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>

                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <div className="drawer-footer" onClick={() => setPopup(true)}>
              <LogoutIcon />
              Logout
            </div>
          </div>
        </Drawer>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {popup && (
        <Popup
          popHead1="Are you sure you want to Logout?"
          confirmBtn="Logout"
          onClick={handleLogout}
          setPopup={setPopup} 
        />
      )}

      
    </>
  );
}
