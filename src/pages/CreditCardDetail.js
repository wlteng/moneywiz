import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, ListGroup, Spinner, Button } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const CreditCardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

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
          setCard({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching card details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [id]);

  if (loading) {
    return <Container className="d-flex justify-content-center mt-5"><Spinner animation="border" /></Container>;
  }

  if (!card) {
    return <Container className="mt-5"><h2>Credit card not found</h2></Container>;
  }

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
    </Container>
  );
};

export default CreditCardDetail;