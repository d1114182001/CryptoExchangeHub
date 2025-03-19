import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllWallets } from "../api"; 
import "react-toastify/dist/ReactToastify.css";
import "./Walletpage.css";

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    if (!token) {
      toast.error("未登入，請先登入");
      return;
    }

    try {
      const data = await getAllWallets(token);
      setWallets(data);
    } catch (error) {
      toast.error(error.message);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchWallets();
    }
  }, [token, fetchWallets]);

  // 跳轉到交易頁面，帶上錢包地址
  const handleTransaction = (address) => {
    navigate(`/transaction/${address}`); // 與路由中的動態路徑匹配
  };

  return (
    <div className="">
      <h2 className="">錢包管理</h2>
      
      <div className="">
        <Link to="create" className="">創建新錢包</Link>
        <Link to="import" className="">導入錢包</Link>
        <Link to="backup" className="">備份錢包</Link>
        <Link to="restore" className="">還原錢包</Link>
        <Link to="encrypt" className="">加密錢包</Link> 
        <Link to="/concourse" className="">進入交易大廳</Link>
      </div>
      <div className="wallet-container">
        <h1>💰 我的錢包</h1>
        <button onClick={fetchWallets} className="refresh-btn">🔄 刷新數據</button>

        {wallets.length === 0 ? (
          <p className="no-wallet">暫無錢包數據</p>
        ) : (
          <ul className="wallet-list">
            {wallets.map((wallet) => (
              <li key={wallet.id} className="wallet-card">
                <p className="label">地址：</p>
                <p className="wallet-address">{wallet.address}</p>
                <p className="label">餘額：</p>
                <p className="wallet-balance">{wallet.balance || '0'} BTC</p>

                <button onClick={() => handleTransaction(wallet.address)} className="transaction-btn">
                  發送比特幣
                </button>
              </li>
              
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Wallet;