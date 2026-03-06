import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaIdCard, FaCheckCircle, FaSpinner, FaCloudUploadAlt, FaCamera, FaExclamationTriangle } from "react-icons/fa";
import WebcamCapture from "../components/WebcamCapture";
import { API_BASE_URL } from "../utils/config";
// Removed unused AuthContext import

/* Keyframes */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const KYCPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [files, setFiles] = useState({
        aadhaarFront: null,
        aadhaarBack: null,
        selfie: null
    });
    const [previews, setPreviews] = useState({
        aadhaarFront: null,
        aadhaarBack: null,
        selfie: null
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { status: 'verified'|'rejected', message }
    const [error, setError] = useState("");

    // Check status on mount
    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const res = await fetch(`${API_BASE_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.user?.kyc?.status === 'verified') {
                    setResult({ kyc: data.user.kyc, message: "Your identity has been verified." });
                } else if (data.user?.kyc?.status === 'pending') {
                    setResult({ kyc: data.user.kyc, message: "Your verification is pending review." });
                }
            } catch (e) {
                console.error("Failed to check status", e);
            }
        };
        checkStatus();
    }, []);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const handleSelfieCapture = (file, previewUrl) => {
        if (file) {
            setFiles(prev => ({ ...prev, selfie: file }));
            setPreviews(prev => ({ ...prev, selfie: previewUrl }));
        } else {
            // Retake
            setFiles(prev => ({ ...prev, selfie: null }));
            setPreviews(prev => ({ ...prev, selfie: null }));
        }
    };

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.append("aadhaarFront", files.aadhaarFront);
        formData.append("aadhaarBack", files.aadhaarBack);
        formData.append("selfie", files.selfie);

        try {
            const authToken = localStorage.getItem("authToken");
            const res = await fetch(`${API_BASE_URL}/api/kyc/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Upload failed");

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <Container>
                <Card>
                    <ResultIcon success={result.kyc?.status === 'verified'}>
                        {result.kyc?.status === 'verified' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    </ResultIcon>
                    <Title>
                        {result.kyc?.status === 'verified' ? "Identity Verified" : "Verification Pending/Failed"}
                    </Title>
                    <Text>
                        {result.message}
                        {result.result && result.result.score && (
                            <div style={{ marginTop: 10, fontSize: '0.9rem', color: '#666' }}>
                                Match Score: {result.result.score}%
                            </div>
                        )}
                    </Text>
                    <Button onClick={() => navigate("/home")}>
                        Continue to Home
                    </Button>
                </Card>
            </Container>
        )
    }

    return (
        <Container>
            <Card>
                <Header>
                    <Title>Verify Your Identity</Title>
                    <Text>To ensure safety, please upload your Aadhaar card and take a selfie.</Text>
                </Header>

                {error && <ErrorBanner>{error}</ErrorBanner>}

                <Steps>
                    <Step active={step === 1} onClick={() => setStep(1)}>1. Documents</Step>
                    <Step active={step === 2} onClick={() => setStep(2)}>2. Selfie</Step>
                    <Step active={step === 3} onClick={() => setStep(3)}>3. Review</Step>
                </Steps>

                <Content>
                    {step === 1 && (
                        <StepContent>
                            <UploadGroup>
                                <Label><FaIdCard /> Aadhaar Front</Label>
                                <FileInputWrapper>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhaarFront')} />
                                    {previews.aadhaarFront ? (
                                        <Preview src={previews.aadhaarFront} />
                                    ) : (
                                        <Placeholder><FaCloudUploadAlt /> Upload Front</Placeholder>
                                    )}
                                </FileInputWrapper>
                            </UploadGroup>
                            <UploadGroup>
                                <Label><FaIdCard /> Aadhaar Back</Label>
                                <FileInputWrapper>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhaarBack')} />
                                    {previews.aadhaarBack ? (
                                        <Preview src={previews.aadhaarBack} />
                                    ) : (
                                        <Placeholder><FaCloudUploadAlt /> Upload Back</Placeholder>
                                    )}
                                </FileInputWrapper>
                            </UploadGroup>
                            <Button disabled={!files.aadhaarFront || !files.aadhaarBack} onClick={() => setStep(2)}>
                                Next: Selfie
                            </Button>
                        </StepContent>
                    )}

                    {step === 2 && (
                        <StepContent>
                            <Label><FaCamera /> Take a Selfie</Label>
                            <TextSmall>Ensure your face is clearly visible and matches your ID.</TextSmall>
                            <WebcamWrapper>
                                <WebcamCapture onCapture={handleSelfieCapture} />
                            </WebcamWrapper>
                            <ButtonGroup>
                                <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
                                <Button disabled={!files.selfie} onClick={() => setStep(3)}>Next: Review</Button>
                            </ButtonGroup>
                        </StepContent>
                    )}

                    {step === 3 && (
                        <StepContent>
                            <ReviewGrid>
                                <ReviewItem>
                                    <span>Front</span>
                                    <img src={previews.aadhaarFront} alt="Front" />
                                </ReviewItem>
                                <ReviewItem>
                                    <span>Back</span>
                                    <img src={previews.aadhaarBack} alt="Back" />
                                </ReviewItem>
                                <ReviewItem>
                                    <span>Selfie</span>
                                    <img src={previews.selfie} alt="Selfie" />
                                </ReviewItem>
                            </ReviewGrid>

                            <ButtonGroup>
                                <SecondaryButton onClick={() => setStep(2)}>Back</SecondaryButton>
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? <><FaSpinner className="spin" /> Verifying...</> : "Submit & Verify"}
                                </Button>
                            </ButtonGroup>
                        </StepContent>
                    )}
                </Content>

            </Card>
        </Container>
    );
};

export default KYCPage;

/* Styles */
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 40px;
  animation: ${fadeIn} 0.5s ease-out;
  
  @media (max-width: 480px) {
    padding: 24px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.8rem;
  margin-bottom: 10px;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`;

const TextSmall = styled(Text)`
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

const Steps = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const Step = styled.div`
  padding: 10px;
  font-weight: 700;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.text.disabled};
  border-bottom: 3px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.3s;
`;

const Content = styled.div`
  min-height: 300px;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const UploadGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileInputWrapper = styled.div`
  position: relative;
  height: 150px;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.background};
  transition: border 0.3s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const Preview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.disabled};
  font-weight: 600;
  
  svg {
    font-size: 2rem;
  }
`;

const WebcamWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spin {
      animation: spin 1s linear infinite;
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const SecondaryButton = styled(Button)`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    
    &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.background};
        color: ${({ theme }) => theme.colors.primary};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
    
    & > * { flex: 1; }
`;

const ReviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
`;

const ReviewItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 600;
    
    img {
        width: 100%;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #ddd;
    }
`;

const ResultIcon = styled.div`
    font-size: 4rem;
    color: ${({ success, theme }) => success ? theme.colors.primary : '#d9534f'};
    text-align: center;
    margin-bottom: 20px;
`;

const ErrorBanner = styled.div`
  background: #ffe6e6;
  color: #d9534f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 0.9rem;
`;
