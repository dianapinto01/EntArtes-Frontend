import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SchedulePage from './pages/SchedulePage'
import EventsPage from './pages/EventsPage'
import EventsDetailsPage from './pages/EventsDetailsPage'
import CreateAccountPage from './pages/CreateAccountPage'
import ManagePage from './pages/ManagePage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePageStudents'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage'
import ProfessorDashboardPage from './pages/ProfessorDashboardPage'
import ReportPage from './pages/ReportPage'
import CoachingRequestsManagePage from './pages/CoachingRequestsManagePage'
import AvailableLessonsPage from './pages/AvailableLessonsPage'
import CoachingBookingPage from './pages/CoachingBookingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<PasswordRecoveryPage />} />
        <Route path="/professor" element={<ProfessorDashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/evento/:id" element={<EventsDetailsPage />} />
        <Route path="/criar-conta" element={<CreateAccountPage />} />
        <Route path="/gerir" element={<ManagePage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/homestudents" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/coaching" element={<CoachingRequestsManagePage />} />
        <Route path="/aulas-disponiveis" element={<AvailableLessonsPage />} />
        <Route path="/coaching-booking" element={<CoachingBookingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App