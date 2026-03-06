import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import styled from "styled-components";
import { FaCamera, FaRedo } from "react-icons/fa";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const WebcamWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  position: relative;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: ${({ theme, secondary }) => secondary ? theme.colors.glass.medium : theme.colors.primary};
  color: ${({ theme, secondary }) => secondary ? theme.colors.primary : "#fff"};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        // Convert base64 to file
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                onCapture(file, imageSrc);
            });
    }, [webcamRef, onCapture]);

    const retake = () => {
        setImage(null);
        onCapture(null, null);
    };

    return (
        <Container>
            <WebcamWrapper>
                {image ? (
                    <PreviewImg src={image} alt="Selfie preview" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                    />
                )}
            </WebcamWrapper>

            <Controls>
                {image ? (
                    <Button secondary onClick={retake}>
                        <FaRedo /> Retake
                    </Button>
                ) : (
                    <Button onClick={capture}>
                        <FaCamera /> Capture
                    </Button>
                )}
            </Controls>
        </Container>
    );
};

export default WebcamCapture;
