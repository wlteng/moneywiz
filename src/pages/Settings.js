import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    showTransactions: true,
    showDebts: true,
    showInvestments: true,
    usePasswordForTransactions: false,
    usePasswordForDebts: false,
    usePasswordForInvestments: false,
    quickInputEnabled: false,  // New setting for quick input
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserSettings(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserSettings = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSettings(userData.settings || settings);
      }
    } catch (err) {
      setError('Failed to fetch user settings');
    }
  };

  const handleSettingChange = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const saveSettings = async () => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { settings });
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), { 
        featurePassword: password // Note: In a real app, you should hash this password
      });
      setSuccess('Password set successfully');
      setShowPasswordModal(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to set password');
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError('Failed to send password reset email');
    }
  };

  if (!user) {
    return <Container>Please log in to access settings.</Container>;
  }

  return (
    <Container className="mt-4">
      <h2>Settings</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="show-transactions"
            label="Show Transactions"
            checked={settings.showTransactions}
            onChange={() => handleSettingChange('showTransactions')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="show-debts"
            label="Show Debts"
            checked={settings.showDebts}
            onChange={() => handleSettingChange('showDebts')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="show-investments"
            label="Show Investments"
            checked={settings.showInvestments}
            onChange={() => handleSettingChange('showInvestments')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="password-transactions"
            label="Require Password for Transactions"
            checked={settings.usePasswordForTransactions}
            onChange={() => handleSettingChange('usePasswordForTransactions')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="password-debts"
            label="Require Password for Debts"
            checked={settings.usePasswordForDebts}
            onChange={() => handleSettingChange('usePasswordForDebts')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="password-investments"
            label="Require Password for Investments"
            checked={settings.usePasswordForInvestments}
            onChange={() => handleSettingChange('usePasswordForInvestments')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="quick-input"
            label="Enable Quick Input"
            checked={settings.quickInputEnabled}
            onChange={() => handleSettingChange('quickInputEnabled')}
          />
        </Form.Group>
        <Button variant="primary" onClick={saveSettings} className="me-2">Save Settings</Button>
        <Button variant="secondary" onClick={() => setShowPasswordModal(true)} className="me-2">Set Feature Password</Button>
        <Button variant="link" onClick={handleForgotPassword}>Forgot Password?</Button>
      </Form>

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Feature Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSetPassword}>Set Password</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Settings;