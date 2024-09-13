import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Image, Accordion } from 'react-bootstrap';
import { banks } from '../data/General';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
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
    annualFeeWaiver: false,
    annualFeeWaiverYears: '1',
    interestRate: '',
    cashOutCharge: '',
    easyPaymentPlan: false,
    balanceTransfer: false,
    lateChargesFee: '',
    minimumMonthlyPayment: '',
    yearlyIncome: '',
    minimumAge: '',
    cardNetworks: {
      visa: false,
      mastercard: false,
      americanExpress: false
    },
    malaysianRequirements: '',
    foreignerRequirements: ''
  });

  const [benefits, setBenefits] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [cardImagePreview, setCardImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const docRef = doc(db, 'creditCards', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCardDetails(prevDetails => ({
            ...prevDetails,
            ...data,
            cardName: data.cardName.charAt(0).toUpperCase() + data.cardName.slice(1)
          }));
          setBenefits(data.benefits || []);
          setCardImagePreview(data.cardImage);
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
      const shopsCollection = collection(db, 'shops');
      const shopSnapshot = await getDocs(shopsCollection);
      const shopList = shopSnapshot.docs.map(doc => ({ 
        value: doc.id, 
        label: doc.data().name 
      }));
      setAllShops(shopList);
    };

    fetchCardDetails();
    fetchShops();
  }, [id]);

  const handleCardDetailsChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setCardDetails(prevDetails => ({
        ...prevDetails,
        [name]: files[0]
      }));
      setCardImagePreview(URL.createObjectURL(files[0]));
    } else if (name === 'cardName') {
      setCardDetails(prevDetails => ({
        ...prevDetails,
        [name]: value.charAt(0).toUpperCase() + value.slice(1)
      }));
    } else {
      setCardDetails(prevDetails => ({
        ...prevDetails,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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

  const handleCardNetworkChange = (e) => {
    const { name, checked } = e.target;
    setCardDetails(prevDetails => ({
      ...prevDetails,
      cardNetworks: {
        ...prevDetails.cardNetworks,
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
    setBenefits([...benefits, { 
      name: '', 
      description: '', 
      rules: '', 
      rebatePercentage: '', 
      rebatePoint: '', 
      numberOfTimes: '',
      merchantType: 'specificShops',
      specificShops: []
    }]);
  };

  const removeBenefit = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(updatedBenefits);
  };

  const moveBenefit = (index, direction) => {
    const newBenefits = [...benefits];
    const newIndex = index + direction;
    [newBenefits[index], newBenefits[newIndex]] = [newBenefits[newIndex], newBenefits[index]];
    setBenefits(newBenefits);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!cardDetails.bank) newErrors.bank = 'Bank is required';
    if (!cardDetails.cardName) newErrors.cardName = 'Card name is required';
    if (!cardDetails.description) newErrors.description = 'Description is required';
    if (!cardDetails.yearlyIncome) newErrors.yearlyIncome = 'Yearly income is required';
    if (!cardDetails.minimumAge) newErrors.minimumAge = 'Minimum age is required';
    if (!cardDetails.minimumMonthlyPayment) newErrors.minimumMonthlyPayment = 'Minimum monthly payment is required';
    
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
      };

      await updateDoc(doc(db, 'creditCards', id), updatedCardData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
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
        <div className="sticky-top bg-white py-3" style={{ top: '60px', zIndex: 1020 }}>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="outline-primary" onClick={() => navigate(-1)}>
              Back
            </Button>
            <h2 className="text-center flex-grow-1">Edit Credit Card</h2>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner animation="border" size="sm" /> : 'Update'}
            </Button>
          </div>
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
            <Form.Label>Card Networks</Form.Label>
            <div>
              <Form.Check 
                inline
                type="checkbox"
                label="Visa"
                name="visa"
                checked={cardDetails.cardNetworks.visa}
                onChange={handleCardNetworkChange}
              />
              <Form.Check 
                inline
                type="checkbox"
                label="Mastercard"
                name="mastercard"
                checked={cardDetails.cardNetworks.mastercard}
                onChange={handleCardNetworkChange}
              />
              <Form.Check 
                inline
                type="checkbox"
                label="American Express"
                name="americanExpress"
                checked={cardDetails.cardNetworks.americanExpress}
                onChange={handleCardNetworkChange}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Card Image</Form.Label>
            <Form.Control 
              type="file" 
              name="cardImage" 
              onChange={handleCardDetailsChange}
            />
            {cardImagePreview && (
              <Image src={cardImagePreview} alt="Card Preview" thumbnail className="mt-2" style={{ maxWidth: '200px' }} />
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={6}
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
              label="Annual Fee Waiver?"
              name="annualFeeWaiver"
              checked={cardDetails.annualFeeWaiver}
              onChange={handleCardDetailsChange}
            />
          </Form.Group>

          {cardDetails.annualFeeWaiver && (
            <Form.Group className="mb-3">
              <Form.Label>Annual Fee Waiver Years</Form.Label>
              <Form.Select
                name="annualFeeWaiverYears"
                value={cardDetails.annualFeeWaiverYears}
                onChange={handleCardDetailsChange}
              >
                {[1, 2, 3, 4, 5].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
                          </Form.Group>
                        )}
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
                          <Form.Check 
                            type="checkbox"
                            label="Easy Payment Plan"
                            name="easyPaymentPlan"
                            checked={cardDetails.easyPaymentPlan}
                            onChange={handleCardDetailsChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox"
                            label="Balance Transfer"
                            name="balanceTransfer"
                            checked={cardDetails.balanceTransfer}
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

                        <Form.Group className="mb-3">
                          <Form.Label>Malaysian Documents</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={4}
                            name="malaysianRequirements" 
                            value={cardDetails.malaysianRequirements} 
                            onChange={handleCardDetailsChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Foreigner Documents</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={4}
                            name="foreignerRequirements" 
                            value={cardDetails.foreignerRequirements} 
                            onChange={handleCardDetailsChange}
                          />
                        </Form.Group>
                      </div>

                      <div style={sectionStyle}>
                        <h4>Benefits</h4>
                        <style>
                          {`
                            .accordion-button::after {
                              display: none;
                            }
                          `}
                        </style>
                        <Accordion>
                          {benefits.map((benefit, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                              <Accordion.Header>
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                  <span>{benefit.name || `Benefit ${index + 1}`}</span>
                                  <div>
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (index > 0) moveBenefit(index, -1);
                                      }}
                                      disabled={index === 0}
                                      className="me-1"
                                    >
                                      ▲
                                    </Button>
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (index < benefits.length - 1) moveBenefit(index, 1);
                                      }}
                                      disabled={index === benefits.length - 1}
                                    >
                                      ▼
                                    </Button>
                                  </div>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body>
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
                                    rows={3}
                                    value={benefit.description}
                                    onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Rules</Form.Label>
                                  <Form.Control 
                                    as="textarea"
                                    rows={3}
                                    value={benefit.rules}
                                    onChange={(e) => handleBenefitChange(index, 'rules', e.target.value)}
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
                                  <Form.Label>Number of Times</Form.Label>
                                  <Form.Control 
                                    type="number"
                                    value={benefit.numberOfTimes}
                                    onChange={(e) => handleBenefitChange(index, 'numberOfTimes', e.target.value)}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Select Merchants</Form.Label>
                                  <div>
                                    <Form.Check
                                      type="radio"
                                      label="All kind of spending"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-all-${index}`}
                                      value="allSpending"
                                      checked={benefit.merchantType === 'allSpending'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="Any Local Shops"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-local-${index}`}
                                      value="anyLocal"
                                      checked={benefit.merchantType === 'anyLocal'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="Any Overseas Shops"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-overseas-${index}`}
                                      value="anyOverseas"
                                      checked={benefit.merchantType === 'anyOverseas'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="Supermarkets & Stores"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-supermarkets-${index}`}
                                      value="supermarketsAndStores"
                                      checked={benefit.merchantType === 'supermarketsAndStores'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="Insurance"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-insurance-${index}`}
                                      value="insurance"
                                      checked={benefit.merchantType === 'insurance'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="Petrol"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-petrol-${index}`}
                                      value="petrol"
                                      checked={benefit.merchantType === 'petrol'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="Specific Shops"
                                      name={`merchantType-${index}`}
                                      id={`merchantType-specific-${index}`}
                                      value="specificShops"
                                      checked={benefit.merchantType === 'specificShops'}
                                      onChange={(e) => handleBenefitChange(index, 'merchantType', e.target.value)}
                                    />
                                  </div>
                                </Form.Group>
                                {benefit.merchantType === 'specificShops' && (
                                  <Form.Group className="mb-3">
                                    <Form.Label>Specific Shops</Form.Label>
                                    <Select
                                      isMulti
                                      options={allShops}
                                      value={benefit.specificShops}
                                      onChange={(selectedOptions) => handleBenefitChange(index, 'specificShops', selectedOptions)}
                                    />
                                  </Form.Group>
                                )}
                                <Button variant="danger" onClick={() => removeBenefit(index)}>Remove Benefit</Button>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                        <Button variant="secondary" onClick={addBenefit} className="mt-3">Add Benefit</Button>
                      </div>
                    </Form>

                    {showSuccess && (
                      <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1050,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        textAlign: 'center',
                      }}>
                        Credit card updated successfully!
                      </div>
                    )}
                  </Container>
                );
              };

              export default CreditCardEdit;