import React, { useState, useRef, useEffect } from "react";
import "./newregister.css";
import { useNavigate } from "react-router-dom";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import axios from "axios";
import { Endpoint } from "../../../Common/Api/Endpoint";

const calculateExpiredDate = (joiningDate, membershipDuration) => {
  if (!joiningDate) return "";

  const [year, month, day] = joiningDate.split("-").map(Number);
  if (!year || !month || !day) return "";

  const duration = String(membershipDuration || "").trim().split(/\s+/);
  const amount = Number(duration[0]);
  const unit = String(duration[1] || "").toLowerCase();

  if (!Number.isFinite(amount) || amount < 1) return "";

  let date;

  if (unit.startsWith("month")) {
    const targetMonth = month - 1 + amount;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(
      Date.UTC(targetYear, normalizedMonth + 1, 0),
    ).getUTCDate();
    date = new Date(
      Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay)),
    );
  } else if (unit.startsWith("year")) {
    const targetYear = year + amount;
    const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
    date = new Date(
      Date.UTC(targetYear, month - 1, Math.min(day, lastDay)),
    );
  } else {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const Newregister = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const defaultObj = {
    id: "",
    checked: false,
    profile: "",
    Name: "",
    Age: "",
    Gender: "Male",
    Phone_Number: "",
    Location: "",
    joining_date: "",
    fees_amount: "4600",
    expired_within: "28 days",
    expired: "",
    payment: "cash",
    Membership_duration: "1 month",
    trainer: "trainer",
  };

  const [data, setData] = useState(defaultObj);
  const [cameraOpen, setCameraOpen] = useState(false);

  const HandleForm = (name, value) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "joining_date" || name === "Membership_duration") {
        updated.expired = calculateExpiredDate(
          updated.joining_date,
          updated.Membership_duration,
        );
      }

      return updated;
    });
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera is not supported. Use localhost or HTTPS.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera access denied. Please allow camera permission.");
    }
  };

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.error("Video play error:", error);
    });
  }, [cameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) {
      alert("Camera is not ready. Please try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    HandleForm("profile", imageData);
    stopCamera();
  };

  const handlePhotoButton = () => {
    if (cameraOpen) {
      capturePhoto();
    } else {
      openCamera();
    }
  };

  const HandleRegister = async (e) => {
    e.preventDefault();

    if (!data.profile) {
      alert("Please take the user's photo before registering.");
      return;
    }

    const expired = calculateExpiredDate(
      data.joining_date,
      data.Membership_duration,
    );
    if (!expired) {
      alert("Please enter a valid joining date and membership duration.");
      return;
    }

    try {
      await axios.post(`${Endpoint}/users_info`, {
        ...data,
        expired,
      });

      alert("User registered successfully!");

      setData({ ...defaultObj });
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to add user");
    }
  };

  
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="newregister_main">
      <p className="newregister_head">
        <b>Registration form</b>
      </p>

      <div className="newreg_boxx">
        <div className="newreg_boxxa"></div>

        <form className="newregister_form" onSubmit={HandleRegister}>
          <div className="newregister_back">
            <button
              type="button"
              className="back"
              onClick={() =>
                navigate("/TemporaryDrawer/dashboard_main/expire3days")
              }
            >
              → back
            </button>
          </div>

          <input
            type="text"
            className="inppppput"
            name="Name"
            required
            value={data.Name}
            maxLength={20}
            placeholder="Name"
            onChange={(e) => HandleForm(e.target.name, e.target.value)}
          />
          <br />

          <input
            type="text"
            inputMode="numeric"
            className="inppppput"
            name="Age"
            required
            placeholder="Age"
            maxLength={2}
            value={data.Age}
            onChange={(e) => {
              const value = e.target.value;

              if (/^\d{0,2}$/.test(value)) {
                HandleForm("Age", value);
              }
            }}
          />
          <br />

          <select
            className="inppppput inp_gender"
            name="Gender"
            value={data.Gender}
            onChange={(e) => HandleForm(e.target.name, e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            type="date"
            required
            className="inppppput"
            name="joining_date"
            value={data.joining_date}
            onChange={(e) => HandleForm(e.target.name, e.target.value)}
          />
          <br />

          <input
            type="text"
            placeholder="Enter city name"
            className="inppppput"
            name="Location"
            required
            value={data.Location}
            onChange={(e) => HandleForm(e.target.name, e.target.value)}
          />
          <br />

          <input
            type="tel"
            inputMode="numeric"
            placeholder="Contact number"
            className="inppppput"
            name="Phone_Number"
            required
            maxLength={10}
            value={data.Phone_Number}
            onChange={(e) => {
              const value = e.target.value;

              if (/^\d{0,10}$/.test(value)) {
                HandleForm("Phone_Number", value);
              }
            }}
          />
          <br />

          <select
            className="inppppput inp_gender"
            name="Membership_duration"
            value={data.Membership_duration}
            onChange={(e) => HandleForm(e.target.name, e.target.value)}
          >
            <option value="1 month">1 month</option>
            <option value="3 month">3 month</option>
            <option value="6 month">6 month</option>
            <option value="1 year">1 year</option>
          </select>

          
            <input
              type="radio"
              name="trainer"
              className="train"
              required
              value={data.trainer}
              onChange={(e) => HandleForm(e.target.name, e.target.value)}
            />
            <label htmlFor="" className="trainnnn">
              trainer
            </label>

            <input
              type="radio"
              name="trainer"
              required
              value={data.trainer}
              className="train"
              onChange={(e) => HandleForm(e.target.name, e.target.value)}
            />
            <label htmlFor="" className="trainnnn">
              personal trainer
            </label>
          

          <br />

          <label className="Paymentttttt">Payment Method:</label>

          <select
            id="payment"
            className="inppppput inp_payment"
            name="payment"
            value={data.payment}
            onChange={(e) => HandleForm(e.target.name, e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="google pay">Online</option>
          </select>

          <button type="submit" className="register_btn">
            Register
          </button>
        </form>
      </div>

      
      <div className="register_photo">
        <div className="photo_main">
          {cameraOpen ? (
            <video
              ref={videoRef}
              className="camera_view"
              autoPlay
              playsInline
              muted
            />
          ) : data.profile ? (
            <img
              src={data.profile}
              alt="Captured user"
              className="camera_view"
            />
          ) : (
            <CameraAltIcon className="camera_icon" sx={{ fontSize: 37 }} />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <button
          type="button"
          className="photo_button"
          onClick={handlePhotoButton}
        >
          {cameraOpen
            ? "Capture Photo"
            : data.profile
              ? "Retake Photo"
              : "Take Photo"}
        </button>

        {cameraOpen && (
          <button type="button" className="photo_button Cancel_Camera_btn" onClick={stopCamera}>
            Cancel Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default Newregister;
