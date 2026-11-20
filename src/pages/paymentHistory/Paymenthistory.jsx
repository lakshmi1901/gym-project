import React, { useEffect } from "react";
import Table from "../../Common/Table/Table";
// import { view_register } from '../view_register/viewregisterjs'
import payment_historyy from "./paymenthistoryy";
import "../paymentHistory/paymenthistory.css";
import Userprofilepop from "../../Common/userProfilePopup/Userprofilepop";
import { useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import DateFilter from "../../Common/DateFilter/DateFilter";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";

const Paymenthistory = () => {
  const [Userprofilepopup, setUserprofilepopup] = useState(false);

  const [filterr, setFilterr] = useState([]);
  const [datefilter, setDateFilter] = useState(false);

  // const[usersInfo,setUSersInfo]= useState([])
  const [data, setData] = useState([]);
  const [profileData, setProfileData] = useState({});

  // console.log(filterr);

  const HandleInput = (val) => {
    const filteredUsers = data.filter(
      (user) =>
        user.Name.toLowerCase().includes(val.toLowerCase()) ||
        user.joining_date.includes(val) ||
        user.fees_amount.toLowerCase().includes(val.toLowerCase()),
    );

    setData(filteredUsers);
  };

  const tableHead = ["id", "profile", "Name", "joining_date", "fees_amount"];

  const HandleApi = async () => {
    const { data } = await axios.get(`${Endpoint}/users_info`);

    // setUSersInfo(data);
    setData(data.reverse());
  };

  useEffect(() => {
    HandleApi();
  }, []);

  return (
    <>
      <div className="paymenthistoryy_main">
        {datefilter && (
          <div className="Paymenthistory_datefilter">
            <DateFilter data={data} setDateFilter={setDateFilter} setData={setData} HandleApi={HandleApi}/>
          </div>
        )}
        <div className="paymenthistoryy_head">
          <p>Payment History</p>
          <div className="paymenthistory_searchbox">
            <div className="paymenthistory_srch">
              <FilterListIcon
                className="paymenthistory_filtricon"
                onClick={() => setDateFilter(true)}
              />
              <SearchIcon
                sx={{ fontSize: "20px" }}
                className="paymenthistory_searchicon"
              />

              <input
                type="search"
                className="paymenthistory_input"
                placeholder="search"
                onChange={(e) => HandleInput(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="paymenthistoryy_table">
          <Table
            data={data}
            tableHead={tableHead}
            setUserprofilepopup={setUserprofilepopup}
            setProfileData={setProfileData}
          />
        </div>
      </div>

      {/* {Userprofilepopup && (
        <Userprofilepop
          setUserprofilepopup={setUserprofilepopup}
          userProfile_object={profileData}
        />
      )} */}
    </>
  );
};

export default Paymenthistory;
