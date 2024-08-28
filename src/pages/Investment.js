import React, { useState, useEffect } from 'react';
import { Container, Button, Dropdown, Modal, Badge } from 'react-bootstrap';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import InvestmentForm from '../components/InvestmentForm';
import { FaChartLine, FaPlus, FaSort, FaFilter, FaDollarSign, FaCalendarAlt, FaCoins, FaChartArea, FaBox, FaPiggyBank, FaQuestionCircle } from 'react-icons/fa';

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

  const fetchInvestments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'investments'));
      const fetchedInvestments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const parsedDate = data.date ? new Date(data.date) : null;

        return { 
          id: doc.id, 
          ...data,
          date: parsedDate instanceof Date && !isNaN(parsedDate) ? parsedDate : new Date(),
        };
      });
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
      await addDoc(collection(db, 'investments'), newInvestment);
      setShowForm(false);
      fetchInvestments();
    } catch (error) {
      console.error("Error adding investment:", error);
      alert("Failed to add investment. Please try again.");
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

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'share':
        return <FaChartArea />;
      case 'crypto':
        return <FaCoins />;
      case 'commodity':
        return <FaBox />;
      case 'pension':
        return <FaPiggyBank />;
      default:
        return <FaQuestionCircle />;
    }
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

  if (loading) return <Container><p>Loading investments...</p></Container>;
  if (error) return <Container><p>{error}</p></Container>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
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

      <div className="d-flex justify-content-end mb-3">
        <Dropdown className="me-2">
          <Dropdown.Toggle variant="outline-secondary">
            <FaSort />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSortBy('date')}>Date</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('amount')}>Amount</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown className="me-2">
          <Dropdown.Toggle variant="outline-secondary">
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
          <Dropdown.Toggle variant="outline-secondary">
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
          <Dropdown.Toggle variant="outline-secondary">
            <FaCalendarAlt />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setFilterType('')}>All Types</Dropdown.Item>
            {[...new Set(investments.map(inv => inv.type))].map(type => (
              <Dropdown.Item key={type} onClick={() => setFilterType(type)}>
                {getTypeIcon(type)} {type}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div>
        {sortedAndFilteredInvestments.map((investment, index) => (
          <div 
            key={investment.id} 
            onClick={() => navigate(`/investments/${investment.id}`)}
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
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{investment.date.getDate()}</div>
                    <div style={{ fontSize: '0.8rem' }}>{investment.date.toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                      {investment.title}
                    </h3>
                    <div>
                      <span>{investment.platform}</span>
                      <span className="ms-2">{getStatusBadge(investment)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-end">
                <div>{investment.totalAmount.toFixed(2)} <small>{investment.currency}</small></div>
                <div>Qty: {investment.quantity} ({(investment.totalAmount / investment.quantity).toFixed(2)})</div>
              </div>
            </div>
          </div>
        ))}
      </div>

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