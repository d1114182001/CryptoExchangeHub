import React, { useState } from "react";
import { requestPasswordReset } from "../api"; 
import "./f.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLinkClicked, setIsLinkClicked] = useState(false); // 新增狀態

  const isEmailValid = /\S+@\S+\.\S+/;

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!username) {
      setMessage("請輸入帳號。");
      return;
    }

    if (!isEmailValid.test(email)) {
      setMessage("請輸入有效的電子郵件地址。");
      return;
    }

    if (phone.length < 10) {
      setMessage("請輸入有效的電話號碼。");
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset(username, email, phone);
      setMessage(response.resetLink);
    } catch (error) {
      setMessage(error.message || "無法找到匹配的用戶或發生了錯誤。");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = () => {
    setIsLinkClicked(true); // 點擊連結後設置狀態
  };

  return (
    <div className="forgot-password-wrapper">
      {isLinkClicked ? (
        <div className="forgot-password-container">
          <p className="completion-message">已點擊重置連結，請在新分頁完成密碼重置。</p>
        </div>
      ) : (
        <div className="forgot-password-container">
          <h2>重置密碼</h2>
          <form onSubmit={handleForgotPassword} className="forgot-password-form">
            <div className="form-group">
              <label>帳號:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="forgot-password-input"
              />
            </div>
            <div className="form-group">
              <label>電子郵件:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="forgot-password-input"
              />
            </div>
            <div className="form-group">
              <label>電話:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="forgot-password-input"
              />
            </div>
            {loading ? (
              <p className="loading-message">載入中...</p>
            ) : (
              <button type="submit" className="forgot-password-button">請求重置密碼</button>
            )}
          </form>
          {message && (
            <p className="forgot-password-message">
              {message.startsWith("http") ? (
                <>
                  請點擊以下連結重置密碼:{" "}
                  <a
                    href={message}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reset-link"
                    onClick={handleLinkClick} // 點擊時觸發
                  >
                    {message}
                  </a>
                </>
              ) : (
                message
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;