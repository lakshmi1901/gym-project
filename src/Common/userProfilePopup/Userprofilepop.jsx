
import React, { useState, useRef, useEffect } from "react";
import "../userProfilePopup/userprofilepopup.css";
import profileimg from "../../assets/projectimg/profile.jpg";
import axios from "axios";
import { Endpoint } from "../Api/Endpoint";

const Userprofilepop = ({
  setUserprofilepopup = () => {},
  userProfile_object = {},
  HandleApi = () => {},
}) => {
  const [name, setName] = useState(userProfile_object.Name || "");
  const [age, setAge] = useState(userProfile_object.Age || "");
  const [gender, setGender] = useState(userProfile_object.Gender || "");
  const [number, setNumber] = useState(
    userProfile_object.Phone_Number || ""
  );
  const [city, setCity] = useState(userProfile_object.Location || "");

  const [profile, setProfile] = useState(
    userProfile_object.profile || ""
  );

  const [editMode, setEditMode] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Camera open aana video connect aagum
  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.log("Video play error:", error);
    });
  }, [cameraOpen]);

  // Camera stop
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  // Edit click pannumbodhu camera open aagum
  const handleEdit = async () => {
    setEditMode(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera requires localhost or HTTPS.");
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
      alert("Camera permission allow pannunga.");
    }
  };

  // Photo capture
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) {
      alert("Camera ready aagala. Try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    setProfile(imageData);
    stopCamera();
  };

  // Updated details + photo database-la save aagum
  const handleUpdate = async () => {
    try {
      const updatedData = {
        ...userProfile_object,
        Name: name,
        Age: age,
        Gender: gender,
        Phone_Number: number,
        Location: city,
        profile: profile,
      };

      await axios.put(
        `${Endpoint}/users_info/${userProfile_object.id}`,
        updatedData
      );

      alert("Profile updated successfully!");

      setEditMode(false);
      stopCamera();
      HandleApi();
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed!");
    }
  };

  // Component close/unmount aagumbodhu camera stop aagum
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="user_profile_main">
      <div className="user_profile_card">
        <p className="view_profile">View Profile</p>

        <button
          type="button"
          className="profile_back"
          onClick={() => {
            stopCamera();
            setUserprofilepopup(false);
            HandleApi();
          }}
        >
          → back
        </button>

        <div className="profile_imgg">
          {cameraOpen ? (
            <video
              ref={videoRef}
              className="profile_imgga"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <img
              src={profile || profileimg}
              alt="User profile"
              className="profile_imgga"
            />
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <input
            type="text"
            className="profile_namee"
            value={name}
            readOnly={!editMode}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {editMode && (
          <div className="profile_camera_buttons">
            {cameraOpen ? (
              <>
                <button type="button" className="Capture_Photo" onClick={capturePhoto}>
                  Capture Photo
                </button>

                <button type="button" className="Cancel_Camera"  onClick={stopCamera}>
                  Cancel Camera
                </button>
              </>
            ) : (
              <button type="button" className="Retake_Photo" onClick={handleEdit}>
                Retake Photo
              </button>
            )}
          </div>
        )}

        <div className="userprofile_info">
          <div className="userprofile_box">
            <p>Age</p>
            <input
              type="text"
              className="Userprofilepop_inputfield"
              value={age}
              readOnly={!editMode}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="userprofile_box">
            <p>Gender</p>
            <input
              type="text"
              className="Userprofilepop_inputfield"
              value={gender}
              readOnly={!editMode}
              onChange={(e) => setGender(e.target.value)}
            />
          </div>

          <div className="userprofile_box">
            <p>Contact Number</p>
            <input
              type="text"
              className="Userprofilepop_inputfield"
              value={number}
              readOnly={!editMode}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          <div className="userprofile_box boxxx">
            <p>City</p>
            <input
              type="text"
              className="Userprofilepop_inputfield"
              value={city}
              readOnly={!editMode}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div className="userprofile_gyminfo">
          <div className="userprofile_gyminfo_box">
            <p>Duration</p>
            <p>{userProfile_object.Membership_duration || "N/A"}</p>
          </div>

          <div className="userprofile_gyminfo_box">
            <p>Joining Date</p>
            <p>{userProfile_object.joining_date || "N/A"}</p>
          </div>

          <div className="userprofile_gyminfo_box">
            <p>Expired till</p>
            <p>{userProfile_object.expired_within || "N/A"}</p>
          </div>

          <div className="userprofile_gyminfo_box">
            <p>Expired Date</p>
            <p>{userProfile_object.expired || "N/A"}</p>
          </div>
        </div>

        <div className="edit_box">
          {editMode && (
            <button
              type="button"
              className="userprofile_save"
              onClick={handleUpdate}
            >
              Save
            </button>
          )}

          {!editMode && (
            <button
              type="button"
              className="userprofile_edit"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Userprofilepop;
