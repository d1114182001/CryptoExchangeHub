# 小更新(2025.3.30)
## 刪掉目前Wallet資料夾不太可能在這學期做到的功能


# 2025.3.24(融合初版)
##  2004最新版和2002大廳已融合
## uw2.sql 已更新
### - 終於!!🎉只剩css和其他的小問題

# 2025.3.16(創建和湯圓3/9第二版的整合)
## 無顯示交易資料界面(未融合d1114182002)
### 創建錢包:給註記詞和第一個地址(建議不要創第二個!!!)
### 生成新地址: 由創建的註記詞繼續延伸，不要再創建第二個錢包，不然會變成由第二個錢包的註記詞延伸
### 恢復錢包: 只恢復錢包的第一個地址
### backend/testHD2.js -可模擬沒有引入資料庫的錢包，將註記詞丟入恢復錢包
### uw2.sql -這版的資料庫，我有改結構

# 2025.2.23(模擬虛假交易資料)  
### 進入錢包管理->區塊鏈交易資料  
![image](https://github.com/d1114182001/CryptoExchangeHub/blob/D1114182001/pictures/2025-02-23%20161009.png)  
### 目前結果:
![image](https://github.com/d1114182001/CryptoExchangeHub/blob/D1114182001/pictures/2025-02-23%20160941.png)  
  
# 目前能做到錢包創建(隨機產生)2025.2.9  
## -未完成 區塊鏈  
### 套件:
#### 前端:npm install react-toastify react-router-dom axios  
#### 後端:npm install cors mysql2 bitcore-lib dotenv   
#### 前端執行:npm run dev  
#### 後端執行:node index.js  




# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
