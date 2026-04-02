import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export default function CreateElectionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Election title is required';
    }
    if (!formData.description.trim()) {
      return 'Election description is required';
    }
    if (!formData.startDate) {
      return 'Start date is required';
    }
    if (!formData.endDate) {
      return 'End date is required';
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();

    if (start < now) {
      return 'Start date must be in the future';
    }
    if (end <= start) {
      return 'End date must be after start date';
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

      const election = await api.createElection({
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startDate),
        endTime: new Date(formData.endDate),
      });

      navigate(`/elections/${election.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const getMinStartDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinEndDate = () => {
    if (!formData.startDate) return getMinStartDate();
    const start = new Date(formData.startDate);
    start.setHours(start.getHours() + 1);
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
    return start.toISOString().slice(0, 16);
  };

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
        <h1 className="text-3xl font-bold mb-2">Create New Election</h1>
        <p className="text-muted-foreground">
          Set up a new election with title, description, and voting period
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Election Title *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Student Council Election 2024"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              A clear, descriptive title for the election
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose and details of this election..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide context and information about the election
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium mb-2"
              >
                Start Date & Time *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                min={getMinStartDate()}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                When voting begins
              </p>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                End Date & Time *
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                min={getMinEndDate()}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                When voting ends
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Next Steps
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Create the election</li>
              <li>2. Register candidates for this election</li>
              <li>3. Share election details with voters</li>
              <li>4. Monitor results in real-time</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating Election...' : 'Create Election'}
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
        <h2 className="text-lg font-semibold mb-3">Election Guidelines</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Elections must have a future start date and an end date after the
              start date
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Candidates must be registered before the election starts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Voters can only vote during the active election period</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              All votes are recorded on the blockchain and cannot be modified
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Results are available in real-time during and after voting</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

// Made with Bob
