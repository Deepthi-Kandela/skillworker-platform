import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Spinner } from '../../components/common';
import toast from 'react-hot-toast';
import { FiArrowUpCircle, FiArrowDownCircle, FiDollarSign } from 'react-icons/fi';
import './Wallet.css';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [tab, setTab] = useState('topup');

  useEffect(() => {
    Promise.all([API.get('/wallet'), API.get('/wallet/transactions')])
      .then(([wRes, tRes]) => { setWallet(wRes.data); setTransactions(tRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleTopUp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/wallet/topup', { amount: Number(amount) });
      setWallet(data);
      setTransactions([{ type: 'credit', amount: Number(amount), description: 'Wallet Top-up', createdAt: new Date() }, ...transactions]);
      toast.success(`₹${amount} added to wallet!`);
      setAmount('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/wallet/withdraw', { amount: Number(amount) });
      setWallet(data);
      setTransactions([{ type: 'debit', amount: Number(amount), description: 'Withdrawal', createdAt: new Date() }, ...transactions]);
      toast.success(`₹${amount} withdrawal requested!`);
      setAmount('');
    } catch (err) { toast.error(err.response?.data?.message || 'Insufficient balance'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <h1 className="wallet-title">💰 My Wallet</h1>

        {/* Balance Card */}
        <div className="wallet-balance-card">
          <p className="wallet-balance-label">Available Balance</p>
          <h2 className="wallet-balance">₹{wallet?.balance?.toFixed(2) || '0.00'}</h2>
          <p className="wallet-balance-sub">SkillWorker Wallet</p>
        </div>

        {/* Actions */}
        <div className="wallet-actions-card card">
          <div className="wallet-tabs">
            <button className={`wallet-tab ${tab === 'topup' ? 'active' : ''}`} onClick={() => setTab('topup')}>
              <FiArrowUpCircle /> Add Money
            </button>
            <button className={`wallet-tab ${tab === 'withdraw' ? 'active' : ''}`} onClick={() => setTab('withdraw')}>
              <FiArrowDownCircle /> Withdraw
            </button>
          </div>

          <form onSubmit={tab === 'topup' ? handleTopUp : handleWithdraw} className="wallet-form">
            <div className="wallet-quick-amounts">
              {[100, 200, 500, 1000].map(a => (
                <button key={a} type="button" className={`wallet-quick-btn ${amount == a ? 'active' : ''}`} onClick={() => setAmount(a)}>
                  ₹{a}
                </button>
              ))}
            </div>
            <div className="wallet-input-wrap">
              <FiDollarSign className="wallet-input-icon" />
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={1}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              {tab === 'topup' ? '➕ Add Money' : '💸 Withdraw'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="wallet-transactions card">
          <h3>📋 Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-light text-center mt-2">No transactions yet</p>
          ) : (
            <div className="wallet-tx-list">
              {transactions.map((tx, i) => (
                <div key={i} className="wallet-tx-item">
                  <div className={`wallet-tx-icon ${tx.type}`}>
                    {tx.type === 'credit' ? <FiArrowUpCircle /> : <FiArrowDownCircle />}
                  </div>
                  <div className="wallet-tx-info">
                    <p className="wallet-tx-desc">{tx.description}</p>
                    <p className="wallet-tx-date">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`wallet-tx-amount ${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
