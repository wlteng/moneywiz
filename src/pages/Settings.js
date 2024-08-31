import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    showTransactions: true,
    showDebts: true,
    showInvestments: true,
    usePasswordForTransactions: false,
    usePasswordForDebts: false,
    usePasswordForInvestments: false,
    useThumbprint: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
            id="use-thumbprint"
            label="Use Thumbprint Authentication"
            checked={settings.useThumbprint}
            onChange={() => handleSettingChange('useThumbprint')}
          />
        </Form.Group>
        <Button variant="primary" onClick={saveSettings}>Save Settings</Button>
      </Form>
    </Container>
  );
};

export default Settings;