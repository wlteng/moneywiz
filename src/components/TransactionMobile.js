import React from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaTags } from 'react-icons/fa';

const TransactionMobile = ({
  groupedTransactions = {},
  categoryList = [],
  handleMonthChange,
  handleCurrencyChange,
  handleCategoryChange,
  uniqueMonths = [],
  uniqueCurrencies = []
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
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.convertedAmount), 0).toFixed(2);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-month">
            <FaCalendarAlt />
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
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-currency">
            <FaMoneyBillWave />
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
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-category">
            <FaTags />
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
      </div>

      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <div key={date}>
          <h2 className="mt-4 mb-3 ps-3" style={{ fontSize: '1.5rem' }}>
            {date}
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
                          {categoryList.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}
                        </h3>
                        <div>
                          <Badge 
                            bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
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
    </div>
  );
};

export default TransactionMobile;