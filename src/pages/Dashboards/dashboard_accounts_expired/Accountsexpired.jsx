import React, { use, useEffect, useState } from "react";
import TemporaryDrawer from "../Drawer/Drawer";
import "../dashboard_accounts_expired/accountexpired.css";
import Table from "../../../Common/Table/Table.jsx";
import { accountexpired_data } from "./accountexpired.js";
import Popup from "../../../Common/popupcard/Popup.jsx";
import Userprofilepop from "../../../Common/userProfilePopup/Userprofilepop.jsx";
import PopupRenewal from "../../../Common/popupRenawal/PopupRenewal.jsx";
import axios from "axios";
import { Endpoint } from "../../../Common/Api/Endpoint.js";

const Accountsexpired = () => {
  const [popup, setPopup] = useState(false);
  const [duration, setDuration] = useState(false);
  const[usersInfo,setUSersInfo]= useState([])

  const[usersObject,setUsersObject] = useState({})

  const date = new Date();
  const current_date = date.toISOString().split("T")[0];


  const HandleApi = async () => {
    const { data } = await axios.get(`${Endpoint}/users_info`);

    const filteredUsers = data.filter((user) => {

      if(current_date > user.expired){
        return user;
      }
    });
    setUSersInfo(filteredUsers);
  };
  
  useEffect(() => {
    HandleApi();
  }, []);



  

  const tableHead = [
    "id",
    "profile",
    "Name",
    "Phone_Number",
    "joining_date",
    "expired_within",
    "expired",
  ];

  return (
    <>
      <div className="accountexpired_main">
        <p className="accountexpired_content">Accounts Expired</p>
        <div className="accountexpired_thead_bg"></div>
        <div className="accountsexpired_table_con">
          <Table
            data={usersInfo}
            tableHead={tableHead}
            renewal={true}
            setPopup={setPopup}
            setUsersObject={setUsersObject}
            // setUserprofilepopup={setUserprofilepopup}
          />
        </div>
      </div>

      {popup && (
        <Popup
          popHead1="Are you sure you want to renewal?"
          confirmBtn="sure"
          setPopup={setPopup}
          setDuration={setDuration}
        />
      )}

       {duration && (
        <PopupRenewal
          usersInfo={usersInfo}
          setDuration={setDuration}
          usersObject={usersObject}
        />
      )}

      {/* {Userprofilepopup && (
        <Userprofilepop setUserprofilepopup={setUserprofilepopup} />
      )} */}

      
    </>
  );
};

export default Accountsexpired;
