import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">User Guide</h1>
          <p className="text-xl text-gray-600">
            Complete guide to using the Blockchain Voting System
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#getting-started" className="text-blue-600 hover:underline">1. Getting Started</a></li>
            <li><a href="#registration" className="text-blue-600 hover:underline">2. Registration</a></li>
            <li><a href="#login" className="text-blue-600 hover:underline">3. Login</a></li>
            <li><a href="#browsing-elections" className="text-blue-600 hover:underline">4. Browsing Elections</a></li>
            <li><a href="#casting-vote" className="text-blue-600 hover:underline">5. Casting Your Vote</a></li>
            <li><a href="#vote-receipt" className="text-blue-600 hover:underline">6. Understanding Your Vote Receipt</a></li>
            <li><a href="#viewing-results" className="text-blue-600 hover:underline">7. Viewing Results</a></li>
            <li><a href="#blockchain-explorer" className="text-blue-600 hover:underline">8. Using the Blockchain Explorer</a></li>
            <li><a href="#security" className="text-blue-600 hover:underline">9. Security Best Practices</a></li>
            <li><a href="#faq" className="text-blue-600 hover:underline">10. FAQ</a></li>
          </ul>
        </Card>

        {/* Section 1: Getting Started */}
        <section id="getting-started" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">1. Getting Started</h2>
            <p className="text-gray-700 mb-4">
              Welcome to the Blockchain Voting System! This platform uses blockchain technology to ensure your vote is secure, transparent, and immutable.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
              <p className="font-semibold text-blue-900">What you'll need:</p>
              <ul className="list-disc list-inside mt-2 text-blue-800">
                <li>A valid email address</li>
                <li>A secure password</li>
                <li>Internet connection</li>
                <li>Modern web browser (Chrome, Firefox, Safari, or Edge)</li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Section 2: Registration */}
        <section id="registration" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">2. Registration</h2>
            <p className="text-gray-700 mb-4">
              To participate in elections, you must first create an account.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Step-by-Step:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click the "Register" button on the homepage</li>
                  <li>Fill in your full name</li>
                  <li>Enter a valid email address</li>
                  <li>Create a strong password (minimum 8 characters)</li>
                  <li>Confirm your password</li>
                  <li>Click "Register"</li>
                </ol>
              </div>
              <div className="bg-green-50 border-l-4 border-green-600 p-4">
                <p className="font-semibold text-green-900">✓ What happens next:</p>
                <ul className="list-disc list-inside mt-2 text-green-800">
                  <li>A unique Voter ID is generated for you</li>
                  <li>Your password is securely hashed (never stored in plain text)</li>
                  <li>You're automatically logged in</li>
                  <li>You're redirected to the Elections page</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 3: Login */}
        <section id="login" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">3. Login</h2>
            <p className="text-gray-700 mb-4">
              If you already have an account, you can log in to access the voting system.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">How to Login:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click the "Login" button</li>
                  <li>Enter your registered email address</li>
                  <li>Enter your password</li>
                  <li>Click "Login"</li>
                </ol>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
                <p className="font-semibold text-yellow-900">⚠️ Security Note:</p>
                <p className="mt-2 text-yellow-800">
                  Your session is secured with JWT (JSON Web Token) authentication. The token expires after 24 hours for your security.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Browsing Elections */}
        <section id="browsing-elections" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">4. Browsing Elections</h2>
            <p className="text-gray-700 mb-4">
              Once logged in, you can view all available elections.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Election Information:</h3>
                <p className="text-gray-700 mb-2">Each election card shows:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Title:</strong> Name of the election</li>
                  <li><strong>Description:</strong> Details about the election</li>
                  <li><strong>Status:</strong> Upcoming, Active, or Completed</li>
                  <li><strong>Start Date:</strong> When voting begins</li>
                  <li><strong>End Date:</strong> When voting closes</li>
                  <li><strong>Total Votes:</strong> Number of votes cast</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Election Status:</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                      Upcoming
                    </span>
                    <span className="text-gray-700">Voting hasn't started yet</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                      Active
                    </span>
                    <span className="text-gray-700">You can vote now</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                      Completed
                    </span>
                    <span className="text-gray-700">Voting has ended</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 5: Casting Vote */}
        <section id="casting-vote" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">5. Casting Your Vote</h2>
            <p className="text-gray-700 mb-4">
              Voting is simple and secure. Here's how to cast your vote:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Voting Process:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click on an active election</li>
                  <li>Review all candidates and their information</li>
                  <li>Click "Vote Now" on the election page</li>
                  <li>Select your preferred candidate</li>
                  <li>Review your selection</li>
                  <li>Click "Submit Vote"</li>
                  <li>Confirm your vote</li>
                </ol>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                <p className="font-semibold text-blue-900">🔒 What happens when you vote:</p>
                <ul className="list-disc list-inside mt-2 text-blue-800 space-y-1">
                  <li>Your vote is encrypted and hashed</li>
                  <li>A new block is mined on the blockchain</li>
                  <li>Your voter ID is hashed for anonymity</li>
                  <li>The vote is permanently recorded</li>
                  <li>You receive a vote receipt</li>
                  <li>You cannot vote again in the same election</li>
                </ul>
              </div>
              <div className="bg-red-50 border-l-4 border-red-600 p-4">
                <p className="font-semibold text-red-900">⚠️ Important:</p>
                <ul className="list-disc list-inside mt-2 text-red-800">
                  <li>You can only vote once per election</li>
                  <li>Votes cannot be changed after submission</li>
                  <li>Make sure you select the correct candidate</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 6: Vote Receipt */}
        <section id="vote-receipt" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">6. Understanding Your Vote Receipt</h2>
            <p className="text-gray-700 mb-4">
              After voting, you receive a receipt that proves your vote was recorded on the blockchain.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Receipt Information:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Receipt ID:</strong> Unique identifier for your vote</li>
                  <li><strong>Block Number:</strong> Which block contains your vote</li>
                  <li><strong>Block Hash:</strong> Cryptographic proof of the block</li>
                  <li><strong>Timestamp:</strong> When your vote was recorded</li>
                  <li><strong>Transaction Hash:</strong> Unique hash of your vote transaction</li>
                </ul>
              </div>
              <div className="bg-green-50 border-l-4 border-green-600 p-4">
                <p className="font-semibold text-green-900">✓ How to use your receipt:</p>
                <ul className="list-disc list-inside mt-2 text-green-800">
                  <li>Save the receipt ID for your records</li>
                  <li>Use it to verify your vote on the blockchain</li>
                  <li>Share the block hash to prove voting occurred</li>
                  <li>Check the blockchain explorer with your receipt details</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 7: Viewing Results */}
        <section id="viewing-results" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">7. Viewing Results</h2>
            <p className="text-gray-700 mb-4">
              Election results are updated in real-time as votes are cast.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Results Page Shows:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Vote Counts:</strong> Number of votes per candidate</li>
                  <li><strong>Percentages:</strong> Vote share for each candidate</li>
                  <li><strong>Total Votes:</strong> Overall participation</li>
                  <li><strong>Winner:</strong> Leading candidate (if election ended)</li>
                  <li><strong>Real-time Updates:</strong> Live vote counting via WebSocket</li>
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                <p className="font-semibold text-blue-900">📊 Result Features:</p>
                <ul className="list-disc list-inside mt-2 text-blue-800">
                  <li>Results update automatically without page refresh</li>
                  <li>All results are verifiable on the blockchain</li>
                  <li>Historical results remain accessible</li>
                  <li>Charts and graphs for easy visualization</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 8: Blockchain Explorer */}
        <section id="blockchain-explorer" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">8. Using the Blockchain Explorer</h2>
            <p className="text-gray-700 mb-4">
              The Blockchain Explorer lets you view and verify all blocks in the voting blockchain.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Explorer Features:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>View All Blocks:</strong> See every block in the chain</li>
                  <li><strong>Block Details:</strong> Expand blocks to see vote data</li>
                  <li><strong>Chain Validation:</strong> Verify blockchain integrity</li>
                  <li><strong>Block Statistics:</strong> Total blocks, genesis block, latest block</li>
                  <li><strong>Hash Information:</strong> View cryptographic hashes</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">How to Verify Your Vote:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Go to the Blockchain Explorer</li>
                  <li>Find the block number from your receipt</li>
                  <li>Click to expand that block</li>
                  <li>Verify the block hash matches your receipt</li>
                  <li>Check the timestamp</li>
                  <li>Click "Validate Chain" to ensure integrity</li>
                </ol>
              </div>
              <div className="bg-green-50 border-l-4 border-green-600 p-4">
                <p className="font-semibold text-green-900">✓ Chain Validation:</p>
                <p className="mt-2 text-green-800">
                  The "Validate Chain" button checks that all blocks are properly linked and no data has been tampered with. A valid chain ensures all votes are authentic.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 9: Security */}
        <section id="security" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">9. Security Best Practices</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Password Security:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Use a strong, unique password</li>
                  <li>Never share your password</li>
                  <li>Don't use the same password on multiple sites</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Account Security:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Log out when using shared computers</li>
                  <li>Don't share your voter ID</li>
                  <li>Keep your vote receipt private</li>
                  <li>Report suspicious activity immediately</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vote Privacy:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Your voter ID is hashed on the blockchain</li>
                  <li>Votes cannot be traced back to you</li>
                  <li>Only you know who you voted for</li>
                  <li>The system ensures vote anonymity</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 10: FAQ */}
        <section id="faq" className="mb-12">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">10. Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: Can I change my vote after submitting?
                </h3>
                <p className="text-gray-700">
                  A: No. Once a vote is recorded on the blockchain, it cannot be changed or deleted. This ensures vote integrity and prevents manipulation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: How do I know my vote was counted?
                </h3>
                <p className="text-gray-700">
                  A: You receive a vote receipt with a block number and hash. You can verify this on the Blockchain Explorer to confirm your vote is recorded.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: Is my vote anonymous?
                </h3>
                <p className="text-gray-700">
                  A: Yes. Your voter ID is cryptographically hashed before being stored on the blockchain, making it impossible to trace votes back to individual voters.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: What if I forget my password?
                </h3>
                <p className="text-gray-700">
                  A: Currently, password reset is not implemented. Make sure to remember your password or store it securely in a password manager.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: Can I vote from my mobile device?
                </h3>
                <p className="text-gray-700">
                  A: Yes! The system is fully responsive and works on smartphones, tablets, and desktop computers.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: How long does it take to cast a vote?
                </h3>
                <p className="text-gray-700">
                  A: Voting takes a few seconds. The blockchain mining process (proof-of-work) may take 10-30 seconds depending on the difficulty setting.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Q: What happens if the system goes down?
                </h3>
                <p className="text-gray-700">
                  A: All votes are permanently stored on the blockchain. Even if the system goes down, no votes are lost. The blockchain can be restored and voting can continue.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <Card className="p-8 bg-blue-600 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Vote?</h2>
          <p className="mb-6">
            Start participating in secure, transparent elections today!
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Register Now
              </Button>
            </Link>
            <Link to="/blockchain-docs">
              <Button variant="outline" className="border-white text-white hover:bg-blue-700">
                Learn About Blockchain
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob
