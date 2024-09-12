import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const CreditCardList = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [ownedCards, setOwnedCards] = useState([]);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCreditCards = async () => {
      const querySnapshot = await getDocs(collection(db, 'creditCards'));
      const cards = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCreditCards(cards);
      setFilteredCards(cards);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setOwnedCards(userData?.ownedCards || []);
        }
      }
    };

    fetchCreditCards();
  }, [user]);

  useEffect(() => {
    const filtered = creditCards.filter(card => 
      card.cardName.toLowerCase().includes(filter.toLowerCase()) ||
      card.bank.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [filter, creditCards]);

  const handleOwnership = async (e, cardId) => {
    e.stopPropagation();
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    if (ownedCards.includes(cardId)) {
      await updateDoc(userRef, {
        ownedCards: arrayRemove(cardId)
      });
      setOwnedCards(ownedCards.filter(id => id !== cardId));
    } else {
      await updateDoc(userRef, {
        ownedCards: arrayUnion(cardId)
      });
      setOwnedCards([...ownedCards, cardId]);
    }
  };

  const renderCard = (card) => (
    <Col key={card.id} md={4} className="mb-4">
      <Card>
        <Card.Img 
          variant="top" 
          src={card.cardImage} 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/credit-cards/${card.id}`)}
        />
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title 
              as={Link} 
              to={`/credit-cards/${card.id}`} 
              style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
              {card.cardName}
            </Card.Title>
            {user && (
              <Button 
                variant={ownedCards.includes(card.id) ? "success" : "outline-success"} 
                onClick={(e) => handleOwnership(e, card.id)}
                size="sm"
              >
                {ownedCards.includes(card.id) ? "Owned" : "I Have This"}
              </Button>
            )}
          </div>
          <Card.Subtitle className="mb-2 text-muted">{card.bank}</Card.Subtitle>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </Button>
        <h2>Credit Cards</h2>
        <div style={{ width: '80px' }}></div> {/* Placeholder for alignment */}
      </div>
      <Form.Group className="mb-3">
        <Form.Control 
          type="text" 
          placeholder="Filter by card name or bank" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Form.Group>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="all" title="All Cards">
          <Row>
            {filteredCards.map(card => renderCard(card))}
          </Row>
        </Tab>
        <Tab eventKey="owned" title={<span>My Cards <Badge bg="secondary">{ownedCards.length}</Badge></span>}>
          <Row>
            {filteredCards.filter(card => ownedCards.includes(card.id)).map(card => renderCard(card))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CreditCardList;