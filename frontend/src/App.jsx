import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Payment from './pages/Payment'
import Signup from './pages/Signup'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Chat from './pages/Chat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/crea" element={<Admin />} />
      <Route path="/dashboard/agenti" element={<Admin />} />
      <Route path="/chat/:agentId" element={<Chat />} />
    </Routes>
  )
}

export default App