// src/App.jsx
import { createBrowserRouter, RouterProvider, Outlet, Link } from "react-router-dom";
import Wallet from "./pages/Wallet";

import CreateWallet from "./Wallet/CreateWallet";
import ImportWallet from "./Wallet/ImportWallet";
import BackupWallet from "./Wallet/BackupWallet";
import RestoreWallet from "./Wallet/RestoreWallet";
import EncryptWallet from "./Wallet/EncryptWallet";
import Login from "./loginf/login"; // 导入 Login 组件

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // 在 `Layout` 加入全局导航列
    children: [
      { path: "", element: <Login /> }, // 首页为 Login 页面
      {
        path: "wallet",
        element: <WalletLayout />, // Wallet 內部管理自己的子路由
        children: [
          { path: "", element: <Wallet /> },
          { path: "create", element: <CreateWallet /> },
          { path: "import", element: <ImportWallet /> },
          { path: "backup", element: <BackupWallet /> },
          { path: "restore", element: <RestoreWallet /> },
          { path: "encrypt", element: <EncryptWallet /> },
        ],
      },
    ],
  },
]);

/*function Layout() {
  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white flex justify-between">
        <Link to="/" className="font-bold text-lg">Home</Link>
        <div className="flex gap-4">
          <Link to="/wallet" className="hover:underline">錢包管理</Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}*/


function Layout() {
  // 直接返回包含 <Outlet /> 的结构，不再渲染导航栏
  return (
    <div>
      <Outlet />
    </div>
  );
}

function WalletLayout() {
  return (
    <div>
      <Outlet /> {/* 這裡會根據當前路由渲染 Wallet 或 CreateWallet */}
    </div>
  );
}

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

