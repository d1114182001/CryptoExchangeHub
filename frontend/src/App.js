import { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 设置 API 地址为后端地址
    const apiBaseUrl = "http://localhost:3001"; // 修改为后端运行的地址和端口

    // 从后端获取数据
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/test`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.message); // 假设后端返回 { "message": "Hello from backend!" }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData("Error fetching data");
      }
    };

    fetchData();
  }, []); // 空数组表示仅在组件挂载时执行一次

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{data ? data : "Loading..."}</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
