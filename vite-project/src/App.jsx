import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SchedulePage from './pages/SchedulePage'
import EventsPage from './pages/EventsPage'
import EventsDetailsPage from './pages/EventsDetailsPage'
import CreateAccountPage from './pages/CreateAccountPage'
import ManagePage from './pages/ManagePage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePageStudents'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/evento/:id" element={<EventsDetailsPage />} />
        <Route path="/criar-conta" element={<CreateAccountPage />} />
        <Route path="/gerir" element={<ManagePage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/homestudents" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App