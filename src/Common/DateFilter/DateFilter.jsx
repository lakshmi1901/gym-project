import React, { useEffect } from "react";
import "../DateFilter/datefilterr.css";
import { useState } from "react";
import axios from "axios";

const DateFilter = ({
  setDateFilter = () => {},
  data = [],
  setData = () => {},
  HandleApi =()=>{}
}) => {
  const [dateClear, setDateClear] = useState("");
  const [dateClear_one, setDateClear_one] = useState("");

  

  // const handleClear = () => {
  //   setDateClear("");
  //   setDateClear_one("");
  // };

  const HandleDateFilter = () => {
    const filtered_arr = data.filter((val) => {
      let join_date = val["joining_date"];

      if (join_date >= dateClear && join_date <= dateClear_one) {
        return val;
      }
    });

    setData(filtered_arr);
    setDateFilter(false);
  };



  return (
    <>
      <div className="DateFilter_main">
        <div className="DateFilter_box_one">
          <div className="DateFilter_box_two">
            <p>From Date</p>
            <input
              type="date"
              value={dateClear}
              className="date_input"
              onChange={(e) => setDateClear(e.target.value)}
            />
          </div>
          <div className="DateFilter_box_two">
            <p>To Date</p>
            <input
              type="date"
              value={dateClear_one}
              className="date_input"
              onChange={(e) => setDateClear_one(e.target.value)}
            />
          </div>
          <div className="DateFilter_box_three">
            <button
              className="DateFilter_btn"
              // onClick={handleClear}
              onClick={() => {
                setDateClear("");
                setDateClear_one("");
                HandleApi()
                HandleDateFilter()
              }}
            >
              Clear
            </button>
            <button className="DateFilter_btn" onClick={HandleDateFilter}>
              Get
            </button>
            {/* <button
              className="DateFilter_btn"
              onClick={() => {
                setDateFilter(false);
              }}
            >
              Cancel
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default DateFilter;
