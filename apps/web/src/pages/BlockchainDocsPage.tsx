import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function BlockchainDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blockchain Implementation</h1>
          <p className="text-xl text-gray-600">
            How blockchain technology is implemented in this voting system
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#overview" className="text-blue-600 hover:underline">1. Project Overview</a></li>
            <li><a href="#architecture" className="text-blue-600 hover:underline">2. Architecture</a></li>
            <li><a href="#block-class" className="text-blue-600 hover:underline">3. Block Class Implementation</a></li>
            <li><a href="#blockchain-class" className="text-blue-600 hover:underline">4. Blockchain Class Implementation</a></li>
            <li><a href="#data-structure" className="text-blue-600 hover:underline">5. Vote Data Structure</a></li>
            <li><a href="#mining" className="text-blue-600 hover:underline">6. Proof-of-Work Mining</a></li>
            <li><a href="#validation" className="text-blue-600 hover:underline">7. Chain Validation</a></li>
            <li><a href="#api-integration" className="text-blue-600 hover:underline">8. API Integration</a></li>
            <li><a href="#vote-flow" className="text-blue-600 hover:underline">9. Vote Recording Flow</a></li>
            <li><a href="#results" className="text-blue-600 hover:underline">10. Results Calculation</a></li>
            <li><a href="#security" className="text-blue-600 hover:underline">11. Security Features</a></li>
          </ul>
        </Card>

        {/* Section 1: Overview */}
        <section id="overview" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">1. Project Overview</h2>
            <p className="text-gray-700 mb-4">
              This voting system uses a custom blockchain implementation built in TypeScript. The blockchain is located in the <code className="bg-gray-100 px-2 py-1 rounded">packages/blockchain/</code> directory and consists of two main classes:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
              <p className="font-semibold text-blue-900 mb-2">File Structure:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-1 font-mono text-sm">
                <li>packages/blockchain/src/Block.ts - Individual block implementation</li>
                <li>packages/blockchain/src/Blockchain.ts - Blockchain management</li>
                <li>apps/api/src/services/blockchain.ts - API service layer</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Every vote cast in the system is stored as a block in the blockchain, making it immutable and transparent.
            </p>
          </Card>
        </section>

        {/* Section 2: Architecture */}
        <section id="architecture" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">2. Architecture</h2>
            <p className="text-gray-700 mb-4">
              The blockchain architecture follows a three-layer design:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-600 pl-4 bg-purple-50 p-4 rounded-r">
                <h3 className="font-semibold text-lg mb-2">Layer 1: Core Blockchain (packages/blockchain)</h3>
                <p className="text-gray-700">Contains the Block and Blockchain classes with cryptographic functions, mining, and validation logic.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4 bg-blue-50 p-4 rounded-r">
                <h3 className="font-semibold text-lg mb-2">Layer 2: Blockchain Service (apps/api/src/services)</h3>
                <p className="text-gray-700">Provides business logic for adding votes, calculating results, and validating the chain.</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4 bg-green-50 p-4 rounded-r">
                <h3 className="font-semibold text-lg mb-2">Layer 3: API Routes (apps/api/src/routes)</h3>
                <p className="text-gray-700">Exposes HTTP endpoints for frontend interaction with the blockchain.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 3: Block Class */}
        <section id="block-class" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">3. Block Class Implementation</h2>
            <p className="text-gray-700 mb-4">
              Each block in the chain is an instance of the Block class with the following properties:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`export class Block {
  public hash: string;
  public nonce: number = 0;

  constructor(
    public index: number,        // Position in chain
    public timestamp: number,    // When block was created
    public data: BlockData,      // Vote information
    public previousHash: string  // Link to previous block
  ) {
    this.hash = this.calculateHash();
  }
}`}
              </pre>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
              <p className="font-semibold text-yellow-900 mb-2">Key Methods:</p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li><strong>calculateHash()</strong> - Generates SHA-256 hash from block data</li>
                <li><strong>mineBlock(difficulty)</strong> - Performs proof-of-work mining</li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Section 4: Blockchain Class */}
        <section id="blockchain-class" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">4. Blockchain Class Implementation</h2>
            <p className="text-gray-700 mb-4">
              The Blockchain class manages the entire chain with these key methods:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor(difficulty: number = 2) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
  }

  // Create the first block
  private createGenesisBlock(): Block {
    return new Block(0, Date.now(), {
      electionId: 'genesis',
      candidateId: 'genesis',
      voterHash: 'genesis',
      timestamp: Date.now()
    }, '0');
  }

  // Add new vote block
  addBlock(data: BlockData): Block {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }
}`}
              </pre>
            </div>
          </Card>
        </section>

        {/* Section 5: Data Structure */}
        <section id="data-structure" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">5. Vote Data Structure</h2>
            <p className="text-gray-700 mb-4">
              Each block stores vote data using the BlockData interface:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`export interface BlockData {
  electionId: string;    // Which election
  candidateId: string;   // Which candidate received the vote
  voterHash: string;     // Hashed voter ID (for anonymity)
  timestamp: number;     // When vote was cast
}`}
              </pre>
            </div>
            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <p className="font-semibold text-green-900 mb-2">Privacy Protection:</p>
              <p className="text-green-800">
                The voter's identity is hashed using SHA-256 before being stored in the blockchain, ensuring vote anonymity while preventing double-voting.
              </p>
            </div>
          </Card>
        </section>

        {/* Section 6: Mining */}
        <section id="mining" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">6. Proof-of-Work Mining</h2>
            <p className="text-gray-700 mb-4">
              Before a block is added to the chain, it must be "mined" using proof-of-work:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`mineBlock(difficulty: number): void {
  const target = Array(difficulty + 1).join('0');
  
  // Keep trying until hash starts with required zeros
  while (this.hash.substring(0, difficulty) !== target) {
    this.nonce++;
    this.hash = this.calculateHash();
  }
  
  console.log(\`Block mined: \${this.hash}\`);
}`}
              </pre>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <p className="font-semibold text-blue-900 mb-2">Mining Configuration:</p>
              <p className="text-blue-800 mb-2">
                Difficulty is set to <strong>4</strong> by default (configurable via BLOCKCHAIN_DIFFICULTY env variable)
              </p>
              <p className="text-blue-800">
                This means the hash must start with 4 zeros (e.g., "0000abc123..."), requiring computational work to find.
              </p>
            </div>
          </Card>
        </section>

        {/* Section 7: Validation */}
        <section id="validation" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">7. Chain Validation</h2>
            <p className="text-gray-700 mb-4">
              The blockchain validates its integrity by checking three conditions for each block:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`isChainValid(): boolean {
  for (let i = 1; i < this.chain.length; i++) {
    const currentBlock = this.chain[i];
    const previousBlock = this.chain[i - 1];

    // 1. Verify current block's hash is correct
    if (currentBlock.hash !== currentBlock.calculateHash()) {
      return false;
    }

    // 2. Verify link to previous block
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    // 3. Verify proof of work
    const target = Array(this.difficulty + 1).join('0');
    if (currentBlock.hash.substring(0, this.difficulty) !== target) {
      return false;
    }
  }
  return true;
}`}
              </pre>
            </div>
            <p className="text-gray-700">
              If any block is tampered with, the validation will fail, making the blockchain tamper-evident.
            </p>
          </Card>
        </section>

        {/* Section 8: API Integration */}
        <section id="api-integration" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">8. API Integration</h2>
            <p className="text-gray-700 mb-4">
              The BlockchainService class wraps the blockchain for use in the API:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`class BlockchainService {
  private blockchain: Blockchain;

  constructor() {
    this.blockchain = new Blockchain(config.blockchain.difficulty);
  }

  // Add a vote to the blockchain
  addVote(vote: Vote): void {
    this.blockchain.addBlock({
      type: 'vote',
      electionId: vote.electionId,
      candidateId: vote.candidateId,
      voterId: vote.hashedVoterId,
      timestamp: vote.timestamp,
    });
  }

  // Get the entire chain
  getChain() {
    return this.blockchain.getChain();
  }

  // Verify integrity
  isChainValid(): boolean {
    return this.blockchain.isChainValid();
  }
}`}
              </pre>
            </div>
          </Card>
        </section>

        {/* Section 9: Vote Flow */}
        <section id="vote-flow" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">9. Vote Recording Flow</h2>
            <p className="text-gray-700 mb-4">
              When a user casts a vote, the following process occurs:
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-lg">User Submits Vote</h3>
                  <p className="text-gray-700">Frontend sends POST request to /api/votes with election ID and candidate ID</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-lg">API Validates Request</h3>
                  <p className="text-gray-700">Checks authentication, election status, and prevents double-voting</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-lg">Hash Voter ID</h3>
                  <p className="text-gray-700">Voter's ID is hashed with SHA-256 for anonymity</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-lg">Create Block</h3>
                  <p className="text-gray-700">New block is created with vote data and linked to previous block</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <h3 className="font-semibold text-lg">Mine Block</h3>
                  <p className="text-gray-700">Proof-of-work mining finds valid hash (starts with 4 zeros)</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                <div>
                  <h3 className="font-semibold text-lg">Add to Chain</h3>
                  <p className="text-gray-700">Block is permanently added to the blockchain</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 10: Results */}
        <section id="results" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">10. Results Calculation</h2>
            <p className="text-gray-700 mb-4">
              Election results are calculated directly from the blockchain:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
              <pre className="text-sm">
{`// Count votes for a specific candidate
getVoteCount(electionId: string, candidateId: string): number {
  return this.chain.filter(
    block => 
      block.data.electionId === electionId && 
      block.data.candidateId === candidateId
  ).length;
}

// Get total votes in an election
getTotalVotes(electionId: string): number {
  return this.chain.filter(
    block => 
      block.data.electionId === electionId && 
      block.data.candidateId !== 'genesis'
  ).length;
}

// Get all candidates who received votes
getCandidatesWithVotes(electionId: string): string[] {
  const candidates = new Set<string>();
  this.chain.forEach(block => {
    if (block.data.electionId === electionId && 
        block.data.candidateId !== 'genesis') {
      candidates.add(block.data.candidateId);
    }
  });
  return Array.from(candidates);
}`}
              </pre>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
              <p className="font-semibold text-purple-900 mb-2">Real-Time Results:</p>
              <p className="text-purple-800">
                Since results are calculated from the blockchain, they are always accurate and up-to-date. No separate database is needed for vote counting.
              </p>
            </div>
          </Card>
        </section>

        {/* Section 11: Security */}
        <section id="security" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">11. Security Features</h2>
            <p className="text-gray-700 mb-4">
              The blockchain implementation provides multiple layers of security:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r">
                <h3 className="font-semibold text-red-900 mb-2">🔒 Immutability</h3>
                <p className="text-red-800 text-sm">
                  Once a vote is recorded, it cannot be changed or deleted. Any tampering breaks the chain validation.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r">
                <h3 className="font-semibold text-blue-900 mb-2">🔗 Cryptographic Linking</h3>
                <p className="text-blue-800 text-sm">
                  Each block contains the hash of the previous block, creating an unbreakable chain.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r">
                <h3 className="font-semibold text-green-900 mb-2">🎭 Voter Anonymity</h3>
                <p className="text-green-800 text-sm">
                  Voter IDs are hashed before storage, protecting voter privacy while preventing double-voting.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r">
                <h3 className="font-semibold text-yellow-900 mb-2">⛏️ Proof-of-Work</h3>
                <p className="text-yellow-800 text-sm">
                  Mining requirement makes it computationally expensive to create fake blocks.
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r">
                <h3 className="font-semibold text-purple-900 mb-2">✅ Continuous Validation</h3>
                <p className="text-purple-800 text-sm">
                  The entire chain can be validated at any time to detect tampering.
                </p>
              </div>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r">
                <h3 className="font-semibold text-indigo-900 mb-2">📊 Transparency</h3>
                <p className="text-indigo-800 text-sm">
                  All votes are visible in the blockchain explorer, ensuring election transparency.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Configuration:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>Mining Difficulty: 4 (requires hash to start with "0000")</li>
                <li>Hash Algorithm: SHA-256</li>
                <li>Block Time: Variable (depends on mining)</li>
                <li>Genesis Block: Automatically created on initialization</li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
