import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { getStoredRates, getApiRates, saveRatesToFirestore, compareRates } from '../services/conversionService';
import { currencyList } from '../data/General';

const ConversionRate = () => {
  const [storedRates, setStoredRates] = useState(null);
  const [apiRates, setApiRates] = useState(null);
  const [comparisons, setComparisons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRates = async () => {
    setLoading(true);
    setError('');
    try {
      const stored = await getStoredRates();
      const api = await getApiRates();
      setStoredRates(stored);
      setApiRates(api);
      if (stored && api) {
        setComparisons(compareRates(stored.rates, api.rates));
      }
    } catch (err) {
      setError('Failed to fetch rates');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSave = async () => {
    try {
      await saveRatesToFirestore(apiRates.rates, apiRates.lastUpdated);
      setStoredRates(apiRates);
      setSuccess('Rates saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save rates');
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Conversion Rate</h2>
        <div>
          <Button variant="secondary" onClick={fetchRates} className="me-2">Refresh</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {storedRates && (
        <p>Stored rates updated: {storedRates.lastUpdated.toLocaleString()}</p>
      )}
      {apiRates && (
        <p>API rates updated: {apiRates.lastUpdated.toLocaleString()}</p>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            
            <th>Code</th>
            <th>Stored Rate</th>
            <th>API Rate</th>
            <th>(%)</th>
          </tr>
        </thead>
        <tbody>
          {currencyList.map((currency) => {
            const code = currency.code === 'RMB' ? 'CNY' : currency.code;
            return (
              <tr key={code}>
                
                <td>{code}</td>
                <td>{storedRates?.rates[code] || 'N/A'}</td>
                <td>{apiRates?.rates[code] || 'N/A'}</td>
                <td>{comparisons[code] ? `${comparisons[code]}%` : 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default ConversionRate;