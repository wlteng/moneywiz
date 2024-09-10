import React from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import { IoMdMove } from 'react-icons/io';

const StickyHeader = ({
  paymentMethod,
  isReordering,
  toggleReordering,
  fromCurrency,
  handleCurrencyChange,
  favoriteCurrencies,
  mobileStyles,
  getPaymentMethodTag,
  handlePaymentMethodChange,
  getPaymentMethodColor,
  uniquePaymentMethods,
  isSticky
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white',
      width: '100%',
    }}>
      <Row className="align-items-center">
        <Col xs={6}>
          <div className="payment-label" style={{ fontWeight: 'bold' }}>
            {getPaymentMethodTag(paymentMethod)}
          </div>
        </Col>
        <Col xs={6} className="d-flex justify-content-end">
          <Button 
            variant="link" 
            onClick={toggleReordering}
            style={{ 
              ...mobileStyles.button, 
              width: '50px', 
              padding: '0', 
              border: 'none', 
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isReordering ? <FaSave size={24} /> : <IoMdMove size={24} />}
          </Button>
          <Form.Select 
            value={fromCurrency}
            onChange={handleCurrencyChange}
            style={{ 
              ...mobileStyles.input, 
              width: 'auto', 
              marginRight: '0' 
            }}
          >
            {favoriteCurrencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <div className="payment-methods-slider">
        {uniquePaymentMethods.map((method, index) => (
          <Button
            key={index}
            variant="outline-secondary"
            onClick={() => handlePaymentMethodChange(method)}
            className="me-2 payment-method-button"
            style={{ 
              flexShrink: 0,
              backgroundColor: getPaymentMethodColor(method.type),
              color: 'white',
            }}
          >
            {getPaymentMethodTag(method)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StickyHeader;