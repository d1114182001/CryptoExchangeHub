import React from "react";
import { createBrowserRouter, RouterProvider, Outlet, Link } from "react-router-dom"; // 导入 Link 用于导航
import ForgotPassword from "./register/forgot-password";
import ResetPassword from "./register/reset-password";
import Wallet from "./pages/Wallet";
import CreateWallet from "./Wallet/CreateWallet";
import ImportWallet from "./Wallet/ImportWallet";
import BackupWallet from "./Wallet/BackupWallet";
import RestoreWallet from "./Wallet/RestoreWallet";
import EncryptWallet from "./Wallet/EncryptWallet";
import Login from "./loginf/login"; // 导入 Login 组件
import Register from "./register/register"; // 导入 Register 组件
import Transaction from "./Transaction/Transaction"; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // 在 Layout 加入全局导航列
    children: [
      { path: "", element: <Login /> }, // 首页为 Login 页面
      { path: "register", element: <Register /> },
      { path: "transaction/:address", element: <Transaction /> },
      {
        path: "wallet",
        element: <WalletLayout />, // Wallet 内部管理自己的子路由
        children: [
          { path: "", element: <Wallet /> },
          { path: "create", element: <CreateWallet /> },
          { path: "import", element: <ImportWallet /> },
          { path: "backup", element: <BackupWallet /> },
          { path: "restore", element: <RestoreWallet /> },
          { path: "encrypt", element: <EncryptWallet /> },
        ],
      },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
]);

// 全局布局，包含导航栏
function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

// 钱包页面的子布局
function WalletLayout() {
  return (
    <div>
      <Outlet /> {/* 渲染子路由组件 */}
    </div>
  );
}

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

/*function Layout() {
  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white flex justify-between">
        <Link to="/" className="font-bold text-lg">Home</Link>
        <div className="flex gap-4">
          <Link to="/register" className="hover:underline">註冊</Link> 
          <Link to="/wallet" className="hover:underline">錢包管理</Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
*/