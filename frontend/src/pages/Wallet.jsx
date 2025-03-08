import React, { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllWallets } from "../api"; 

import "./Walletpage.css";

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [token, setToken] = useState(null); // 新增 token 状态

  
  // 从本地存储获取 token
  useEffect(() => {
    const storedToken = localStorage.getItem('token'); // 假设你在登录时将 token 存储在 localStorage 中
    if (storedToken) {
      setToken(storedToken); // 设置 token
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    if (!token) {
      toast.error("未登入，請先登入");
      return;
    }

    try {
      const data = await getAllWallets(token); // 使用 token 调用 API
      setWallets(data);
    } catch (error) {
      toast.error(error.message); // 顯示錯誤訊息
    }
  }, [token]); // 依赖 token

  useEffect(() => {
    if (token) {
      fetchWallets();
    }
  }, [token, fetchWallets]); // 添加 fetchWallets 到依赖数组

  return (
    <div className="walletroot">

      <div className="navwallet">
        <Link to="create" className="">創建新錢包</Link>
        <Link to="import" className="">導入錢包</Link>
        <Link to="backup" className="">備份錢包</Link>
        <Link to="restore" className="">還原錢包</Link>
        <Link to="encrypt" className="w">加密錢包</Link> 
      </div>
      <div className="wallet-container">
        <h1>💰 我的錢包</h1>
        <button onClick={fetchWallets} className="refresh-btn">🔄 刷新數據</button>

        {wallets.length === 0 ? (
          <p className="no-wallet">暫無錢包數據</p>
        ) : (
          <div className="wallet-list">
            {wallets.map((wallet) => (
              <li key={wallet.id} className="wallet-card">
                <p className="label">地址：</p>
                <p className="wallet-address">{wallet.address}</p>
                <p className="label">餘額：</p>
                <p className="wallet-balance">{wallet.balance} BTC</p>
              </li>
            ))}
          </div>
        )}
      </div>
      <button className='newaddress'>生成新地址</button>
    </div>
  );
}

export default Wallet;
