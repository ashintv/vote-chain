import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import type { Election } from '@voting-chain/types';
import { ElectionStatus } from '@voting-chain/types';

export default function RegisterCandidatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const authStore = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    description: '',
    electionId: (location.state as any)?.electionId || '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingElections, setLoadingElections] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoadingElections(true);
      const data = await api.getElections();
      // Filter to show only created elections created by the current user
      const myCreatedElections = data.filter(
        (election) =>
          election.status === ElectionStatus.CREATED &&
          election.createdBy === authStore.voter?.id
      );
      setElections(myCreatedElections);
      
      // If there's a pre-selected election from navigation state, verify it's owned by user
      if (formData.electionId) {
        const preSelected = myCreatedElections.find(e => e.id === formData.electionId);
        if (preSelected) {
          setSelectedElection(preSelected);
        } else {
          // Clear the pre-selected election if user doesn't own it
          setFormData(prev => ({ ...prev, electionId: '' }));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load elections');
    } finally {
      setLoadingElections(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Track selected election for permission checks
    if (name === 'electionId') {
      const election = elections.find(e => e.id === value);
      setSelectedElection(election || null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Candidate name is required';
    }
    if (!formData.party.trim()) {
      return 'Party affiliation is required';
    }
    if (!formData.electionId) {
      return 'Please select an election';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.registerCandidate({
        name: formData.name,
        party: formData.party,
        description: formData.description,
        electionId: formData.electionId,
      });

      navigate(`/elections/${formData.electionId}`);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Only the election creator can register candidates for this election');
      } else {
        setError(err.response?.data?.error || 'Failed to register candidate');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingElections) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/elections')}
          className="mb-4"
        >
          ← Back to Elections
        </Button>
        <h1 className="text-3xl font-bold mb-2">Register Candidate</h1>
        <p className="text-muted-foreground">
          Register a candidate for an upcoming election
        </p>
      </div>

      {elections.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Elections Available</h2>
          <p className="text-muted-foreground mb-6">
            You don't have any upcoming elections where you can register candidates.
            Only election creators can register candidates for their elections.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/elections/create')}>
              Create New Election
            </Button>
            <Button variant="outline" onClick={() => navigate('/elections')}>
              View All Elections
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ <strong>Creator Access:</strong> You can only register candidates for elections you created.
              The list below shows only your elections that are in the "Created" status.
            </p>
          </Card>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div>
              <label
                htmlFor="electionId"
                className="block text-sm font-medium mb-2"
              >
                Select Election *
              </label>
              <select
                id="electionId"
                name="electionId"
                value={formData.electionId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="">Choose an election...</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title} (Starts:{' '}
                    {new Date(election.startDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Only upcoming elections are available for registration
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Candidate Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Full name of the candidate
              </p>
            </div>

            <div>
              <label htmlFor="party" className="block text-sm font-medium mb-2">
                Party Affiliation *
              </label>
              <Input
                id="party"
                name="party"
                type="text"
                value={formData.party}
                onChange={handleChange}
                placeholder="e.g., Independent, Democratic Party, etc."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Political party or affiliation
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the candidate's platform, qualifications, or campaign message..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional information about the candidate
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Important Information
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Candidates can only be registered before the election starts</li>
                <li>• Once registered, candidate information cannot be modified</li>
                <li>• All candidate information will be visible to voters</li>
                <li>• Ensure all information is accurate before submitting</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Registering Candidate...' : 'Register Candidate'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/elections')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">Registration Guidelines</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Candidates must be registered before the election start date
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Provide accurate and complete information for voter transparency
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Multiple candidates can be registered for the same election
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Candidate information will be displayed on the voting page
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Once the election starts, no new candidates can be added
            </span>
          </li>
        </ul>
      </Card>
      </>
      )}
    </div>
  );
}

// Made with Bob
