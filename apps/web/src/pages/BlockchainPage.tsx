import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { BlockInfo } from '@voting-chain/types';

export default function BlockchainPage() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

  useEffect(() => {
    loadBlockchain();
  }, []);

  const loadBlockchain = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getBlockchain();
      setBlocks(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load blockchain');
    } finally {
      setLoading(false);
    }
  };

  const validateBlockchain = async () => {
    try {
      setValidating(true);
      setError('');
      const result = await api.validateBlockchain();
      setIsValid(result.isValid);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to validate blockchain');
    } finally {
      setValidating(false);
    }
  };

  const toggleBlock = (index: number) => {
    setExpandedBlock(expandedBlock === index ? null : index);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatHash = (hash: string | undefined, length: number = 16) => {
    if (!hash) return 'N/A';
    if (hash.length <= length) return hash;
    return `${hash.substring(0, length)}...`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blockchain Explorer</h1>
            <p className="text-muted-foreground">
              View all blocks and validate chain integrity
            </p>
          </div>
          <Button onClick={validateBlockchain} disabled={validating}>
            {validating ? 'Validating...' : 'Validate Chain'}
          </Button>
        </div>

        {error && (
          <Card className="p-4 mb-4 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isValid !== null && (
          <Card
            className={`p-4 mb-4 ${
              isValid
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {isValid ? (
                <>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Blockchain is Valid
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      All blocks are properly linked and hashes are correct
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      Blockchain is Invalid
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Chain integrity has been compromised
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Blockchain Stats */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Blocks</p>
            <p className="text-3xl font-bold">{blocks.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Genesis Block</p>
            <p className="text-3xl font-bold">#{0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Latest Block</p>
            <p className="text-3xl font-bold">#{blocks.length - 1}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Chain Status</p>
            <p className="text-3xl font-bold">
              {isValid === null ? '?' : isValid ? '✓' : '✗'}
            </p>
          </div>
        </div>
      </Card>

      {/* Blocks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Blocks</h2>
        {blocks.map((block, index) => (
          <Card key={index} className="overflow-hidden">
            <button
              onClick={() => toggleBlock(index)}
              className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-lg">
                    #{index}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {index === 0 ? 'Genesis Block' : `Block ${index}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(block.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Hash</p>
                    <code className="text-xs">{formatHash(block.hash)}</code>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedBlock === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {expandedBlock === index && (
              <div className="border-t border-border p-6 bg-muted/30">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Block Hash
                    </p>
                    <code className="text-xs break-all bg-background p-2 rounded block">
                      {block.hash}
                    </code>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Previous Hash
                    </p>
                    <code className="text-xs break-all bg-background p-2 rounded block">
                      {block.previousHash}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Timestamp
                      </p>
                      <p className="text-sm">{formatTimestamp(block.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Nonce
                      </p>
                      <p className="text-sm font-mono">{block.nonce}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Block Data
                    </p>
                    {index === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Genesis block - No data
                      </p>
                    ) : (
                      <div className="bg-background p-4 rounded space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Election ID:</span>
                          <span className="font-mono">{block.data?.electionId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Candidate ID:</span>
                          <span className="font-mono">{block.data?.candidateId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Voter Hash:</span>
                          <code className="text-xs">
                            {formatHash(block.data?.voterHash, 12)}
                          </code>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Vote Timestamp:</span>
                          <span>{block.data?.timestamp ? formatTimestamp(block.data.timestamp) : 'N/A'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {index > 0 && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/elections/${block.data?.electionId}`)
                        }
                        disabled={!block.data?.electionId}
                      >
                        View Election
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {blocks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No blocks in the blockchain yet.</p>
        </Card>
      )}
    </div>
  );
}

// Made with Bob
