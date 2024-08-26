import React from 'react';
import { Container, Form, Button, InputGroup, DropdownButton, Dropdown, Row, Col, Badge } from 'react-bootstrap';

const KeyboardR = ({
  amount,
  convertedAmount,
  paymentMethod,
  description,
  receipt,
  productImage,
  fromCurrency,
  toCurrency,
  date,
  time,
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
  paymentTypes,
  creditCards,
  debitCards,
  wallets,
  currencyList
}) => {
  const getPaymentMethodTag = (method) => {
    if (!method || !method.type) {
      return '';
    }

    if (method.type === 'Cash') {
      return `cash-${method.currency || fromCurrency}`;
    } else if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return `${method.bank}-${method.last4}`;
    } else {
      return `${method.type.toLowerCase().replace(' ', '')}-${method.bank || method.currency || fromCurrency}`;
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

  return (
    <Container className="mt-4 pb-5" style={{ maxWidth: '100%' }}>
      <h2 className="mb-4">{selectedCategory.name}</h2>
      
      <div className="overflow-auto" style={{ whiteSpace: 'nowrap', height: '60px' }}>
        {recentPaymentMethods.map((method, index) => (
          <Button 
            key={index} 
            variant={getPaymentMethodBadgeColor(method.type)}
            style={{ margin: '0 5px 0 0', cursor: 'pointer', color: '#fff' }}
            onClick={() => handlePaymentMethodChange(method)}
          >
            {getPaymentMethodTag(method)}
          </Button>
        ))}
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="mb-4">
          <InputGroup>
            <InputGroup.Text>{fromCurrency}</InputGroup.Text>
            <Form.Control
              type="text"
              value={amount}
              onChange={handleAmountChange}
              ref={amountInputRef}
              style={{ zIndex: 1, height: 'auto' }}
            />
            <Button
              variant={getPaymentMethodBadgeColor(paymentMethod.type)}
              disabled
            >
              {paymentMethod.type === 'Cash' ? `${paymentMethod.type}-${fromCurrency}` : `${paymentMethod.type}: ${paymentMethod.last4}`}
            </Button>
          </InputGroup>
          <small>Converted: {convertedAmount || '0.00'} {toCurrency}</small>
        </div>

        <Row className="mb-4">
          <Col xs={6} className="pe-1">
            <Form.Control 
              type="date" 
              value={date} 
              readOnly
              style={{ height: '38px' }}
            />
          </Col>
          <Col xs={6} className="ps-1">
            <Form.Control 
              type="time" 
              value={time} 
              readOnly
              style={{ height: '38px' }}
            />
          </Col>
        </Row>

        <div className="mb-4">
          <Row>
            {paymentTypes.map((type, index) => (
              <Col key={index} xs={6} className="mb-2">
                <DropdownButton
                  variant={getPaymentMethodBadgeColor(type)}
                  title={type}
                  id={`payment-dropdown-${index}`}
                  className="w-100"
                >
                  {type === 'Cash' && (
                    <Dropdown.Item onClick={() => handlePaymentMethodChange({ type: 'Cash' })}>
                      Cash
                    </Dropdown.Item>
                  )}
                  {type === 'Credit Card' && creditCards.map((card, cardIndex) => (
                    <Dropdown.Item key={cardIndex} onClick={() => handlePaymentMethodChange({...card, type: 'Credit Card'})}>
                      {card.bank} - {card.last4}
                    </Dropdown.Item>
                  ))}
                  {type === 'Debit Card' && debitCards.map((card, cardIndex) => (
                    <Dropdown.Item key={cardIndex} onClick={() => handlePaymentMethodChange({...card, type: 'Debit Card'})}>
                      {card.bank} - {card.last4}
                    </Dropdown.Item>
                  ))}
                  {type === 'E-Wallet' && wallets.map((wallet, walletIndex) => (
                    <Dropdown.Item key={walletIndex} onClick={() => handlePaymentMethodChange({...wallet, type: 'E-Wallet'})}>
                      {wallet.name} ({wallet.country})
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </Col>
            ))}
          </Row>
        </div>

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