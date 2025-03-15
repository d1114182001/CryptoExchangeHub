import axios from 'axios';

const api_url = 'http://localhost:3001';

// 登入用戶
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${api_url}/login`, {
      username,
      password,
    });
    return response.data; // 返回響應數據
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Server error, please try again later');
  }
};

// 新增錢包
export const addWallet = async (userId) => {
  const response = await fetch(`${api_url}/create-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }), // 發送 user_id
  });

  return await response.json();
};

// 獲取所有錢包
export const getAllWallets = async (token) => {
  try {
    const response = await axios.get(`${api_url}/wallets`, {
      headers: {
        'Authorization': `Bearer ${token}`, // 在請求頭中添加 Authorization
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('無法獲取錢包數據');
  }
};

// 註冊用戶
export const registerUser = async (formData) => {
  try {
    console.log('Submitting formData:', formData);
    const response = await axios.post(`${api_url}/register`, formData);
    return response.data; // 返回響應數據
  } catch (error) {
    console.error('註冊請求錯誤:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || '註冊失敗，請稍後再試。');
  }
};

// 初始化交易
export const sendTransaction = async (senderAddress, recipientAddress, amount) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${api_url}/send-transaction`,
      { senderAddress, recipientAddress, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || '交易初始化失敗');
  }
};

// 獲取私鑰
export const getPrivateKey = async (senderAddress, password) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${api_url}/get-private-key`,
      { senderAddress, password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || '獲取私鑰失敗');
  }
};

// 完成交易（支援 finalize 參數）
export const completeTransaction = async (senderAddress, recipientAddress, amount, transactionHash, finalize = false) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${api_url}/complete-transaction`,
      { senderAddress, recipientAddress, amount, transactionHash, finalize },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || '完成交易失敗');
  }
};