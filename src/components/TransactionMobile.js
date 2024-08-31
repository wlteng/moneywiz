import React from 'react';
import { Badge, Dropdown, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaTags, FaCreditCard, FaRedo, FaFileAlt, FaImage } from 'react-icons/fa';

const TransactionMobile = ({
  groupedTransactions,
  userCategories,
  uniqueMonths,
  uniqueCurrencies,
  uniquePaymentMethods,
  filterMonth,
  filterCurrency,
  filterCategory,
  filterPaymentMethod,
  handleMonthChange,
  handleCurrencyChange,
  handleCategoryChange,
  handlePaymentMethodChange,
  handleShowPaymentDetails,
  showPaymentModal,
  handleClosePaymentModal,
  selectedPayment,
  resetFilters
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
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  const getMonthlyTotal = (transactions) => {
    return transactions.reduce((total, t) => total + parseFloat(t.convertedAmount), 0).toFixed(2);
  };

  return (
    <div>
      <div className="d-flex justify-content-end align-items-center mb-3">
        <Button variant="outline-secondary" onClick={resetFilters} className="me-2">
          <FaRedo />
        </Button>
        <Dropdown className="me-2">
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-month">
            <FaCalendarAlt />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleMonthChange('')}>All months</Dropdown.Item>
            {uniqueMonths.map((month, index) => (
              <Dropdown.Item key={index} onClick={() => handleMonthChange(month)}>{month}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown className="me-2">
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-currency">
            <FaMoneyBillWave />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleCurrencyChange('')}>All currencies</Dropdown.Item>
            {uniqueCurrencies.map((currency, index) => (
              <Dropdown.Item key={index} onClick={() => handleCurrencyChange(currency)}>{currency}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown className="me-2">
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-category">
            <FaTags />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleCategoryChange('')}>All categories</Dropdown.Item>
            {userCategories.map((category) => (
              <Dropdown.Item key={category.id} onClick={() => handleCategoryChange(category.id)}>{category.name}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-payment">
            <FaCreditCard />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handlePaymentMethodChange('')}>All methods</Dropdown.Item>
            {uniquePaymentMethods.map((method, index) => (
              <Dropdown.Item key={index} onClick={() => handlePaymentMethodChange(method)}>{method}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
        <div key={monthYear}>
          <h2 className="mt-4 mb-3 ps-3" style={{ fontSize: '1.5rem' }}>
            {monthYear}
            <span className="float-end">
              Total: {getMonthlyTotal(transactions)} {localStorage.getItem('mainCurrency')}
            </span>
          </h2>
          {transactions.map((transaction, index) => {
            const { day, month } = formatDate(transaction.date);
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
                        <div style={{ fontSize: '0.8rem' }}>{month}</div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                          {userCategories.find(cat => cat.id === transaction.categoryId)?.name}
                          {transaction.description && <FaFileAlt className="ms-2" />}
                          {(transaction.receipt || transaction.productImage) && <FaImage className="ms-2" />}
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
                          <small className="text-muted ms-2">
                            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
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

      <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Method Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <p><strong>Type:</strong> {selectedPayment.type}</p>
              {selectedPayment.type === 'Cash' && (
                <p><strong>Currency:</strong> {selectedPayment.currency}</p>
              )}
              {selectedPayment.type === 'E-Wallet' && (
                <p><strong>Name:</strong> {selectedPayment.details.name}</p>
              )}
              {(selectedPayment.type === 'Credit Card' || selectedPayment.type === 'Debit Card') && (
                <>
                  <p><strong>Bank:</strong> {selectedPayment.details.bank}</p>
                  <p><strong>Last 4 digits:</strong> {selectedPayment.details.last4}</p>
                  {selectedPayment.type === 'Credit Card' && (
                    <p><strong>Card Name:</strong> {selectedPayment.details.name}</p>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TransactionMobile;