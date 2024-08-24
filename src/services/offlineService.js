import localforage from 'localforage';

// Initialize a localforage instance for transactions
const transactionsStorage = localforage.createInstance({
  name: 'transactionsStorage',
  storeName: 'transactions', // Collection name
});

// Save a transaction locally
export const saveTransactionLocally = async (transaction) => {
  try {
    const transactions = (await transactionsStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    await transactionsStorage.setItem('transactions', transactions);
    console.log('Transaction saved locally:', transaction);
  } catch (error) {
    console.error('Failed to save transaction locally:', error);
  }
};

// Sync local transactions with Firebase
export const syncTransactions = async (db) => {
  const transactions = await transactionsStorage.getItem('transactions');
  if (transactions && transactions.length > 0) {
    for (const transaction of transactions) {
      try {
        await db.collection('expenses').add(transaction);
        console.log('Transaction synced with Firebase:', transaction);
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }
    // Clear local transactions after syncing
    await transactionsStorage.removeItem('transactions');
  }
};