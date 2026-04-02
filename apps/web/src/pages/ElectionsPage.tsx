import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { electionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Users, Plus, TrendingUp } from 'lucide-react';
import type { Election } from '@voting-chain/types';
import { format } from 'date-fns';

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
    } catch (err: any) {
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      created: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      finalized: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.created}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-muted-foreground mt-1">
            Browse and participate in blockchain-secured elections
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/elections/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Election
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {elections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No elections yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Be the first to create an election on the blockchain
            </p>
            {isAuthenticated && (
              <Link to="/elections/create">
                <Button>Create First Election</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => (
            <Card key={election.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{election.title}</CardTitle>
                  {getStatusBadge(election.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {election.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(election.startDate), 'MMM d, yyyy')} -{' '}
                    {format(new Date(election.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to={`/elections/${election.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                {election.status === 'active' && isAuthenticated && (
                  <Link to={`/elections/${election.id}/vote`} className="flex-1">
                    <Button className="w-full">Vote Now</Button>
                  </Link>
                )}
                {(election.status === 'closed' || election.status === 'finalized' || election.status === 'active') && (
                  <Link to={`/elections/${election.id}/results`}>
                    <Button variant="ghost" size="sm">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Made with Bob
