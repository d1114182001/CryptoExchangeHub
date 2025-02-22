import React, { useState } from 'react';
import { addWallet } from '../api'; // 确保路径正确

function CreateWallet() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            const newWallet = await addWallet();
            setWallet(newWallet);
        } catch (err) {
            setError('Failed to create wallet');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Create New Wallet</h2>
            <button onClick={handleCreateWallet} disabled={loading}>
                {loading ? 'Creating...' : 'Create Wallet'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {wallet && (
                <div>
                    <h3>Wallet Created:</h3>
                    <p><strong>Address:</strong> {wallet.address}</p>
                    <p><strong>Public Key:</strong> {wallet.publicKey}</p>
                    <p><strong>Private Key:</strong> {wallet.privateKey}</p>
                </div>
            )}
        </div>
    );
}

export default CreateWallet;
