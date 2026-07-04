import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Calls from "./pages/Calls";
import NumberDetail from "./pages/NumberDetail";
import Chat from "./pages/Chat";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Calculations from "./pages/Calculations";
import Delivery from "./pages/Delivery";
import Blacklist from "./pages/Blacklist";
import Attributes from "./pages/Attributes";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="calls" element={<Calls />} />
        <Route path="calls/:phone" element={<NumberDetail />} />
        <Route path="chats" element={<Chat />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="calculations" element={<Calculations />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="blacklist" element={<Blacklist />} />
        <Route path="attributes" element={<Attributes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
