import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SchedulePage from './pages/SchedulePage'
import StudiosPage from './pages/StudiosPage'
import ManageStudiosPage from './pages/ManageStudiosPage'
import ProfessorStatsPage from './pages/ProfessorStatsPage'
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
import ProfessorCoachingPage from './pages/ProfessorCoachingPage'
import AvailableLessonsPage from './pages/AvailableLessonsPage'
import CoachingBookingPage from './pages/CoachingBookingPage'
import CoachingSessionsPage from './pages/CoachingSessionsPage'
import CreateCostumePage from './pages/CreateCostumePage'
import CostumesPage from './pages/CostumesPage'
import FigurinosListPage from './pages/FigurinosListPage'
import CostumeDetailPage from './pages/CostumeDetailPage'
import ProfessorAvailabilityPage from './pages/ProfessorAvailabilityPage'
import CoachingSessionAlunosPage from './pages/CoachingSessionAlunosPage'
import AttendancePage from './pages/AttendancePage'
import AttendanceDetailPage from './pages/AttendanceDetailPage'
import PedidosRecebidosPage from './pages/PedidosRecebidosPage'
import MyPedidosPage from './pages/MyPedidosPage'
import MeusFigurinosPage from './pages/MeusFigurinosPage'
import CriarTagsPage from './pages/CriarTagsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<PasswordRecoveryPage />} />
        <Route path="/professor" element={<ProfessorDashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/studios" element={<StudiosPage />} />
        <Route path="/manage-studios" element={<ManageStudiosPage />} />
        <Route path="/stats-professor" element={<ProfessorStatsPage />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/evento/:id" element={<EventsDetailsPage />} />
        <Route path="/criar-conta" element={<CreateAccountPage />} />
        <Route path="/gerir" element={<ManagePage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/homestudents" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/coaching" element={<ProfessorCoachingPage />} />
        <Route path="/coaching-requests" element={<CoachingRequestsManagePage />} />
        <Route path="/meus-pedidos" element={<AvailableLessonsPage />} />
        <Route path="/aulas-disponiveis" element={<CoachingBookingPage />} />
        <Route path="/sessoes-coaching" element={<CoachingSessionsPage />} />
        <Route path="/criar-figurino" element={<CreateCostumePage />} />
        <Route path="/figurinos" element={<FigurinosListPage />} />
        <Route path="/inventario" element={<CostumesPage />} />
        <Route path="/figurinos/:id" element={<CostumeDetailPage />} />
        <Route path="/inserir-horario" element={<ProfessorAvailabilityPage />} />
        <Route path="/coaching/sessao/:id" element={<CoachingSessionAlunosPage />} />
        <Route path="/gestao-presencas" element={<AttendancePage />} />
        <Route path="/gestao-presencas/:sessaoId" element={<AttendanceDetailPage />} />
        <Route path="/pedidos-recebidos" element={<PedidosRecebidosPage />} />
        <Route path="/meus-pedidos-figurinos" element={<MyPedidosPage />} />
        <Route path="/meus-figurinos" element={<MeusFigurinosPage />} />
        <Route path="/criar-tags" element={<CriarTagsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App