"use client";

import { useRef, useState, useEffect } from "react";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recorderChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    const videoConstraints = {
      width: { ideal: 1280 }, // Adjust resolution width (ideal or exact value)
      height: { ideal: 720 }, // Adjust resolution height (ideal or exact value)
      frameRate: { ideal: 30 }, // Adjust frame rate for smoother video
    };

    //Request access to the camera
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints })
      .then((currentStream) => {
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera:", err);
        setError("Could not access the camera");
      });

    //Clean up the stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const takePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setPhoto(canvasRef.current.toDataURL("image/jpeg"));
    }
  };

  const uploadImage = async () => {
    if (!photo) return;

    setUploadStatus("Uploading...");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: photo }),
      });

      if (response.ok) {
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading the image:", error);
      setUploadStatus("Upload failed.");
    }
  };

  const startRecording = () => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    mediaRecorder.start();
    setRecorder(mediaRecorder);
  };

  const stopRecording = () => {
    recorder.stop();
    recorder.onstop = () => {
      const blob = new Blob(recordChunks, { type: "video/webm" });
      setVideoUrl(url);
      setRecordedChunks([]);
    };
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
      <button onClick={takePhoto} className="mr-10">
        Take Photo
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photo && (
        <>
          <img src={photo} alt="captured" style={{ width: "100%" }} />
          <button>Upload Photo</button>
        </>
      )}

      {uploadStatus && <p>{uploadStatus}</p>}

      <button onClick={startRecording} className="mr-10">
        Start Recording
      </button>
      <button onClick={stopRecording}>Stop Recording</button>
      {videoUrl && <video src={videoUrl} controls style={{ width: "100%" }} />}
    </div>
  );
};

export default CameraComponent;
