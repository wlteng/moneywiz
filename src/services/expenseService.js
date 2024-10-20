import { db } from './firebase';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';

// Get a summary of expenses for the current month
export const getMonthlySummary = async () => {
  const month = new Date().getMonth() + 1;
  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('month', '==', month));
  const querySnapshot = await getDocs(q);

  let total = 0;
  let categoryTotals = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    total += data.amount;
    categoryTotals[data.category] = (categoryTotals[data.category] || 0) + data.amount;
  });

  const mostExpensiveCategory = Object.keys(categoryTotals).reduce((a, b) =>
    categoryTotals[a] > categoryTotals[b] ? a : b
  );

  return {
    total,
    mostExpensiveCategory,
    categoryTotals,
  };
};

// Function to get all transactions from Firestore
export const getTransactions = async () => {
  const transactions = [];
  const querySnapshot = await getDocs(collection(db, 'expenses'));
  
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() });
  });

  console.log('Fetched transactions:', transactions); // Log the fetched transactions for debugging
  return transactions;
};

// Get a single transaction by its ID
export const getTransactionById = async (transactionId) => {
  const transactionRef = doc(db, 'expenses', transactionId);
  const transactionSnapshot = await getDoc(transactionRef);

  if (transactionSnapshot.exists()) {
    return {
      id: transactionSnapshot.id,
      ...transactionSnapshot.data(),
    };
  } else {
    throw new Error('Transaction not found');
  }
};