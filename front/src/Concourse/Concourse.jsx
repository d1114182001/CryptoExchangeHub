import React, { useState, useEffect } from 'react';
import "./Concourse.css"; // 引入 CSS

const Concourse = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = () => {
            fetch("http://100.120.185.39:3001/extract-transactions")
                .then((res) => res.json())
                .then((data) => setTransactions(data))
                .catch((error) => console.error("載入交易紀錄錯誤:", error));
        };

        fetchTransactions(); // 先載入一次
        const interval = setInterval(fetchTransactions, 5000); // 每 5 秒更新一次

        return () => clearInterval(interval); // 組件卸載時清除計時器，避免記憶體洩漏
    }, []);

    return (
        <div className="concourse-container">
            <h2>交易大廳</h2>
            <table>
                <thead>
                    <tr>
                        <th>交易哈希</th>
                        <th>發送者</th>
                        <th>接收者</th>
                        <th>金額 (BTC)</th>
                        <th>時間</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, index) => (
                        <tr key={index}>
                            <td>{tx.tx_hash.substring(0, 10) + "..."}</td>
                            <td>{tx.sender_address.substring(0, 6) + "..."}</td>
                            <td>{tx.recipient_address.substring(0, 6) + "..."}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Concourse;
