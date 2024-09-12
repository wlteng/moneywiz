import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { banks } from '../data/General';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Select from 'react-select';
import { useParams, useNavigate } from 'react-router-dom';

const CreditCardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cardDetails, setCardDetails] = useState({
    bank: '',
    cardName: '',
    cardImage: null,
    description: '',
    cardType: {
      point: false,
      cashRebate: false
    },
    pointName: '',
    newApplicationCashRebate: '',
    redemptionWebpage: '',
    annualFee: '',
    subsidiaryAnnualFee: '',
    annualFeeFreeFirstYear: false,
    interestRate: '',
    cashOutCharge: '',
    easyPaymentPlan: '',
    balanceTransfer: '',
    lateChargesFee: '',
    minimumMonthlyPayment: '',
    cashWithdrawalFee: '',
    yearlyIncome: '',
    minimumAge: ''
  });

  const [benefits, setBenefits] = useState([]);
  const [shops, setShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const docRef = doc(db, 'creditCards', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCardDetails(data);
          setBenefits(data.benefits || []);
          setShops(data.shops || []);
        } else {
          setSubmitError("Credit card not found");
        }
      } catch (error) {
        setSubmitError("Error fetching credit card details: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchShops = async () => {
      // Implement fetching of shops from Firestore
      // This should populate the allShops state similar to CreditCardForm
    };

    fetchCardDetails();
    fetchShops();
  }, [id]);

  const handleCardDetailsChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setCardDetails(prevDetails => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const handleCardTypeChange = (e) => {
    const { name, checked } = e.target;
    setCardDetails(prevDetails => ({
      ...prevDetails,
      cardType: {
        ...prevDetails.cardType,
        [name]: checked
      }
    }));
  };

  const handleBenefitChange = (index, field, value) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index] = { ...updatedBenefits[index], [field]: value };
    setBenefits(updatedBenefits);
  };

  const addBenefit = () => {
    setBenefits([...benefits, { name: '', description: '', rebatePercentage: '', rebatePoint: '', relatedShops: [] }]);
  };

  const removeBenefit = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(updatedBenefits);
  };

  const handleShopChange = (index, field, value) => {
    const updatedShops = [...shops];
    updatedShops[index] = { ...updatedShops[index], [field]: value };
    setShops(updatedShops);
  };

  const addShop = () => {
    setShops([...shops, { shop: '', description: '' }]);
  };

  const removeShop = (index) => {
    const updatedShops = shops.filter((_, i) => i !== index);
    setShops(updatedShops);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!cardDetails.bank) newErrors.bank = 'Bank is required';
    if (!cardDetails.cardName) newErrors.cardName = 'Card name is required';
    if (!cardDetails.description) newErrors.description = 'Description is required';
    if (!cardDetails.yearlyIncome) newErrors.yearlyIncome = 'Yearly income is required';
    if (!cardDetails.minimumAge) newErrors.minimumAge = 'Minimum age is required';
    if (!cardDetails.minimumMonthlyPayment) newErrors.minimumMonthlyPayment = 'Minimum monthly payment is required';
    if (!cardDetails.cashWithdrawalFee) newErrors.cashWithdrawalFee = 'Cash withdrawal fee is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let cardImageUrl = cardDetails.cardImage;
      if (cardDetails.cardImage instanceof File) {
        const storageRef = ref(storage, `cardImages/${cardDetails.cardImage.name}`);
        await uploadBytes(storageRef, cardDetails.cardImage);
        cardImageUrl = await getDownloadURL(storageRef);
      }

      const updatedCardData = {
        ...cardDetails,
        cardImage: cardImageUrl,
        benefits,
        shops,
      };

      await updateDoc(doc(db, 'creditCards', id), updatedCardData);
      alert('Credit card updated successfully!');
      navigate(`/credit-cards/${id}`);
    } catch (error) {
      console.error("Error updating credit card: ", error);
      setSubmitError('Failed to update credit card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sectionStyle = {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px'
  };

  if (isLoading) {
    return <Container className="mt-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit} noValidate>
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>Edit Credit Card</h2>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Update'}
          </Button>
        </div>

        {submitError && <Alert variant="danger">{submitError}</Alert>}

        <div style={sectionStyle}>
          <h4>Basic Information</h4>
          <Form.Group className="mb-3">
            <Form.Label>Bank</Form.Label>
            <Form.Select 
              name="bank" 
              value={cardDetails.bank} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.bank}
            >
              <option value="">Select a bank</option>
              {banks.map((bank, index) => (
                <option key={index} value={bank}>{bank}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.bank}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Card Name</Form.Label>
            <Form.Control 
              type="text" 
              name="cardName" 
              value={cardDetails.cardName} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.cardName}
            />
            <Form.Control.Feedback type="invalid">{errors.cardName}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Card Image</Form.Label>
            <Form.Control 
              type="file" 
              name="cardImage" 
              onChange={handleCardDetailsChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description" 
              value={cardDetails.description} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Card Type</Form.Label>
            <Form.Check 
              type="checkbox"
              label="Point"
              name="point"
              checked={cardDetails.cardType.point}
              onChange={handleCardTypeChange}
            />
            {cardDetails.cardType.point && (
              <Form.Control 
                type="text" 
                placeholder="Name of the point"
                name="pointName"
                value={cardDetails.pointName}
                onChange={handleCardDetailsChange}
                className="mt-2"
              />
            )}
            <Form.Check 
              type="checkbox"
              label="Cash Rebate"
              name="cashRebate"
              checked={cardDetails.cardType.cashRebate}
              onChange={handleCardTypeChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Application Cash Rebate</Form.Label>
            <Form.Control 
              type="number" 
              name="newApplicationCashRebate" 
              value={cardDetails.newApplicationCashRebate} 
              onChange={handleCardDetailsChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Redemption Webpage</Form.Label>
            <Form.Control 
              type="url" 
              name="redemptionWebpage" 
              value={cardDetails.redemptionWebpage} 
              onChange={handleCardDetailsChange}
            />
          </Form.Group>
        </div>

        <div style={sectionStyle}>
          <h4>Annual Fee</h4>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Annual Fee</Form.Label>
                <Form.Control 
                  type="number" 
                  name="annualFee"
                  value={cardDetails.annualFee}
                  onChange={handleCardDetailsChange}
                />
                <Form.Text className="text-muted">
                  Insert 0 for none
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Subsidiary Annual Fee</Form.Label>
                <Form.Control 
                  type="number" 
                  name="subsidiaryAnnualFee"
                  value={cardDetails.subsidiaryAnnualFee}
                  onChange={handleCardDetailsChange}
                />
                <Form.Text className="text-muted">
                  Insert 0 for none
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox"
              label="Annual Fee Free For 1st year?"
              name="annualFeeFreeFirstYear"
              checked={cardDetails.annualFeeFreeFirstYear}
              onChange={handleCardDetailsChange}
            />
          </Form.Group>
        </div>

        <div style={sectionStyle}>
          <h4>Interest and Fees</h4>
          <Form.Group className="mb-3">
            <Form.Label>Interest Rate p.a.</Form.Label>
            <Form.Control 
              type="number" 
              step="0.01"
              name="interestRate"
              value={cardDetails.interestRate}
              onChange={handleCardDetailsChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cash Out Charge</Form.Label>
            <Form.Control 
              as="textarea" 
              name="cashOutCharge" 
              value={cardDetails.cashOutCharge} 
              onChange={handleCardDetailsChange} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Easy Payment Plan</Form.Label>
            <Form.Control 
              as="textarea" 
              name="easyPaymentPlan" 
              value={cardDetails.easyPaymentPlan} 
              onChange={handleCardDetailsChange} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Balance Transfer</Form.Label>
            <Form.Control 
              as="textarea" 
              name="balanceTransfer" 
              value={cardDetails.balanceTransfer} 
              onChange={handleCardDetailsChange} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Late Charges Fee</Form.Label>
            <Form.Control 
              as="textarea" 
              name="lateChargesFee" 
              value={cardDetails.lateChargesFee} 
              onChange={handleCardDetailsChange} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Minimum Monthly Payment</Form.Label>
            <Form.Control 
              type="text" 
              name="minimumMonthlyPayment" 
              value={cardDetails.minimumMonthlyPayment} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.minimumMonthlyPayment}
            />
            <Form.Control.Feedback type="invalid">{errors.minimumMonthlyPayment}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cash Withdrawal Fee</Form.Label>
            <Form.Control 
              type="text" 
              name="cashWithdrawalFee" 
              value={cardDetails.cashWithdrawalFee} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.cashWithdrawalFee}
            />
            <Form.Control.Feedback type="invalid">{errors.cashWithdrawalFee}</Form.Control.Feedback>
          </Form.Group>
          </div>

        <div style={sectionStyle}>
          <h4>Application Requirements</h4>
          <Form.Group className="mb-3">
            <Form.Label>Yearly Income</Form.Label>
            <Form.Control 
              type="number" 
              name="yearlyIncome" 
              value={cardDetails.yearlyIncome} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.yearlyIncome}
            />
            <Form.Control.Feedback type="invalid">{errors.yearlyIncome}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Minimum Age</Form.Label>
            <Form.Control 
              type="number" 
              name="minimumAge" 
              value={cardDetails.minimumAge} 
              onChange={handleCardDetailsChange}
              isInvalid={!!errors.minimumAge}
            />
            <Form.Control.Feedback type="invalid">{errors.minimumAge}</Form.Control.Feedback>
          </Form.Group>
        </div>

        <div style={sectionStyle}>
          <h4>Benefits</h4>
          {benefits.map((benefit, index) => (
            <div key={index} className="mb-3 p-3 border rounded">
              <Form.Group className="mb-3">
                <Form.Label>Benefit Name</Form.Label>
                <Form.Control 
                  type="text"
                  value={benefit.name}
                  onChange={(e) => handleBenefitChange(index, 'name', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea"
                  value={benefit.description}
                  onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rebate Percentage %</Form.Label>
                <Form.Control 
                  type="number"
                  value={benefit.rebatePercentage}
                  onChange={(e) => handleBenefitChange(index, 'rebatePercentage', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rebate Point</Form.Label>
                <Form.Control 
                  type="number"
                  value={benefit.rebatePoint}
                  onChange={(e) => handleBenefitChange(index, 'rebatePoint', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Related Shops</Form.Label>
                <Select
                  isMulti
                  options={allShops}
                  value={benefit.relatedShops}
                  onChange={(selectedOptions) => handleBenefitChange(index, 'relatedShops', selectedOptions)}
                />
              </Form.Group>
              <Button variant="danger" onClick={() => removeBenefit(index)}>Remove Benefit</Button>
            </div>
          ))}
          <Button variant="secondary" onClick={addBenefit} className="mb-3">Add Benefit</Button>
        </div>

        <div style={sectionStyle}>
          <h4>Shops</h4>
          {shops.map((shop, index) => (
            <div key={index} className="mb-3 p-3 border rounded">
              <Form.Group className="mb-3">
                <Form.Label>Shop</Form.Label>
                <Select
                  options={allShops}
                  value={allShops.find(s => s.value === shop.shop)}
                  onChange={(selectedOption) => handleShopChange(index, 'shop', selectedOption.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea"
                  value={shop.description}
                  onChange={(e) => handleShopChange(index, 'description', e.target.value)}
                />
              </Form.Group>
              <Button variant="danger" onClick={() => removeShop(index)}>Remove Shop</Button>
            </div>
          ))}
          <Button variant="secondary" onClick={addShop} className="mb-3">Add Shop</Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreditCardEdit;