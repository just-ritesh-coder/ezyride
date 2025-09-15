import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', vehicle: '', preferences: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  // Fetch user profile data from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load profile.');
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          vehicle: data.vehicle || '',
          preferences: data.preferences || '',
        });
      } catch (err) {
        setError(err.message || 'Error fetching profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated profile to backend
  const saveProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update profile.');
      const updated = await res.json();
      setProfile(updated);
      setFormData({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone || '',
        vehicle: updated.vehicle || '',
        preferences: updated.preferences || '',
      });
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container><Title>My Profile</Title><Loading>Loading your profile...</Loading></Container>;
  if (error) return <Container><Title>My Profile</Title><ErrorMsg>{error}</ErrorMsg></Container>;
  if (!profile) return <Container><Title>My Profile</Title><NoProfile>Profile data unavailable</NoProfile></Container>;

  return (
    <Container>
      <Title>My Profile</Title>

      <ProfileSection>
        <SectionTitle>Personal Information</SectionTitle>

        <FieldGroup>
          <FieldLabel>Name:</FieldLabel>
          {editing ? (
            <FieldInput type="text" name="name" value={formData.name} onChange={handleChange} />
          ) : (
            <FieldText>{profile.name || '-'}</FieldText>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Email:</FieldLabel>
          {editing ? (
            <FieldInput type="email" name="email" value={formData.email} onChange={handleChange} />
          ) : (
            <FieldText>{profile.email || '-'}</FieldText>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Phone:</FieldLabel>
          {editing ? (
            <FieldInput type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          ) : (
            <FieldText>{profile.phone || '-'}</FieldText>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Vehicle:</FieldLabel>
          {editing ? (
            <FieldInput type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} />
          ) : (
            <FieldText>{profile.vehicle || '-'}</FieldText>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Preferences:</FieldLabel>
          {editing ? (
            <FieldInput type="text" name="preferences" value={formData.preferences} onChange={handleChange} />
          ) : (
            <FieldText>{profile.preferences || '-'}</FieldText>
          )}
        </FieldGroup>

        <EditButton onClick={editing ? saveProfile : () => setEditing(true)}>
          {editing ? 'Save' : 'Edit'}
        </EditButton>
      </ProfileSection>
    </Container>
  );
};

// Styled Components

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

const Loading = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: #777;
  margin-top: 40px;
`;

const ErrorMsg = styled.p`
  text-align: center;
  font-weight: 600;
  color: #d9534f;
  margin-top: 40px;
`;

const NoProfile = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: #777;
  margin-top: 40px;
`;

const ProfileSection = styled.section`
  margin-bottom: 40px;
`;

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

export default Profile;
