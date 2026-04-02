import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { Election, Candidate } from '@voting-chain/types';

export default function VotePage() {
  const { id: electionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState('');

  useEffect(() => {
    loadElectionData();
  }, [electionId]);

  const loadElectionData = async () => {
    if (!electionId) return;

    try {
      setLoading(true);
      setError('');

      const [electionData, candidatesData] = await Promise.all([
        api.getElection(electionId),
        api.getCandidates(electionId),
      ]);

      setElection(electionData);
      setCandidates(candidatesData);

      // Check if election is active
      const now = new Date();
      const start = new Date(electionData.startDate);
      const end = new Date(electionData.endDate);

      if (now < start) {
        setError('This election has not started yet.');
      } else if (now > end) {
        setError('This election has ended.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate || !electionId) return;

    try {
      setSubmitting(true);
      setError('');

      const response = await api.castVote({
        electionId,
        candidateId: selectedCandidate,
      });
      setVoteReceipt(response.receiptId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <p className="text-destructive">Election not found</p>
          <Button onClick={() => navigate('/elections')} className="mt-4">
            Back to Elections
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Vote Cast Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your vote has been recorded on the blockchain.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-medium mb-2">Vote Receipt:</p>
            <code className="text-xs break-all">{voteReceipt}</code>
            <p className="text-xs text-muted-foreground mt-2">
              Save this receipt to verify your vote later
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/elections/${electionId}/results`)}>
              View Results
            </Button>
            <Button variant="outline" onClick={() => navigate('/elections')}>
              Back to Elections
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/elections/${electionId}`)}
          className="mb-4"
        >
          ← Back to Election Details
        </Button>
        <h1 className="text-3xl font-bold mb-2">Cast Your Vote</h1>
        <p className="text-muted-foreground">{election.title}</p>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-destructive">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!error && (
        <>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select a Candidate</h2>
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCandidate === candidate.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {candidate.party}
                    </div>
                    {candidate.description && (
                      <p className="text-sm mt-2">{candidate.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Important Notice
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• You can only vote once in this election</li>
                <li>• Your vote is anonymous but verifiable</li>
                <li>• Once submitted, your vote cannot be changed</li>
                <li>• Save your vote receipt for verification</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmitVote}
              disabled={!selectedCandidate || submitting}
              className="w-full"
            >
              {submitting ? 'Submitting Vote...' : 'Submit Vote'}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}

// Made with Bob
