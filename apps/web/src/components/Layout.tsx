import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';
import { Vote, LogOut, User, Home, Blocks } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, voter, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Vote className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Blockchain Voting</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link to="/elections">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Elections
                </Button>
              </Link>
              <Link to="/blockchain">
                <Button variant="ghost" size="sm">
                  <Blocks className="h-4 w-4 mr-2" />
                  Blockchain
                </Button>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{voter?.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Blockchain Voting System - Secure, Transparent, Immutable</p>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
