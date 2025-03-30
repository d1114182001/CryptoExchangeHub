import React, { useState } from 'react';
import { recoverWallet } from '../api';

const RestoreWallet = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId'); 
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

  return (
    <div>
      <h2>恢復 HD 錢包</h2>
      <div>
        <label>輸入助記詞:</label>
        <textarea
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="輸入 12 個單詞的助記詞"
          rows="2"
          cols="50"
        />
      </div>
      <button onClick={handleRecover}>恢復錢包</button>

      {error && <p style={{ color: 'red' }}>錯誤: {error}</p>}
      {wallet && (
        <div>
          <h3>恢復的錢包資訊</h3>
          <p>地址: {wallet.address}</p>
          <p>助記詞: {wallet.mnemonic}</p>
        </div>
      )}
    </div>
  )
}

export default RestoreWallet