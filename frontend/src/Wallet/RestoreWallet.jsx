import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { recoverWallet } from '../api';
import './R.css';

const RestoreWallet = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const userId = sessionStorage.getItem('userId'); 
  const navigate = useNavigate();

  const handleRecover = async () => {
    
    try {
      const recovered = await recoverWallet(mnemonic,userId); // 調用 API
      setWallet(recovered);
      setError('');
    } catch (err) {
      setError('恢復失敗');
      setWallet(null);
    }
  };

  useEffect(() => {
    if (wallet) {
      const timer = setTimeout(() => {
        navigate('/wallet'); 
      }, 10000); 

      return () => clearTimeout(timer);
    }
  }, [wallet, navigate]); 

  return (
    <div className="restore-wallet-wrapper">
      <div className="restore-wallet">
        <h2>恢復 HD 錢包</h2>
        <div className="form-group">
          <label>輸入助記詞:</label>
          <textarea
            className="mnemonic-input"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            placeholder="輸入 12 個單詞的助記詞"
            rows="2"
            cols="50"
          />
        </div>
        <button onClick={handleRecover}>恢復錢包</button>
        {error && <p className="error">錯誤: {error}</p>}
        {wallet && (
          <div className="wallet-info">
            <h3>恢復的錢包資訊</h3>
            <p>地址: {wallet.address}</p>
            <p>助記詞: {wallet.mnemonic}</p>
            <p className="jump-notice">一旦成功，本頁將在10秒內跳轉!!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestoreWallet