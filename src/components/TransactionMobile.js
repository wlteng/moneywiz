import React from 'react';
import { Container, ListGroup, Badge, Dropdown, Modal, Button } from 'react-bootstrap';
import { FaFileAlt, FaImage } from 'react-icons/fa';

const TransactionMobile = ({
  groupedTransactions,
  uniqueMonths,
  uniqueCurrencies,
  userCategories,
  filterMonth,
  filterCurrency,
  filterCategory,
  filterPaymentMethod,
  handleMonthChange,
  handleCurrencyChange,
  handleCategoryChange,
  handlePaymentMethodChange,
  handleShowPaymentDetails,
  showModal,
  showPaymentModal,
  handleCloseModal,
  handleClosePaymentModal,
  selectedTransaction,
  selectedPayment,
  getPaymentMethodBadgeColor,
  uniquePaymentMethods
}) => {
  return (
    <Container className="mt-4">
      <h2>Transactions</h2>

      <Dropdown className="mb-2">
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-month" className="w-100">
          {filterMonth || 'Period'}
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

      <Dropdown className="mb-2">
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-currency" className="w-100">
          {filterCurrency || 'Currency'}
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

      <Dropdown className="mb-2">
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-category" className="w-100">
          {filterCategory ? userCategories.find(cat => cat.id === filterCategory)?.name : 'Category'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleCategoryChange('')}>All categories</Dropdown.Item>
          {userCategories.map((category, index) => (
            <Dropdown.Item key={index} onClick={() => handleCategoryChange(category.id)}>
              {category.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown className="mb-2">
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-payment" className="w-100">
          {filterPaymentMethod || 'Payment'}
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

      {Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
        <div key={monthYear}>
          <h3 className="mt-4 mb-3">{monthYear}</h3>
          <ListGroup>
            {transactions.map((transaction) => (
              <ListGroup.Item key={transaction.id} className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-bold">{userCategories.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}</div>
                  <div>{transaction.amount} {transaction.fromCurrency}</div>
                </div>
                <small>{new Date(transaction.date).toLocaleString()}</small>
                <div className="mt-2">
                  <Badge
                    bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleShowPaymentDetails(transaction.paymentMethod)}
                  >
                    {transaction.paymentMethod.type}
                  </Badge>
                  {transaction.description && <FaFileAlt className="ms-2" />}
                  {(transaction.receipt || transaction.productImage) && <FaImage className="ms-2" />}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ))}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleString()}</p>
              <p><strong>Category:</strong> {userCategories.find(cat => cat.id === selectedTransaction.categoryId)?.name || 'N/A'}</p>
              <p><strong>Amount:</strong> {selectedTransaction.amount} {selectedTransaction.fromCurrency}</p>
              <p><strong>Description:</strong> {selectedTransaction.description || 'No description'}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <p><strong>Type:</strong> {selectedPayment.type}</p>
              {selectedPayment.type === 'Cash' && (
                <p><strong>Currency:</strong> {selectedPayment.currency}</p>
              )}
              {(selectedPayment.type === 'Credit Card' || selectedPayment.type === 'Debit Card') && (
                <>
                  <p><strong>Bank:</strong> {selectedPayment.details.bank || 'N/A'}</p>
                  <p><strong>Last 4 digits:</strong> {selectedPayment.details.last4 || 'N/A'}</p>
                </>
              )}
              {selectedPayment.type === 'E-Wallet' && (
                <p><strong>Name:</strong> {selectedPayment.details.name || 'N/A'}</p>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TransactionMobile;