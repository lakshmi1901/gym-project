import React from "react";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

const Inputfield = (place,typea,icon ) => {
  return (
    <>
      <EmailIcon className="icon" />
      <input type={typea} placeholder={place} />
    </>
  );
};

export default Inputfield;
