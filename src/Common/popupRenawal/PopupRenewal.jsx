import React, { useEffect, useState } from "react";
import "../popupRenawal/popup_renewal.css";
import axios from "axios";
import { Endpoint } from "../Api/Endpoint";

const PopupRenewal = ({ 
  setDuration = () => {},
  usersObject={}
  // usersInfo =()=>{}

}) => {
  const handleOkay = () => {
    handleUpdate();
    setDuration(false);
  
  };

  const [MemberShipDuration, setMemberShipDuration] = useState("1 month");
  const [StartDate, setStartDate] = useState("");
  const [ExpiredDate, setExpiredDate] = useState("");

  const date = new Date();
  const current_date = date.toISOString().split("T")[0];
  const mem_duration = MemberShipDuration.split(" ");

  let st_date = StartDate.split("-");

  st_date = [Number(st_date[0]), Number(st_date[1]), Number(st_date[2])];

  useEffect(() => {
    if (StartDate === "") return;

    let st_date = StartDate.split("-");
    let duration = MemberShipDuration.split(" ");

    let date = new Date(StartDate);

    if (duration[1] === "month") {
      date.setMonth(date.getMonth() + Number(duration[0]));
    } else {
      date.setFullYear(date.getFullYear() + Number(duration[0]));
    }

    setExpiredDate(date.toLocaleDateString("en-CA"));
  }, [StartDate, MemberShipDuration]);

  console.log(ExpiredDate);




  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${Endpoint}/users_info/${usersObject.id}`,
        {
          ...usersObject,
          joining_date: StartDate,
          Membership_duration: MemberShipDuration,
          expired: ExpiredDate,
        },
      );

      console.log(response);
      alert("Data Updated Successfully!");
    } catch (error) {
      console.log(error);
      alert("Update Failed!");
    }
  };



  return (
    <>
      <div className="PopupRenewal_main">
        <div className="PopupRenewal_card">
          <div className="PopupRenewal_content">
            <div className="PopupRenewal_duradion_box">
              <label htmlFor="duration">Duration</label>
              <select
                className="PopupRenewal_select"
                name=""
                id="duration"
                onChange={(e) => setMemberShipDuration(e.target.value)}
              >
                <option value="1 month">1 month</option>
                <option value="3 month">3 month</option>
                <option value="6 month">6 month</option>
                <option value="1 year">1 year</option>
              </select>
            </div>
            <div className="PopupRenewal_join_box">
              <label htmlFor="joinn">Start Date</label>
              <input
                type="date"
                id="joinn"
                className="PopupRenewal_inputDate"
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="PopupRenewal_expiry_box">
              <label htmlFor="">Expired Date</label>
              <input
                type="date"
                className="PopupRenewal_inputDate1"
                value={ExpiredDate}
                onChange={(e) => setExpiredDate(e.target.value)}
              />
            </div>
            <button className="PopupRenewal_btn" onClick={handleOkay}>
              Okay
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupRenewal;
