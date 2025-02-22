import axios from 'axios';

const api_url = 'http://192.168.0.48:3001';

export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${api_url}/login`, {
            username,
            password
        });
        
        return response.data; // 返回响应数据
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Server error, please try again later');
    }
}



export const addWallet = async () => {
    const response = await axios.post(`${api_url}/create-wallet`);
    return response.data;
}


export const getAllWallets = async () => {
    try {
      const response = await axios.get(`${api_url}/wallets`);
      return response.data;
    } catch (error) {
      throw new Error("無法獲取錢包數據");
    }
}


export const registerUser = async (formData) => {
  try {
    console.log("Submitting formData:", formData);
    const response = await axios.post(`${api_url}/register`, formData);
    return response.data; // 返回响应数据
  } catch (error) {
    console.error("注册请求错误:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || '註冊失敗，請稍後再試。');
  }
};
