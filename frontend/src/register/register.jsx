import React, { useState } from "react";
import { registerUser } from '../api'; // 引入 registerUser 函數
import { useNavigate } from 'react-router-dom'; 
import './r.css';

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        phone: ""
    });

    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await registerUser(formData); // 調用 registerUser
            setMessage(data.message);
            setTimeout(() => {
                navigate("/"); // 成功後，幾秒鐘後導向登入頁面
            }, 2000); // 2 秒後跳轉
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <h2>註冊</h2>
                <form onSubmit={handleSubmit} className="register-form">
                    <input
                        type="text"
                        name="username"
                        placeholder="帳號"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="密碼"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="手機號碼"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />
                    <button type="submit" className="register-button">註冊</button>
                </form>
                {message && <p className="register-message">{message}</p>}
            </div>
        </div>
    );
}
