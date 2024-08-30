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
  userCategories,  // Added this prop
  setSelectedCategory,  // Added this prop
   userPaymentMethods, // Add this line
  amountInputRef,
  handleAmountChange,
  handleCurrencyChange,
  handlePaymentMethodChange,
  handleSubmit,
  setDescription,
  setReceipt,
  setProductImage,
  currencyList
}) => {
  const getPaymentMethodTag = (method) => {
    if (!method || !method.type) {
      return 'Unknown';
    }

    switch (method.type) {
      case 'Cash':
        return 'Cash';
      case 'Credit Card':
      case 'Debit Card':
        return method.details && method.details.bank && method.details.last4
          ? `${method.details.bank}-${method.details.last4}`
          : `${method.type}`;
      case 'E-Wallet':
        return method.details && method.details.name
          ? `${method.type}: ${method.details.name}`
          : `${method.type}`;
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

  return (
    <Container className="mt-4 pb-5" style={{ maxWidth: '100%' }}>
      <h2 className="mb-4">
        {selectedCategory ? selectedCategory.name : 'Select a Category'}
      </h2>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          value={selectedCategory ? selectedCategory.id : ''}
          onChange={(e) => {
            const category = userCategories.find(cat => cat.id === e.target.value);
            setSelectedCategory(category);
          }}
        >
          <option value="">Select a category</option>
          {userCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form onSubmit={handleSubmit}>
        <div className="mb-4">
          <InputGroup>
            <DropdownButton
              as={InputGroup.Prepend}
              variant="outline-secondary"
              title={fromCurrency}
              id="input-group-dropdown-1"
            >
              {currencyList.map((currency) => (
                <Dropdown.Item key={currency.code} onClick={() => handleCurrencyChange(currency.code)}>
                  {currency.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
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
              {getPaymentMethodTag(paymentMethod)}
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
          {userPaymentMethods.map((method, index) => (
            <Col key={index} xs={6} className="mb-2">
              <Button
                variant={getPaymentMethodBadgeColor(method.type)}
                onClick={() => handlePaymentMethodChange(method)}
                className="w-100"
              >
                {getPaymentMethodTag(method)}
              </Button>
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