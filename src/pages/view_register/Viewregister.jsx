import React, { useEffect, useState } from "react";
import Table from "../../Common/Table/Table";
import "../view_register/viewregister.css";
import { view_register } from "./viewregisterjs";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import Userprofilepop from "../../Common/userProfilePopup/Userprofilepop";
import Popup from "../../Common/popupcard/Popup";
import DateFilter from "../../Common/DateFilter/DateFilter";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { Endpoint } from "../../Common/Api/Endpoint";

const Viewregister = () => {
  const [Userprofilepopup, setUserprofilepopup] = useState(false);
  const [popup, setPopup] = useState(false);
  const [popup1, setPopup1] = useState(false);
  const [delete_icon, setDeleteicon] = useState(false);
  const [checkBox, setcheckBox] = useState(false);
  const [datefilter, setDateFilter] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [usersInfo, setUSersInfo] = useState([]);
  const [data_1, setData] = useState([]);

  const [checkedUSers, setCheckedUsers] = useState([]);
  

  const [getId, setGetId] = useState([]);

  const HandleCheck = () => {
    setcheckBox(!checkBox);
    const check_array = data_1.map((val) => {
      return {
        ...val,
        checked: !checkBox,
      };
    });
    setData(check_array);
  };

  const HandleInput = (val) => {
    const filteredUsers = usersInfo.filter(
      (user) =>
        user.Name.toLowerCase().includes(val.toLowerCase()) ||
        user.Age.includes(val) ||
        user.Gender.toLowerCase().includes(val.toLowerCase()) ||
        user.Phone_Number.toLowerCase().includes(val.toLowerCase()) ||
        user.Location.toLowerCase().includes(val.toLowerCase()),
    );

    setData(filteredUsers);
  };


  const handleSure = () => {
    onConfirm();
    setPopup(false);
    setDuration(true);
    onClick();
  };

  const HandleApi = async () => {
    const { data } = await axios.get(`${Endpoint}/users_info`);

    setUSersInfo(data);
    setData(data.reverse());
  };

  const HandleDelete = async (a) => {
    try {
      const filterCheckedUsers = data_1.filter(
        (checked_user) => checked_user.checked == true,
      );

      filterCheckedUsers.forEach(async (val) => {
       

        await axios.delete(`${Endpoint}/users_info/${val.id}`);
      });

      HandleApi()

    } catch (error) {
      console.log(error);
    }
    HandleApi();
  };

  useEffect(() => {
    HandleApi();
  }, []);

  const HandleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("View Registered Users", 14, 20);
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated Date: ${currentDate}`, 14, 28);

    const tableData = data_1.map((user, index) => [
      index + 1,
      user.Name,
      user.Age,
      user.Gender,
      user.Phone_Number,
      user.Location,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["S.No", "Name", "Age", "Gender", "Phone_Number", "Location"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fontSize: 10,
        fontStyle: "bold",
      },
    });
    doc.save("view_registered_users.pdf");
  };

  const tableHead = [
    "id",
    "profile",
    "Name",
    "Age",
    "Gender",
    "Phone_Number",
    "Location",
  ];

  return (
    <>
      <div className="viewregister_main">
        <div className="viewregister_headcontent">
          <div className="viewregister_conta">
            <p>View Registered</p>
          </div>
          <div className="viewregister_contb">
            <div className="viewregister_contc">
              <input
                type="search"
                className="viewregister_inputt"
                placeholder="search"
                onChange={(e) => HandleInput(e.target.value)}
              />
              <SearchIcon className="viewregister_search" />
            </div>
            <div className="viewregister_contd">
              {delete_icon && (
                <div>
                  <input
                    type="checkbox"
                    checked={checkBox}
                    className="delete_checkbox"
                    onChange={HandleCheck}
                  />
                </div>
              )}
              <DeleteIcon
                sx={{ color: "red" }}
                className="delete_icon"
                onClick={() => {
                  setDeleteicon(true);
                  if (delete_icon) {
                    setPopup1(true);
                  }
                }}
              />
              <FileDownloadIcon
                sx={{ fontSize: 25 }}
                className="download_icon"
                onClick={() => setPopup(true)}
              />
            </div>
          </div>
        </div>
        <div className="viewregister_tableee">
          <Table
            data={data_1}
            setData={setData}
            tableHead={tableHead}
            setUserprofilepopup={setUserprofilepopup}
            delete_icon={delete_icon}
            checkBox={checkBox}
            setProfileData={setProfileData}
            getId={getId}
            setGetId={setGetId}
            
          />
        </div>
      </div>
      {Userprofilepopup && (
        <Userprofilepop
          setUserprofilepopup={setUserprofilepopup}
          userProfile_object={profileData}
          HandleApi={HandleApi}
        />
      )}
      {popup && (
        <Popup
          popHead1="Are you sure you want to Download?"
          confirmBtn="sure"
          setPopup={setPopup}
          onConfirm={HandleDownloadPDF}
        />
      )}
      {popup1 && (

        <div className="popup_main">
          <div className="popup_card">
            <div className="popup_content">
              <div className="popup_div">
                <p className="popup_contenta">
                  Are you sure you want to Delete?
                </p>
              </div>
              <button
                className="popup_sure"
                onClick={() => {
                  HandleDelete(getId);
                  setPopup1(false);
                }}
              >
                Sure
              </button>

              <button
                className="popup_cancel"
                onClick={() => {
                  setPopup1(false);
                }}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Viewregister;
