import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendTransaction, getAllWallets } from '../api';

const Transaction = () => {
  const { address } = useParams(); // URL 中的預設地址（可選）
  const [wallets, setWallets] = useState([]); // 用戶的所有錢包
  const [senderAddress, setSenderAddress] = useState(address || ''); // 選中的發送地址
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null); // 用來存放交易詳情

  // 獲取用戶的所有錢包
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const walletData = await getAllWallets(token);
        setWallets(walletData);
        if (!senderAddress && walletData.length > 0) {
          setSenderAddress(walletData[0].address); // 預設選第一個錢包
        }
      } catch (error) {
        toast.error("無法載入錢包列表");
      }
    };
    fetchWallets();
  }, [senderAddress]); // 加上 senderAddress 依賴，避免警告

  const handleSendTransaction = async () => {
    if (!senderAddress || !recipientAddress || !amount) {
      toast.error("請選擇發送地址並填寫接收地址和金額");
      return;
    }

    console.log("發送地址:", senderAddress);
    console.log("發送金額 (BTC):", amount);
    setLoading(true);
    try {
      const response = await sendTransaction(senderAddress, recipientAddress, amount);
      
      // 設置交易詳情
      setTransactionDetails({
        sender: senderAddress,
        recipient: recipientAddress,
        transactionId: response.transactionId, // TxID
        transactionSignature: response.transactionSignature, // 假設後端回傳簽名
        transactionHash: response.transactionHash, // 交易摘要
        amount: response.amount // 交易金額
      });

      toast.success(`交易已發送！交易 ID: ${response.transactionId}`);
      setRecipientAddress('');
      setAmount('');
    } catch (error) {
      console.error("交易失敗:", error);
      toast.error(error.message || "交易失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-container">
      <h2>比特幣交易</h2>

      <div className="form-group">
        <label>從錢包地址</label>
        <select
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          disabled={loading}
        >
          {wallets.map((wallet) => (
            <option key={wallet.address} value={wallet.address}>
              {wallet.address} (餘額: {wallet.balance} BTC)
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>接收者地址</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="輸入接收者的比特幣地址"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>金額 (BTC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="輸入發送金額 (BTC)"
          step="0.00000001"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSendTransaction}
        className="send-btn"
        disabled={loading}
      >
        {loading ? "發送中..." : "發送比特幣"}
      </button>

      {/* 顯示交易詳情 */}
      {transactionDetails && (
        <div className="transaction-details">
          <h3>交易詳情</h3>
          <p><strong>發送者：</strong> {transactionDetails.sender}</p>
          <p><strong>接收者：</strong> {transactionDetails.recipient}</p>
          <p><strong>發送金額：</strong> {transactionDetails.amount} BTC</p>
          <p><strong>交易訊息摘要：</strong> {transactionDetails.transactionHash}</p>
          <p><strong>交易簽名：</strong> {transactionDetails.transactionSignature}</p>
          <p><strong>交易哈希值 (TxID)：</strong> {transactionDetails.transactionId}</p>
        </div>
      )}
    </div>
  );
};

export default Transaction;


