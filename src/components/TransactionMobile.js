import React from 'react';
import { Badge, Dropdown, Row, Col, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaFileAlt } from 'react-icons/fa';

const TransactionMobile = ({
  groupedTransactions,
  categoryList,
  handleMonthChange,
  handleCurrencyChange,
  handleCategoryChange,
  handlePaymentMethodChange,
  uniqueMonths,
  uniqueCurrencies,
  uniquePaymentMethods,
  showModal,
  showPaymentModal,
  handleCloseModal,
  handleClosePaymentModal,
  selectedTransaction,
  selectedPayment,
  handleShowDescription,
  handleShowPaymentDetails
}) => {
  const navigate = useNavigate();

  const getPaymentMethodBadgeColor = (type) => {
    if (!type) return 'secondary';
    switch (type.toLowerCase()) {
      case 'e-wallet': return 'primary';
      case 'debit card': return 'success';
      case 'credit card': return 'danger';
      case 'cash': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      year: date.getFullYear()
    };
  };

  const getMonthlyTotal = (transactions) => {
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.convertedAmount), 0).toFixed(2);
  };

  return (
    <div>
      <Row className="mb-3">
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-month" className="w-100">
              Period
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleMonthChange('')}>All months</Dropdown.Item>
              {uniqueMonths.map((month, index) => (
                <Dropdown.Item key={index} onClick={() => handleMonthChange(month)}>
                  {month}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-currency" className="w-100">
              Currency
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleCurrencyChange('')}>All currencies</Dropdown.Item>
              {uniqueCurrencies.map((currency, index) => (
                <Dropdown.Item key={index} onClick={() => handleCurrencyChange(currency)}>
                  {currency}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-category" className="w-100">
              Category
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleCategoryChange('')}>All categories</Dropdown.Item>
              {categoryList.map((category, index) => (
                <Dropdown.Item key={index} onClick={() => handleCategoryChange(category.id)}>
                  {category.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-payment" className="w-100">
              Payment
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handlePaymentMethodChange('')}>All methods</Dropdown.Item>
              {uniquePaymentMethods.map((method, index) => (
                <Dropdown.Item key={index} onClick={() => handlePaymentMethodChange(method)}>
                  {method}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <div key={date}>
          <h2 className="mt-4 mb-3 ps-3" style={{ fontSize: '1.5rem' }}>
            {date.split(' ')[0]} {date.split(' ')[1]} {localStorage.getItem('mainCurrency')}{getMonthlyTotal(transactions)}
          </h2>
          {transactions.map((transaction, index) => {
            const { day, time } = formatDate(transaction.date);
            return (
              <div 
                key={transaction.id} 
                onClick={() => navigate(`/transaction/${transaction.id}`)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '10px', 
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="d-flex align-items-center">
                      <div className="me-3 text-center">
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{day}</div>
                        <div style={{ fontSize: '0.8rem' }}>{time}</div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                          {categoryList.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}
                        </h3>
                        <div>
                          <Badge 
                            bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowPaymentDetails(transaction.paymentMethod);
                            }}
                          >
                            {transaction.paymentMethod.type}
                          </Badge>
                          <span className="ms-2" onClick={(e) => {
                            e.stopPropagation();
                            handleShowDescription(transaction);
                          }}>
                            {transaction.productImage ? <FaImage /> : transaction.description ? <FaFileAlt /> : null}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div>{parseFloat(transaction.amount).toFixed(2)} {transaction.fromCurrency}</div>
                    <div>{parseFloat(transaction.convertedAmount).toFixed(2)} {transaction.toCurrency}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Body>{selectedTransaction?.description || 'No description available'}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered>
        <Modal.Body>
          <h5>Payment Details</h5>
          <p>Type: {selectedPayment?.type}</p>
          {selectedPayment?.type === 'Cash' && (
            <p>Currency: {selectedPayment?.currency}</p>
          )}
          {selectedPayment?.type === 'E-Wallet' && (
            <p>Name: {selectedPayment?.name}</p>
          )}
          {(selectedPayment?.type === 'Credit Card' || selectedPayment?.type === 'Debit Card') && (
            <>
              <p>Card: **** **** **** {selectedPayment?.last4}</p>
              <p>Bank: {selectedPayment?.bank}</p>
              {selectedPayment?.type === 'Credit Card' && <p>Card Name: {selectedPayment?.name}</p>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePaymentModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransactionMobile;