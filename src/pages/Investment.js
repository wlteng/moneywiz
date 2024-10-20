import React, { useState, useEffect } from 'react';
import { Container, Button, Dropdown, Modal, Badge, Alert } from 'react-bootstrap';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import InvestmentForm from '../components/InvestmentForm';
import { FaChartLine, FaPlus, FaSort, FaFilter, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

const Investment = () => {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterType, setFilterType] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const fetchInvestments = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in");
        setError("Please log in to view investments.");
        setLoading(false);
        return;
      }

      console.log("Fetching investments for user:", user.uid);
      const q = query(
        collection(db, 'investments'), 
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      console.log("Executing Firestore query");
      const querySnapshot = await getDocs(q);
      console.log("Query executed, processing results");

      const fetchedInvestments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const parsedDate = data.date ? new Date(data.date) : null;
        return { 
          id: doc.id, 
          ...data,
          date: parsedDate instanceof Date && !isNaN(parsedDate) ? parsedDate : new Date(),
        };
      });

      console.log("Processed investments:", fetchedInvestments.length);
      setInvestments(fetchedInvestments);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching investments:", err);
      setError("Failed to fetch investments. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleAddInvestment = async (newInvestment) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'investments'), { ...newInvestment, userId: user.uid });
        setShowForm(false);
        fetchInvestments();
      } else {
        setError("Please log in to add an investment.");
      }
    } catch (error) {
      console.error("Error adding investment:", error);
      setError("Failed to add investment. Please try again.");
    }
  };

  const getStatusBadge = (investment) => {
    if (!investment.soldAmount) {
      return <Badge bg="warning">Ongoing</Badge>;
    }
    if (investment.profit > 0) {
      return <Badge bg="success">Completed +</Badge>;
    }
    return <Badge bg="danger">Completed -</Badge>;
  };

  const sortedAndFilteredInvestments = investments
    .filter(inv => 
      (!filterCurrency || inv.currency === filterCurrency) &&
      (!filterPlatform || inv.platform === filterPlatform) &&
      (!filterType || inv.type === filterType)
    )
    .sort((a, b) => {
      if (sortBy === 'amount') {
        return b.totalAmount - a.totalAmount;
      } else {
        return b.date - a.date;
      }
    });

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
    <Container fluid={isMobile} className={isMobile ? 'px-0' : ''}>
      <style>
        {`
          .dropdown-toggle::after {
            display: none;
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
          .amount-qty {
            font-size: 0.8rem;
            color: grey;
            margin-top: -5px;
          }
        `}
      </style>
      <div className={`d-flex justify-content-between align-items-center mt-2 ${isMobile ? 'px-2' : ''}`}>
        <h2>Investments</h2>
        <div>
          <Button variant="primary" onClick={() => setShowForm(true)} className="me-2">
            <FaPlus /> Create
          </Button>
          <Button variant="info" onClick={() => navigate('/report/investments')}>
            <FaChartLine />
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <p className={isMobile ? 'px-3' : ''}>Loading investments...</p>
      ) : (
        <>
          <div className={`d-flex justify-content-end ${isMobile ? '' : ''}`}>
            <Dropdown className="me-2">
              <Dropdown.Toggle as={CustomToggle} id="dropdown-sort">
                <FaSort />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortBy('date')}>Date</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy('amount')}>Amount</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="me-2">
              <Dropdown.Toggle as={CustomToggle} id="dropdown-currency">
                <FaDollarSign />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterCurrency('')}>All Currencies</Dropdown.Item>
                {[...new Set(investments.map(inv => inv.currency))].map(currency => (
                  <Dropdown.Item key={currency} onClick={() => setFilterCurrency(currency)}>{currency}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="me-2">
              <Dropdown.Toggle as={CustomToggle} id="dropdown-platform">
                <FaFilter />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterPlatform('')}>All Platforms</Dropdown.Item>
                {[...new Set(investments.map(inv => inv.platform))].map(platform => (
                  <Dropdown.Item key={platform} onClick={() => setFilterPlatform(platform)}>{platform}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle as={CustomToggle} id="dropdown-type">
                <FaCalendarAlt />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterType('')}>All Types</Dropdown.Item>
                {[...new Set(investments.map(inv => inv.type))].map(type => (
                  <Dropdown.Item key={type} onClick={() => setFilterType(type)}>{type}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {sortedAndFilteredInvestments.length > 0 ? (
            <div>
              {sortedAndFilteredInvestments.map((investment, index) => (
                <div 
                  key={investment.id} 
                  onClick={() => navigate(`/investments/${investment.id}`)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '5px', 
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                  }}
                  className={isMobile ? 'px-2' : ''}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center">
                        <div className="me-3 text-center">
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{investment.date.getDate()}</div>
                          <div style={{ fontSize: '0.8rem' }}>{investment.date.toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                            {investment.title}
                          </h3>
                          <div>
                          <span >{getStatusBadge(investment)}</span>
                            <span className="ms-2">{investment.platform}</span>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="amount-display">
                      <div className="amount-input">
                        {investment.totalAmount.toFixed(2)}
                        <span style={{ fontSize: '0.8rem', marginLeft: '2px' }}>{investment.currency}</span>
                      </div>
                      <div className="amount-qty">
                        Qty: {investment.quantity} ({(investment.totalAmount / investment.quantity).toFixed(2)})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={isMobile ? 'px-3' : ''}>No investments found. Add your first investment!</p>
          )}
        </>
      )}

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Investment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InvestmentForm onSubmit={handleAddInvestment} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Investment;