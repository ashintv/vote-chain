import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { electionsApi, candidatesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Users, ArrowLeft, UserPlus, TrendingUp, Play, StopCircle, Shield } from 'lucide-react';
import type { Election, Candidate } from '@voting-chain/types';
import { WebSocketEvent } from '@voting-chain/types';
import { format } from 'date-fns';

export default function ElectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  useEffect(() => {
    if (!id) return;

    const loadElectionDetailsData = async () => {
      try {
        const [electionData, candidatesData] = await Promise.all([
          electionsApi.getById(id),
          candidatesApi.getByElection(id),
        ]);
        setElection(electionData);
        setCandidates(candidatesData);
        setError('');
      } catch (err) {
        console.error('Failed to load election data', err);
        setError('Failed to load election data');
      } finally {
        setLoading(false);
      }
    };

    loadElectionDetailsData();

    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket connected to election details page');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (
        ws.readyState === WebSocket.OPEN &&
        data.event === WebSocketEvent.ELECTION_STARTED &&
        data.payload?.electionId === id
      ) {
        console.log('Election started event received, refreshing data');
        loadElectionDetailsData();
      }

      if (
        ws.readyState === WebSocket.OPEN &&
        data.event === WebSocketEvent.ELECTION_ENDED &&
        data.payload?.electionId === id
      ) {
        console.log('Election ended event received, refreshing data');
        loadElectionDetailsData();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);


  const handleActivateElection = async () => {
    if (!election || !id) return;
    
    if (candidates.length === 0) {
      setError('Cannot activate election without candidates. Please register candidates first.');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      await electionsApi.updateStatus(id, 'active');
      const [electionData, candidatesData] = await Promise.all([
        electionsApi.getById(id),
        candidatesApi.getByElection(id),
      ]);
      setElection(electionData);
      setCandidates(candidatesData);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Only the election creator can activate this election');
      } else {
        setError(err.response?.data?.error || 'Failed to activate election');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseElection = async () => {
    if (!election || !id) return;

    try {
      setUpdating(true);
      setError('');
      await electionsApi.updateStatus(id, 'closed');
      const [electionData, candidatesData] = await Promise.all([
        electionsApi.getById(id),
        candidatesApi.getByElection(id),
      ]);
      setElection(electionData);
      setCandidates(candidatesData);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Only the election creator can close this election');
      } else {
        setError(err.response?.data?.error || 'Failed to close election');
      }
    } finally {
      setUpdating(false);
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.created}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Election not found</p>
        <Link to="/elections">
          <Button>Back to Elections</Button>
        </Link>
      </div>
    );
  }

  // Check if current user is the election creator
  const isCreator = authStore.voter?.id === election.createdBy;

  return (
    <div className="space-y-6">
      <Link to="/elections">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Elections
        </Button>
      </Link>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl">{election.title}</CardTitle>
                {isCreator && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Shield className="h-3 w-3" />
                    Creator
                  </span>
                )}
              </div>
              <CardDescription className="mt-2">{election.description}</CardDescription>
            </div>
            {getStatusBadge(election.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(election.startDate), 'PPP')} -{' '}
              {format(new Date(election.endDate), 'PPP')}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2" />
            <span>{candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Register Candidate - Only for creators on created elections */}
        {election.status === 'created' && isAuthenticated && isCreator && (
          <Link to="/candidates/register" state={{ electionId: id }}>
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Register Candidate
            </Button>
          </Link>
        )}

        {/* Activate Election - Only for creators on created elections with candidates */}
        {election.status === 'created' && isAuthenticated && isCreator && candidates.length > 0 && (
          <Button onClick={handleActivateElection} disabled={updating}>
            <Play className="h-4 w-4 mr-2" />
            {updating ? 'Activating...' : 'Activate Election'}
          </Button>
        )}

        {/* Vote Now - Only for active elections */}
        {election.status === 'active' && isAuthenticated && candidates.length > 0 && (
          <Link to={`/elections/${id}/vote`}>
            <Button size="lg">
              Cast Your Vote
            </Button>
          </Link>
        )}

        {/* Close Election - Only for creators on active elections */}
        {election.status === 'active' && isAuthenticated && isCreator && (
          <Button onClick={handleCloseElection} disabled={updating} variant="outline">
            <StopCircle className="h-4 w-4 mr-2" />
            {updating ? 'Closing...' : 'Close Election'}
          </Button>
        )}

        {/* View Results - Always available */}
        <Link to={`/elections/${id}/results`}>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </Link>
      </div>

      {/* Non-creator message for management actions */}
      {!isCreator && isAuthenticated && (election.status === 'created' || election.status === 'active') && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ℹ️ <strong>Note:</strong> Only the election creator can manage this election (register candidates, activate, or close).
            </p>
          </CardContent>
        </Card>
      )}

      {/* Candidates Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Candidates</h2>
        
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Candidates Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                {election.status === 'created'
                  ? isCreator
                    ? 'Register candidates to participate in this election'
                    : 'No candidates have been registered yet'
                  : 'No candidates were registered for this election'}
              </p>
              {election.status === 'created' && isAuthenticated && isCreator && (
                <Link to="/candidates/register" state={{ electionId: id }}>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register First Candidate
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardHeader>
                  <CardTitle>{candidate.name}</CardTitle>
                  {candidate.party && <CardDescription>{candidate.party}</CardDescription>}
                </CardHeader>
                {candidate.description && (
                  <CardContent>
                    <p className="text-sm">{candidate.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Status-specific messages */}
      {election.status === 'created' && candidates.length > 0 && isAuthenticated && isCreator && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Ready to start?</strong> Click &ldquo;Activate Election&rdquo; to begin the voting period.
            </p>
          </CardContent>
        </Card>
      )}

      {election.status === 'active' && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ <strong>Election is active!</strong> Voters can now cast their votes. Results update in real-time.
            </p>
          </CardContent>
        </Card>
      )}

      {(election.status === 'closed' || election.status === 'finalized') && (
        <Card className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              🏁 <strong>Election has ended.</strong> View the final results to see the outcome.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Made with Bob
