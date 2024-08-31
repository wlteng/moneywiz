import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, InputGroup, Dropdown, Row, Col } from 'react-bootstrap';

const KeyboardR = ({
  amount,
  convertedAmount,
  paymentMethod,
  description,
  receipt,
  productImage,
  fromCurrency,
  toCurrency,
  showSuccess,
  recentPaymentMethods,
  selectedCategory,
  amountInputRef,
  handleAmountChange,
  handleCurrencyChange,
  handlePaymentMethodChange,
  handleSubmit,
  setDescription,
  setReceipt,
  setProductImage,
  currencyList,
  userPaymentMethods
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const paymentMethodsRef = useRef(null);

  const getPaymentMethodTag = (method) => {
    if (!method || !method.type) return 'Unknown';

    switch (method.type) {
      case 'Cash':
        return 'Cash';
      case 'Credit Card':
        return `credit-${method.details.last4}`;
      case 'Debit Card':
        return `debit-${method.details.last4}`;
      case 'E-Wallet':
        return method.details.name;
      default:
        return `${method.type}`;
    }
  };

  const getPaymentMethodBadgeColor = (type) => {
    switch (type) {
      case 'E-Wallet':
        return 'primary';
      case 'Debit Card':
        return 'success';
      case 'Credit Card':
        return 'danger';
      case 'Cash':
      default:
        return 'secondary';
    }
  };

  // Combine and deduplicate payment methods
  const uniquePaymentMethods = [
    { type: 'Cash', details: {} },
    ...Array.from(new Set([...recentPaymentMethods, ...userPaymentMethods].map(JSON.stringify)))
      .map(JSON.parse)
      .filter(method => method.type !== 'Cash')
  ];

  return (
    <Container className="mt-4 pb-5" style={{ maxWidth: '100%' }}>
      <h2 className="mb-2">{selectedCategory ? selectedCategory.name : 'Select a Category'}</h2>

      <div className="mb-3 payment-methods-slider" style={{
        display: 'flex',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: '10px 0',
      }}>
        {uniquePaymentMethods.map((method, index) => (
          <Button
            key={index}
            variant={getPaymentMethodBadgeColor(method.type)}
            onClick={() => handlePaymentMethodChange(method)}
            className="me-2"
            style={{ flexShrink: 0 }}
          >
            {getPaymentMethodTag(method)}
          </Button>
        ))}
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="mb-4">
          <InputGroup>
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-secondary" 
                id="dropdown-currency"
                style={{ borderColor: '#ced4da' }}  // Match the border color with the end element
              >
                {fromCurrency}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {currencyList.map((currency) => (
                  <Dropdown.Item key={currency.code} onClick={() => handleCurrencyChange(currency.code)}>
                    {currency.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Form.Control
              type="text"
              value={amount}
              onChange={handleAmountChange}
              ref={amountInputRef}
              style={{ zIndex: 1, height: 'auto' }}
            />
            <InputGroup.Text>
              {getPaymentMethodTag(paymentMethod)}
            </InputGroup.Text>
          </InputGroup>
          <small>Converted: {convertedAmount || '0.00'} {toCurrency}</small>
        </div>

        <Row className="mb-4">
          <Col xs={6} className="pe-1">
            <Form.Control 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ height: '38px' }}
            />
          </Col>
          <Col xs={6} className="ps-1">
            <Form.Control 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ height: '38px' }}
            />
          </Col>
        </Row>

        <div className="mb-4">
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </div>

        <div className="mb-4">
          <Form.Group>
            <Form.Label>Receipt</Form.Label>
            <Form.Control type="file" onChange={(e) => setReceipt(e.target.files[0])} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Product Image</Form.Label>
            <Form.Control type="file" onChange={(e) => setProductImage(e.target.files[0])} />
          </Form.Group>
        </div>

        <Button variant="primary" type="submit">Submit</Button>
      </Form>

      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1050,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          textAlign: 'center',
        }}>
          Transaction saved successfully!
        </div>
      )}
    </Container>
  );
};

export default KeyboardR;