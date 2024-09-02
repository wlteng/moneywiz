import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || '');
      } else {
        setUser(null);
        setDisplayName('');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSuccess('Logged out successfully');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  if (!user) {
    return <Container className="mt-5"><p>Please log in to view your profile.</p></Container>;
  }

  return (
    <Container className="mt-5">
      <h2>Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <p>Email: {user.email}</p>
      {isEditing ? (
        <Form.Group className="mb-3">
          <Form.Label>Display Name</Form.Label>
          <Form.Control 
            type="text" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Form.Group>
      ) : (
        <p>Display Name: {user.displayName || 'Not set'}</p>
      )}
      {isEditing ? (
        <Button variant="primary" onClick={handleUpdateProfile}>Save Changes</Button>
      ) : (
        <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
      )}
      <Button variant="danger" onClick={handleLogout} className="ms-2">Logout</Button>
    </Container>
  );
};

export default Profile;