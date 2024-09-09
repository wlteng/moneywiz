import React from 'react';
import { Badge, Dropdown, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaTags, FaCreditCard, FaRedo, FaFileAlt, FaImage } from 'react-icons/fa';
import { getCurrencyDecimals } from '../data/General';

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
  resetFilters,
  mainCurrency,
  getMonthlyTotal
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
      year: date.getFullYear(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  };

  const formatAmount = (amount, currency) => {
    const decimals = getCurrencyDecimals(currency);
    return parseFloat(amount).toFixed(decimals);
  };

  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod || !paymentMethod.type) return 'Unknown';
    const { type, details } = paymentMethod;
    switch (type.toLowerCase()) {
      case 'cash':
        return 'Cash';
      case 'e-wallet':
        return details?.name || 'E-Wallet';
      case 'credit card':
      case 'debit card':
        return `${details.bank}-${details?.last4 || 'XXXX'}`;
      default:
        return type;
    }
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      variant="link"
      style={{ color: '#0d6efd', border: 'none', padding: '0.375rem 0.75rem', fontSize: '1.5rem' }}
    >
      {children}
    </Button>
  ));

  return (
    <div>
      <style>
        {`
          .dropdown-toggle::after {
            display: none;
          }
          .form-control::placeholder {
            color: transparent;
          }
          .amount-display {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .amount-input {
            font-size: 1.5rem;
            font-weight: bold;
            text-align: right;
            border: none;
            background-color: transparent;
            padding: 0;
            margin: 0;
          }
          .amount-converted {
            font-size: 0.8rem;
            color: grey;
            margin-top: -5px;
          }
        `}
      </style>
      <div className="d-flex justify-content-end align-items-center mb-1">
        <Button variant="link" onClick={resetFilters} className="me-2" style={{ color: '#0d6efd', border: 'none', fontSize: '1.5rem' }}>
          <FaRedo />
        </Button>
        <Dropdown className="me-2">
          <Dropdown.Toggle as={CustomToggle} id="dropdown-month">
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
          <Dropdown.Toggle as={CustomToggle} id="dropdown-currency">
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
          <Dropdown.Toggle as={CustomToggle} id="dropdown-category">
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
          <Dropdown.Toggle as={CustomToggle} id="dropdown-payment">
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

      {Object.entries(groupedTransactions).map(([monthYear, transactions]) => {
        const [month, year] = monthYear.split(' ');
        return (
          <div key={monthYear}>
            <h2 className=" mb-3 ps-3" style={{ fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{month.substring(0, 3)} {year}</span>
              <span>{formatAmount(getMonthlyTotal(transactions), mainCurrency)} {mainCurrency}</span>
            </h2>
            {transactions.map((transaction, index) => {
              const { day, month, time } = formatDate(transaction.date);
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
                            <Badge bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}>
                              {getPaymentMethodDisplay(transaction.paymentMethod)}
                            </Badge>
                            <small className="text-muted ms-2">
                              {time}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="amount-display">
                      <div className="amount-input">
                        {formatAmount(transaction.amount, transaction.fromCurrency)}
                        <span style={{ fontSize: '0.8rem', marginLeft: '2px' }}>{transaction.fromCurrency}</span>
                      </div>
                      <div className="amount-converted">
                        {formatAmount(transaction.convertedAmount, mainCurrency)} {mainCurrency}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TransactionMobile;