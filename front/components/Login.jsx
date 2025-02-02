import React, { useState } from 'react';
import './Login.css'; // 引入 CSS 檔案

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(data.message || '登入成功！');
                localStorage.setItem('token', data.token);
            } else {
                const errorData = await response.json();
                setError(errorData.message || '登入失敗');
            }
        } catch (err) {
            setError('伺服器錯誤，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2 className="login-title">登入</h2>

                {error && <div className="login-message error">{error}</div>}
                {success && <div className="login-message success">{success}</div>}

                <div className="input-group">
                    <label>用戶名</label>
                    <input
                        type="text"
                        placeholder="輸入用戶名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>密碼</label>
                    <input
                        type="password"
                        placeholder="輸入密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className={`login-button ${loading ? 'disabled' : ''}`} disabled={loading}>
                    {loading ? '登入中...' : '登入'}
                </button>
            </form>
        </div>
    );
}

export default Login;
