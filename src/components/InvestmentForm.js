import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { investmentTypes, investmentStyles, unitOptions, currencyList } from '../data/General';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const InvestmentForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Share');
  const [platform, setPlatform] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('unit');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [style, setStyle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [userPlatforms, setUserPlatforms] = useState([]);

  useEffect(() => {
    const fetchUserPlatforms = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserPlatforms(userData.investmentPlatforms || []);
        }
      }
    };

    fetchUserPlatforms();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    const unitPrice = totalAmount / quantity;
    onSubmit({
      title,
      type,
      platform,
      date: timestamp,
      quantity: parseFloat(quantity),
      unit,
      totalAmount: parseFloat(totalAmount),
      currency,
      unitPrice,
      style
    });
  };

  const filteredUnitOptions = unitOptions.filter(option => option !== 'share');

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
              {investmentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Investment Platform</Form.Label>
            <Form.Select value={platform} onChange={(e) => setPlatform(e.target.value)} required>
              <option value="">Select platform</option>
              {userPlatforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)} required>
              {filteredUnitOptions.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Buying Amount</Form.Label>
            <Form.Control type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Currency</Form.Label>
            <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
              <option value="">Select currency</option>
              {currencyList.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Unit Price</Form.Label>
        <Form.Control type="text" value={quantity && totalAmount ? (totalAmount / quantity).toFixed(2) : ''} disabled />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Investment Style</Form.Label>
        <Form.Select value={style} onChange={(e) => setStyle(e.target.value)} required>
          <option value="">Select style</option>
          {investmentStyles.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {style && (
        <Form.Group className="mb-3">
          <Form.Label>Style Description</Form.Label>
          <Form.Control as="textarea" rows={3} value={investmentStyles.find(s => s.value === style)?.description || ''} disabled />
        </Form.Group>
      )}

      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
};

export default InvestmentForm;