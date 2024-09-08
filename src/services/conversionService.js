import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';

const API_KEY = '563996b1e5d94f38a7d47fbf7951a172';
const API_URL = `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`;

export const getStoredRates = async () => {
  try {
    const ratesDoc = await getDoc(doc(db, 'conversionRates', 'rates'));
    if (ratesDoc.exists()) {
      return { rates: ratesDoc.data().rates, lastUpdated: ratesDoc.data().lastUpdated.toDate() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching stored rates:', error);
    throw error;
  }
};

export const getApiRates = async () => {
  try {
    const response = await axios.get(API_URL);
    return { rates: response.data.rates, lastUpdated: new Date(response.data.timestamp * 1000) };
  } catch (error) {
    console.error('Error fetching API rates:', error);
    throw error;
  }
};

export const saveRatesToFirestore = async (rates, lastUpdated) => {
  try {
    await setDoc(doc(db, 'conversionRates', 'rates'), { rates, lastUpdated });
  } catch (error) {
    console.error('Error saving rates to Firestore:', error);
    throw error;
  }
};

export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const { rates } = await getStoredRates() || await getApiRates();
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'USD') return amount * rates[toCurrency];
  if (toCurrency === 'USD') return amount / rates[fromCurrency];
  return (amount / rates[fromCurrency]) * rates[toCurrency];
};

export const compareRates = (storedRates, apiRates) => {
  const comparisons = {};
  for (const currency in storedRates) {
    if (apiRates[currency]) {
      const percentDiff = ((apiRates[currency] - storedRates[currency]) / storedRates[currency]) * 100;
      comparisons[currency] = percentDiff.toFixed(2);
    }
  }
  return comparisons;
};