import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 导入 useNavigate
import { loginUser } from '../api'; // 导入 api.js 中的 loginUser 函数
import './login.css'; // 引入登录样式

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // 创建 navigate 实例

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const data = await loginUser(username, password); // 调用 api.js 中的函数
            setSuccess(data.message || 'Login successful!');
            localStorage.setItem('token', data.token);
            // 登录成功后跳转到钱包管理页面
            navigate('/wallet');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2 className="login-title">Login</h2>

                {error && <div className="login-message error">{error}</div>}
                {success && <div className="login-message success">{success}</div>}

                <div className="input-group">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className={`login-button ${loading ? 'disabled' : ''}`} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* 添加注册链接 */}
                <p className="register-link">
                    Don't have an account? <span onClick={() => navigate('/register')} className="link">Register here</span>
                </p>

            </form>
        </div>
    );
}

export default Login;

