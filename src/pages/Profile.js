import React, { useState } from "react";
import styled from "styled-components";

const initialProfile = {
  name: "Ritesh Kumar",
  email: "ritesh@example.com",
  phone: "+91 9876543210",
};

const sampleReviews = [
  {
    id: 1,
    reviewer: "Priya",
    rating: 5,
    comment: "Great driver! Very punctual and friendly.",
  },
  {
    id: 2,
    reviewer: "Amit",
    rating: 4,
    comment: "Comfortable ride but started a bit late.",
  },
];

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const toggleEdit = () => {
    if (editing) {
      setProfile(formData); // save changes on toggle off
    }
    setEditing(!editing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container>
      <Title>My Profile</Title>

      <ProfileSection>
        <SectionTitle>Personal Information</SectionTitle>

        <FieldGroup>
          <FieldLabel>Name:</FieldLabel>
          {editing ? (
            <FieldInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          ) : (
            <FieldText>{profile.name}</FieldText>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Email:</FieldLabel>
          {editing ? (
            <FieldInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          ) : (
            <FieldText>{profile.email}</FieldText>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Phone:</FieldLabel>
          {editing ? (
            <FieldInput
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          ) : (
            <FieldText>{profile.phone}</FieldText>
          )}
        </FieldGroup>

        <EditButton onClick={toggleEdit}>{editing ? "Save" : "Edit"}</EditButton>
      </ProfileSection>

      <ReviewsSection>
        <SectionTitle>Reviews Received</SectionTitle>
        {sampleReviews.length === 0 ? (
          <NoReviews>No reviews received yet.</NoReviews>
        ) : (
          <ReviewsList>
            {sampleReviews.map((review) => (
              <ReviewCard key={review.id}>
                <Reviewer>{review.reviewer}</Reviewer>
                <Rating>Rating: {review.rating} / 5</Rating>
                <Comment>{review.comment}</Comment>
              </ReviewCard>
            ))}
          </ReviewsList>
        )}
      </ReviewsSection>
    </Container>
  );
};

const Container = styled.div`
  max-width: 650px;
  margin: 40px auto;
  background: white;
  padding: 40px 35px;
  border-radius: 12px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.15);
  font-family: "Poppins", sans-serif;
`;

const Title = styled.h1`
  font-weight: 900;
  font-size: 3rem;
  color: #1e90ff;
  margin-bottom: 45px;
  text-align: center;
`;

const ProfileSection = styled.section``;

const SectionTitle = styled.h2`
  font-weight: 700;
  font-size: 1.8rem;
  color: #005bbb;
  margin-bottom: 25px;
`;

const FieldGroup = styled.div`
  margin-bottom: 22px;
`;

const FieldLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  font-size: 1.1rem;
`;

const FieldText = styled.p`
  font-size: 1.2rem;
  color: #444;
  margin: 0;
  padding: 8px 12px;
  background-color: #f6faff;
  border-radius: 8px;
`;

const FieldInput = styled.input`
  width: 100%;
  font-size: 1.2rem;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #bbb;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 8px #a2c5ffaa;
  }
`;

const EditButton = styled.button`
  background-color: #1e90ff;
  color: white;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.15rem;
  padding: 14px 30px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #005bbb;
  }
`;

const ReviewsSection = styled.section`
  margin-top: 55px;
`;

const NoReviews = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: #777;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ReviewCard = styled.div`
  padding: 22px 25px;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  background-color: #f3f9ff;
`;

const Reviewer = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #005bbb;
  margin-bottom: 6px;
`;

const Rating = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
`;

const Comment = styled.div`
  font-size: 1.05rem;
  color: #333;
  line-height: 1.5;
`;

export default Profile;
