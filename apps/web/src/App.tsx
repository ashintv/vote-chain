import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ElectionsPage from './pages/ElectionsPage';
import ElectionDetailsPage from './pages/ElectionDetailsPage';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import BlockchainPage from './pages/BlockchainPage';
import CreateElectionPage from './pages/CreateElectionPage';
import RegisterCandidatePage from './pages/RegisterCandidatePage';
import UserGuidePage from './pages/UserGuidePage';
import BlockchainDocsPage from './pages/BlockchainDocsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public routes without layout */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/user-guide" element={<UserGuidePage />} />
      <Route path="/blockchain-docs" element={<BlockchainDocsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes with layout */}
      <Route element={<Layout />}>
        <Route path="/elections" element={<ElectionsPage />} />
        <Route path="/elections/:id" element={<ElectionDetailsPage />} />
        <Route
          path="/elections/:id/vote"
          element={
            <ProtectedRoute>
              <VotePage />
            </ProtectedRoute>
          }
        />
        <Route path="/elections/:id/results" element={<ResultsPage />} />
        <Route
          path="/elections/create"
          element={
            <ProtectedRoute>
              <CreateElectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/register"
          element={
            <ProtectedRoute>
              <RegisterCandidatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/blockchain" element={<BlockchainPage />} />
      </Route>
    </Routes>
  );
}

export default App;

// Made with Bob
