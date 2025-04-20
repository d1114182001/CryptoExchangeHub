import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api"; 
import './rp.css';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("無效的重置令牌。");
      return;
    }

    try {
      const response = await resetPassword(token, newPassword);
      setMessage(response.message);
      setTimeout(() => navigate("/"), 2000); // 重置成功後2秒跳轉到主頁
    } catch (error) {
      setMessage(error.message || "密碼重置失敗，請重試。");
    }
  };

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-container">
        <h2>重置密碼</h2>
        <form onSubmit={handleResetPassword} className="reset-password-form">
          <div className="form-group">
            <label>新密碼:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="reset-password-input"
            />
          </div>
          <button type="submit" className="reset-password-button">提交新密碼</button>
        </form>
        {message && <p className="reset-password-message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;