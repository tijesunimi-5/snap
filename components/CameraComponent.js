"use client";

import { useRef, useState, useEffect } from "react";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recorderChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    //Request access to the camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
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
      <button onClick={takePhoto}>Take Photo</button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photo && <img src={photo} alt="captured" />}

      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      {videoUrl && <video src={videoUrl} controls style={{ width: '100%'}} />}
    </div>
  );
};

export default CameraComponent;
