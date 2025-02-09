import React, { useState } from 'react';
import './login.css'; // Import CSS file

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
            const response = await fetch('http://192.168.0.46:3001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(data.message || 'Login successful!');
                localStorage.setItem('token', data.token);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error, please try again later');
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
            </form>
        </div>
    );
}

export default Login;
