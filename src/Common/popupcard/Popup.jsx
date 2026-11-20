import React from "react";
import "../popupcard/popupp.css";

const Popup = ({
  popHead1 = "",
  confirmBtn = "",
  setPopup = () => {},
  onClick = () => {},
  onConfirm = () => {},
  setDuration = () => {},
}) => {

  const handleSure = () => {

    onConfirm();
    setPopup(false);
    setDuration(true);
    onClick();
  };


  return (
    <>
      <div className="popup_main">
        <div className="popup_card">
          <div className="popup_content">
            <div className="popup_div">
              <p className="popup_contenta">
                {popHead1}
              </p>
            </div>
            <button
              className="popup_sure"
              onClick={handleSure}>
              {confirmBtn}
            </button>
          
            <button
              className="popup_cancel"
              onClick={() => {
                setPopup(false);
              }}>
              cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;