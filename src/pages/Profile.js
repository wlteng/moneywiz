import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || '');
      } else {
        setUser(null);
        setDisplayName('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Logged in successfully');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date()
      });
      setSuccess('Registered successfully');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signOut(auth);  // Ensure the user is logged out first
        const result = await signInWithPopup(auth, provider);
        await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            displayName: result.user.displayName,
            createdAt: new Date()
        }, { merge: true });
        setSuccess('Logged in with Google successfully');
    } catch (error) {
        setError(error.message);
    }
};

 const handleLogout = async () => {
    try {
        await signOut(auth);
        setSuccess('Logged out successfully');
        setUser(null); // Clear the user state
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

  return (
    <Container className="mt-4">
      <h2>Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {user ? (
        <div>
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
        </div>
      ) : (
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button variant="primary" onClick={handleLogin} className="me-2">Login</Button>
          <Button variant="secondary" onClick={handleRegister} className="me-2">Register</Button>
          <Button variant="info" onClick={handleGoogleLogin}>Login with Google</Button>
        </Form>
      )}
    </Container>
  );
};

export default Profile;