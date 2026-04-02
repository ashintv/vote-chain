import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { Election, ElectionResults } from '@voting-chain/types';
import { WebSocketEvent } from '@voting-chain/types';

export default function ResultsPage() {
  const { id: electionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!electionId) return;

    const loadResultsData = async () => {
      try {
        setLoading(true);
        setError('');

        const [electionData, resultsData] = await Promise.all([
          api.getElection(electionId),
          api.getResults(electionId),
        ]);

        setElection(electionData);
        setResults(resultsData);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    loadResultsData();

    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket connected to results page');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (
        ws.readyState === WebSocket.OPEN &&
        data.event === WebSocketEvent.VOTE_CAST &&
        data.payload?.electionId === electionId
      ) {
        console.log('Vote cast event received, refreshing results');
        loadResultsData();
      }

      if (
        ws.readyState === WebSocket.OPEN &&
        data.event === WebSocketEvent.RESULTS_UPDATED &&
        data.payload?.electionId === electionId
      ) {
        console.log('Results updated event received, refreshing results');
        loadResultsData();
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


  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      ended: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.ended;
  };

  const calculatePercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !election || !results) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <p className="text-destructive">{error || 'Results not found'}</p>
          <Button onClick={() => navigate('/elections')} className="mt-4">
            Back to Elections
          </Button>
        </Card>
      </div>
    );
  }

  const sortedCandidates = [...results.candidates].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sortedCandidates[0];
  const isEnded = election.status === 'closed' || election.status === 'finalized';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/elections/${electionId}`)}
          className="mb-4"
        >
          ← Back to Election Details
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Election Results</h1>
            <p className="text-muted-foreground">{election.title}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
              election.status
            )}`}
          >
            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
            <p className="text-3xl font-bold">{results.totalVotes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Candidates</p>
            <p className="text-3xl font-bold">{results.candidates.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Election Status</p>
            <p className="text-3xl font-bold capitalize">{election.status}</p>
          </div>
        </div>
      </Card>

      {/* Winner Card (only show if election ended and there are votes) */}
      {isEnded && results.totalVotes > 0 && (
        <Card className="p-6 mb-6 border-2 border-primary">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Winner</p>
              <h2 className="text-2xl font-bold">{winner.candidate.name}</h2>
              <p className="text-sm text-muted-foreground">{winner.candidate.party}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{
                  width: `${calculatePercentage(winner.voteCount, results.totalVotes)}%`,
                }}
              />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {calculatePercentage(winner.voteCount, results.totalVotes)}%
              </p>
              <p className="text-sm text-muted-foreground">{winner.voteCount} votes</p>
            </div>
          </div>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Candidates</h2>
        {sortedCandidates.map((candidate, index) => (
          <Card key={candidate.candidate.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center font-bold text-lg">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{candidate.candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.candidate.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {calculatePercentage(candidate.voteCount, results.totalVotes)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {candidate.voteCount} {candidate.voteCount === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        index === 0 ? 'bg-primary' : 'bg-primary/60'
                      }`}
                      style={{
                        width: `${calculatePercentage(candidate.voteCount, results.totalVotes)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No votes message */}
      {results.totalVotes === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No votes have been cast yet.</p>
        </Card>
      )}

      {/* Real-time indicator */}
      {election.status === 'active' && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Results update in real-time</span>
        </div>
      )}
    </div>
  );
}

// Made with Bob
