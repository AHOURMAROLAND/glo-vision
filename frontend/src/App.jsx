import { Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import HomePage from './pages/HomePage'
import TableauDetailPage from './pages/TableauDetailPage'
import PanierPage from './pages/PanierPage'
import ValidationPage from './pages/ValidationPage'
import PaiementPage from './pages/PaiementPage'
import CommandeSuccesPage from './pages/CommandeSuccesPage'
import QRVerifPage from './pages/QRVerifPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="*" element={
        <>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tableau/:id" element={<TableauDetailPage />} />
              <Route path="/panier" element={<PanierPage />} />
              <Route path="/validation" element={<ValidationPage />} />
              <Route path="/paiement" element={<PaiementPage />} />
              <Route path="/commande/:code/succes" element={<CommandeSuccesPage />} />
              <Route path="/qr/:token" element={<QRVerifPage />} />
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>
  )
}