import React,{useState,useEffect} from 'react'
 // 引入CreateWallet頁面
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllWallets } from "../api"; 
import "react-toastify/dist/ReactToastify.css";
import "./Walletpage.css";

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const fetchWallets = async () => {
    try {
      const data = await getAllWallets(); // 使用 api.js 的函數
      setWallets(data);
    } catch (error) {
      toast.error(error.message); // 顯示錯誤訊息
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);
  return (
    <div className="">
      <h2 className="">錢包管理</h2>
      
      <div className="">
        <Link to="create" className="">
          創建新錢包
        </Link>
         <Link to="import" className="">
          導入錢包
        </Link>
        <Link to="backup" className="">
          備份錢包
        </Link>
        <Link to="restore" className="">
          還原錢包
        </Link>
        <Link to="encrypt" className="w">
          加密錢包
        </Link> 
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
              <p className="wallet-balance">{wallet.balance} BTC</p>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
    
  )
}

export default Wallet
