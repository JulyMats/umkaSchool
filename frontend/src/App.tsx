import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  return (
    <div className="flex min-h-screen ">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
