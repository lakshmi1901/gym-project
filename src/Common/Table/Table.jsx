import React, { useEffect, useState } from "react";
import "./Table.css";
import dummy_img from "../../assets/projectimg/page2.png";
import profile_img from "../../assets/projectimg/profile.jpg";
import renewal_icon from "../../assets/projectimg/renawal_icon.png";
import nodata_img from "../../assets/projectimg/no-data-found.jpg";

const Table = ({
  data = [],
  setData = () => {},
  tableHead = [],
  renewal = false,
  setPopup = () => {},
  setUserprofilepopup = () => {},
  delete_icon = false,
  checkBox,
  setProfileData = () => {},
  setGetId = () => {},
  getId=[],
  setUsersObject = () => {},
  HandleDeleteUsers = () => {},
}) => {
  const HandleChechBox = (id, boxVal) => {
    const checked_arr = data.map((val) => {
      if (val.id === id) {
        return {
          ...val,
          ["checked"]: !boxVal,
        };
      } else {
        return val;
      }
    });

    setData(checked_arr);


    // const check_user_id = data.filter((val)=>{
    //   return val.checked == true
    // })

    // setGetId([...getId,id]);
    // setGetId(check_user_id);
    setGetId(id);

    // console.log(checked_arr);
  };

  return (
    <>
      <div className="table_con">
        <table className="expire3days_table">
          <thead className="expire3days_thead">
            <tr>
              {delete_icon && <th>Actions</th>}
              <th>S.No</th>

              {tableHead.map((val, ind) => {
                return (
                  <>
                    {val == "id" || val == "checked" ? (
                      <></>
                    ) : (
                      <>
                        <th key={ind}>{val}</th>
                      </>
                    )}
                  </>
                );
              })}
              {renewal ? <th>Renewal</th> : ""}
            </tr>
          </thead>
          <tbody className="expire3days_tbody">
            {data.length > 0 ? (
              data.map((users, ind) => (
                <tr key={users.id}>
                  {delete_icon && (
                    <td>
                      <input
                        type="checkbox"
                        checked={users.checked}
                        className="table_checkbox"
                        onChange={() => {
                          HandleChechBox(users.id, users.checked);
                          // HandleDeleteUsers();
                        }}
                      />
                    </td>
                  )}

                  <td>{++ind}</td>

                  {Object.keys(users).map((val) => {
                    return (
                      <>
                        {val != "id" &&
                          tableHead.includes(val) &&
                          val != "checked" &&
                          (val.toLocaleLowerCase() == "profile" ? (
                            <>
                              <td key={ind}>
                                <img
                                  src={users[val] || profile_img}
                                  alt=""
                                  height={"50px"}
                                  onClick={() => {
                                    setUserprofilepopup(true);
                                    setProfileData(users);
                                  }}
                                  className="user_register_image"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td> {users[val]}</td>
                            </>
                          ))}
                      </>
                    );
                  })}

                  {renewal ? (
                    <td>
                      <img
                        src={renewal_icon}
                        alt=""
                        height={"40px"}
                        onClick={() => {
                          setPopup(true);
                          setUsersObject(users);
                          // users={users}
                        }}
                      />
                    </td>
                  ) : (
                    ""
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="no_data_container">
                    <img
                      src={nodata_img}
                      alt=""
                      height={"100px"}
                      width={"200px"}
                      className="nodata_image"
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
