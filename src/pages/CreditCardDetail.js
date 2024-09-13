import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, ListGroup, Spinner, Button, Row, Col, Accordion, Modal, Form, Badge } from 'react-bootstrap';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const CreditCardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [shops, setShops] = useState({});
  const [selectedShop, setSelectedShop] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [applicableShops, setApplicableShops] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const docRef = doc(db, 'creditCards', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cardData = { id: docSnap.id, ...docSnap.data() };
          setCard(cardData);
          return cardData;
        } else {
          console.log("No such document!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching card details:", error);
        return null;
      }
    };

    const fetchShops = async () => {
      const shopsSnapshot = await getDocs(collection(db, 'shops'));
      const shopsData = {};
      const categoriesSet = new Set(['All']);
      shopsSnapshot.forEach(doc => {
        const shopData = doc.data();
        shopsData[doc.id] = { id: doc.id, ...shopData };
        if (shopData.category) {
          categoriesSet.add(shopData.category);
        }
      });
      setShops(shopsData);
      setCategories(Array.from(categoriesSet));
      return shopsData;
    };

    const initializeData = async () => {
      const [cardData, shopsData] = await Promise.all([fetchCardDetails(), fetchShops()]);
      if (cardData && cardData.benefits) {
        const allApplicableShopIds = new Set();
        cardData.benefits.forEach(benefit => {
          if (benefit.merchantType === 'specificShops' && benefit.specificShops) {
            benefit.specificShops.forEach(shop => allApplicableShopIds.add(shop.value));
          }
        });
        const applicableShopsData = Array.from(allApplicableShopIds)
          .map(shopId => shopsData[shopId])
          .filter(shop => shop !== undefined);
        setApplicableShops(applicableShopsData);
      }
      setLoading(false);
    };

    initializeData();
  }, [id]);

  if (loading) {
    return <Container className="d-flex justify-content-center mt-5"><Spinner animation="border" /></Container>;
  }

  if (!card) {
    return <Container className="mt-5"><h2>Credit card not found</h2></Container>;
  }

  const renderMerchantType = (benefit) => {
    switch (benefit.merchantType) {
      case 'allSpending':
        return 'All kind of spending';
      case 'anyLocal':
        return 'Any Local Shops';
      case 'anyOverseas':
        return 'Any Overseas Shops';
      case 'supermarketsAndStores':
        return 'Supermarkets & Stores';
      case 'insurance':
        return 'Insurance';
      case 'petrol':
        return 'Petrol';
      case 'specificShops':
        if (benefit.specificShops && benefit.specificShops.length > 0) {
          return (
            <div>
              Specific Shops:
              <ul>
                {benefit.specificShops.map(shop => (
                  <li key={shop.value}>{shop.label}</li>
                ))}
              </ul>
            </div>
          );
        }
        return 'Specific Shops';
      default:
        return 'Unknown';
    }
  };

  const handleShopClick = (shop) => {
    const shopBenefits = card.benefits.filter(benefit => 
      benefit.merchantType === 'specificShops' && 
      benefit.specificShops && 
      benefit.specificShops.some(specificShop => specificShop.value === shop.id)
    );
    setSelectedShop({ ...shop, benefits: shopBenefits });
    setShowShopModal(true);
  };

  const filteredShops = filterCategory === 'All' 
    ? applicableShops
    : applicableShops.filter(shop => shop.category === filterCategory);

  const renderBenefitInfo = (benefit) => {
    return (
      <>
        {benefit.description && <p><strong>Description:</strong> {benefit.description}</p>}
        {benefit.rules && <p><strong>Rules:</strong> {benefit.rules}</p>}
        {benefit.rebatePercentage && <p><strong>Rebate Percentage:</strong> {benefit.rebatePercentage}%</p>}
        {benefit.rebatePoint && <p><strong>Rebate Point:</strong> {benefit.rebatePoint}</p>}
        {benefit.numberOfTimes && <p><strong>Number of Times:</strong> {benefit.numberOfTimes}</p>}
        <p><strong>Merchant Type:</strong> {renderMerchantType(benefit)}</p>
      </>
    );
  };


  return (
    <Container className="mt-5 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </Button>
        <h2>{card.bank}</h2>
        <div>
          {(userRole === 'admin' || userRole === 'bankstaff') && (
            <Button 
              variant="outline-secondary" 
              className="me-2" 
              onClick={() => navigate(`/credit-cards/${id}/edit`)}
            >
              <FaEdit /> Edit
            </Button>
          )}
        </div>
      </div>
      <Card>
        <Card.Img variant="top" src={card.cardImage} />
        <Card.Body>
          <Card.Text>{card.description}</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Card Name: {card.cardName}</ListGroup.Item>
          <ListGroup.Item>Type: {card.cardType?.point ? 'Points' : ''} {card.cardType?.cashRebate ? 'Cash Rebate' : ''}</ListGroup.Item>
          <ListGroup.Item>Annual Fee: {card.annualFee ? `$${card.annualFee}` : 'No annual fee'}</ListGroup.Item>
          <ListGroup.Item>Subsidiary Annual Fee: {card.subsidiaryAnnualFee ? `$${card.subsidiaryAnnualFee}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Interest Rate: {card.interestRate}% p.a.</ListGroup.Item>
          <ListGroup.Item>Minimum Monthly Payment: {card.minimumMonthlyPayment}</ListGroup.Item>
          <ListGroup.Item>Cash Withdrawal Fee: {card.cashWithdrawalFee}</ListGroup.Item>
          <ListGroup.Item>Minimum Income: ${card.yearlyIncome}</ListGroup.Item>
          <ListGroup.Item>Minimum Age: {card.minimumAge}</ListGroup.Item>
        </ListGroup>
        <Card.Body>
          <Card.Link href={card.redemptionWebpage} target="_blank">Redemption Page</Card.Link>
        </Card.Body>
      </Card>

      <h3 className="mt-4 mb-3">Benefits</h3>
      <Accordion>
        {card.benefits && card.benefits.map((benefit, index) => (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header>{benefit.name || `Benefit ${index + 1}`}</Accordion.Header>
            <Accordion.Body>
              {renderBenefitInfo(benefit)}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h3 className="mb-0">Shops</h3>
        <Form.Group style={{ width: '200px' }}>
          <Form.Select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <Row>
        {filteredShops.map((shop) => (
          <Col key={shop.id} xs={4} className="mb-3">
            <div className="text-center" onClick={() => handleShopClick(shop)} style={{ cursor: 'pointer' }}>
              <div 
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundImage: `url(${shop.logo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto'
                }}
              />
              <p className="mt-2">{shop.name}</p>
            </div>
          </Col>
        ))}
      </Row>

      <Modal show={showShopModal} onHide={() => setShowShopModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>{selectedShop?.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="text-center mb-3">
                  <img 
                    src={selectedShop?.logo} 
                    alt={selectedShop?.name} 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1rem' }} 
                  />
                  <div>
                    <Badge bg="primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      {selectedShop?.category}
                    </Badge>
                  </div>
                  {selectedShop?.description && (
                    <p className="mt-2">{selectedShop.description}</p>
                  )}
                </div>
                <div 
                  className="p-3 rounded" 
                  style={{ 
                    background: 'linear-gradient(to right, rgba(173, 216, 230, 0.7), rgba(135, 206, 235, 0.7))'
                  }}
                >
                  {selectedShop?.benefits.map((benefit, index) => (
                    <div key={index} className="mt-3 text-left">
                      <h5 className="text-center mb-3">{benefit.name}</h5>
                      {renderBenefitInfo(benefit)}
                    </div>
                  ))}
                </div>
              </Modal.Body>
            </Modal>
          </Container>
        );
      };

      export default CreditCardDetail;