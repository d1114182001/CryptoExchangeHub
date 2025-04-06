import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate
import { addWallet } from '../api';

function CreateWallet() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mnemonic2, setMnemonic] = useState();
    const [address, setAddress] = useState();

    const navigate = useNavigate(); // 使用 useNavigate

    const handleCreateWallet = async () => {
        setLoading(true);
        setError(null);

        const userId = sessionStorage.getItem('userId'); // 从 sessionStorage 獲取 userId
        if (!userId) {
            setError('User ID not found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const newWallet = await addWallet(userId); // 傳送 userId
            setMnemonic(newWallet.mnemonic2);
            setAddress(newWallet.address);
        } catch (err) {
            setError('Failed to create wallet');
            console.error(err);
        }

        setLoading(false);
    };

    // 回到钱包页面的函数
    const handleBackToWallet = () => {
        navigate('/wallet'); // 导航到钱包页面
    };

    return (
        <div>
            <h2>Create New Wallet</h2>
            <button onClick={handleCreateWallet} disabled={loading}>
                {loading ? 'Creating...' : 'Create Wallet'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {mnemonic2 && (
                <div>
                    <h3>助記詞：</h3>
                    <p>{mnemonic2}</p>
                </div>
            )}
            
            {address && (
                <div>
                    <h3>地址：</h3>
                    <p>{address}</p>
                </div>
            )}

            {/* 添加一个返回钱包页面的按钮 */}
            <button onClick={handleBackToWallet}>回到錢包</button>
        </div>
    );
}

export default CreateWallet;

