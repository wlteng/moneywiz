import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Home = () => {
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCategories = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserCategories(userData.categories || []);
        }
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserCategories();
      } else {
        setUserCategories([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Container className="mt-4"><h2>Loading...</h2></Container>;
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center">Choose a Category</h1>
      {userCategories.length > 0 ? (
        <Row className="mt-4">
          {userCategories.map(category => (
            <Col xs={6} className="mb-3" key={category.id}>
              <Link to={`/keyboard/${category.id}`} style={{ textDecoration: 'none' }}>
                <Button 
                  className="w-100" 
                  style={{ backgroundColor: category.color, borderColor: category.color }}
                >
                  {category.name}
                </Button>
              </Link>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center mt-4">No categories found. Please add categories in your profile.</p>
      )}
    </Container>
  );
};

export default Home;