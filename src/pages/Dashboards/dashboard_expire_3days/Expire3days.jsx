




import React, { useEffect, useState } from "react";
import "../dashboard_expire_3days/expire3days.css";
import { user_details } from "../dashboard_expire_3days/expire3days.js";
import Table from "../../../Common/Table/Table.jsx";
import Popup from "../../../Common/popupcard/Popup.jsx";
import Userprofilepop from "../../../Common/userProfilePopup/Userprofilepop.jsx";
import PopupRenewal from "../../../Common/popupRenawal/PopupRenewal.jsx";
import axios from "axios";
import { Endpoint } from "../../../Common/Api/Endpoint.js";

const Expire3days = () => {
  const [popup, setPopup] = useState(false);
  const [duration, setDuration] = useState(false);

  const [usersInfo, setUSersInfo] = useState([]);
  const [usersObject, setUsersObject] = useState({});

  const current_date = new Date().toISOString().split("T")[0];

  // Expire date-ku 3 days before date calculate pannum
  const handleExpire3Day = (expired) => {
    if (!expired) return null;

    const date = new Date(expired);

    // Invalid date-na return null
    if (isNaN(date.getTime())) {
      return null;
    }

    date.setDate(date.getDate() - 3);

    return date.toISOString().split("T")[0];
  };

  const HandleApi = async () => {
    try {
      const { data } = await axios.get(
        `${Endpoint}/users_info`
      );

      const filteredUsers = data.filter((user) => {
        const threeDaysBefore = handleExpire3Day(user.expired);

        if (!threeDaysBefore) return false;

        return (
          threeDaysBefore <= current_date &&
          current_date < user.expired
        );
      });

      setUSersInfo(filteredUsers);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const tableHead = [
    "id",
    "profile",
    "Name",
    "Phone_Number",
    "joining_date",
    "expired",
  ];

  useEffect(() => {
    HandleApi();
  }, []);

  return (
    <>
      <div className="expire3days_main">
        <p className="expire3days_content">
          Accounts are going to expire within 3 days
        </p>

        <div className="expire3days_thead_bg"></div>

        <div className="expire3days_table_con">
          <Table
            data={usersInfo}
            tableHead={tableHead}
            renewal={true}
            setPopup={setPopup}
            setUsersObject={setUsersObject}
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
          setDuration={setDuration}
          usersObject={usersObject}
        />
      )}
    </>
  );
};

export default Expire3days;
