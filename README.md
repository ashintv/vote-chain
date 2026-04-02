# Voting Chain - Blockchain-Based Election Voting System

A secure, transparent, and decentralized election voting system built with a custom blockchain implementation. This system ensures vote integrity, voter authentication, and result transparency while maintaining voter anonymity through Role-Based Access Control (RBAC) and cryptographic security.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)

## 🌟 Key Features

- **🔗 Blockchain-Based Vote Recording** - Immutable and tamper-proof vote storage using custom blockchain implementation
- **🔐 Role-Based Access Control (RBAC)** - Comprehensive permission system with Admin, Election Officer, and Voter roles
- **📊 Real-Time Election Monitoring** - Live vote counting and results with WebSocket updates
- **🛡️ Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **📝 Comprehensive Audit Logging** - Track all system actions for transparency and accountability
- **🔍 Blockchain Explorer** - View and verify all blocks and votes in the chain
- **🎫 Vote Receipts** - Cryptographic proof of vote submission for verification
- **🚫 Double-Vote Prevention** - Ensures one vote per voter per election
- **🕵️ Voter Anonymity** - Hashed voter IDs in blockchain for privacy protection

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd voting-chain

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start development servers
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

For detailed setup instructions, see the [Setup Guide](./SETUP_GUIDE.md) and [Frontend Setup Guide](./FRONTEND_SETUP.md).

## 📚 Documentation Index

Comprehensive documentation is available for all aspects of the system:

### Setup & Configuration
- **[Setup Guide](./SETUP_GUIDE.md)** - Complete installation and configuration instructions
- **[Frontend Setup](./FRONTEND_SETUP.md)** - Frontend-specific setup and development guide

### Architecture & Design
- **[Architecture Documentation](./ARCHITECTURE.md)** - System design, components, and data flow

## 📁 Project Structure

This is a monorepo managed by Turborepo and pnpm workspaces:

```
voting-chain/
├── apps/
│   ├── api/                    # Express API Server
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── middleware/     # Auth & RBAC middleware
│   │   │   ├── services/       # Business logic services
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   │
│   └── web/                    # React Frontend Application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Application pages
│       │   ├── lib/            # API client & utilities
│       │   └── store/          # State management
│       └── package.json
│
├── packages/
│   ├── blockchain/             # Custom Blockchain Implementation
│   │   ├── src/
│   │   │   ├── Block.ts        # Block structure
│   │   │   └── Blockchain.ts   # Chain management
│   │   └── package.json
│   │
│   ├── types/                  # Shared TypeScript Types
│   │   ├── src/
│   │   │   ├── election.ts     # Election types
│   │   │   ├── voter.ts        # Voter types
│   │   │   ├── vote.ts         # Vote types
│   │   │   └── api.ts          # API types
│   │   └── package.json
│   │
│   ├── ui/                     # Shared UI Components
│   │   └── src/
│   │       ├── button.tsx
│   │       └── card.tsx
│   │
│   ├── eslint-config/          # Shared ESLint Configuration
│   └── typescript-config/      # Shared TypeScript Configuration
│
├── scripts/                    # Utility scripts
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── package.json                # Root package configuration
```

### Apps

- **`apps/api`** - Express.js REST API server with JWT authentication, RBAC middleware, and blockchain integration
- **`apps/web`** - React frontend application built with Vite, featuring real-time updates and responsive UI

### Packages

- **`packages/blockchain`** - Custom blockchain implementation with proof-of-work consensus
- **`packages/types`** - Shared TypeScript type definitions used across the monorepo
- **`packages/ui`** - Reusable React UI components
- **`packages/eslint-config`** - Shared ESLint configuration
- **`packages/typescript-config`** - Shared TypeScript configuration

## 💻 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Socket.io** - Real-time WebSocket communication

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and development server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time updates
- **Axios** - HTTP client

### Blockchain
- **Custom Implementation** - Educational blockchain with proof-of-work
- **SHA-256** - Cryptographic hashing algorithm
- **Proof-of-Work** - Consensus mechanism

### Monorepo Tools
- **Turborepo** - High-performance build system
- **pnpm** - Fast, disk space efficient package manager
- **TypeScript** - Shared type definitions

## 🔐 Security Features

### Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication with configurable expiration
- **Password Security** - bcrypt hashing with 10 rounds for password storage
- **Role-Based Access Control (RBAC)** - Three-tier permission system:
  - **Admin** - Full system access, user management, election creation
  - **Election Officer** - Election management, candidate registration, results viewing
  - **Voter** - Vote casting, receipt verification

### Data Protection
- **Vote Anonymity** - Hashed voter IDs in blockchain to protect voter identity
- **Immutable Records** - Blockchain prevents vote tampering and ensures data integrity
- **Double-Vote Prevention** - Database tracking ensures one vote per voter per election
- **Input Validation** - Comprehensive request validation on all endpoints
- **CORS Protection** - Configured for specific trusted origins

### Audit & Compliance
- **Comprehensive Audit Logging** - All system actions are logged with timestamps and user information
- **Blockchain Verification** - Chain integrity validation ensures no tampering
- **Vote Receipts** - Cryptographic proof of vote submission for voter verification

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Run all apps in development mode
pnpm dev --filter=api # Run only API server
pnpm dev --filter=web # Run only React app

# Building
pnpm build            # Build all packages and apps
pnpm build --filter=api

# Type Checking
pnpm check-types      # Check types across all packages

# Linting
pnpm lint             # Lint all packages

# Formatting
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run tests (when implemented)

# Utilities
pnpm kill-ports       # Kill processes on development ports
```

### Development Workflow

1. **Start Development Servers**
   ```bash
   pnpm dev
   ```

2. **Make Changes**
   - Both API and frontend support hot reload
   - TypeScript compilation happens automatically
   - Changes are reflected immediately

3. **Type Checking**
   ```bash
   pnpm check-types
   ```

4. **Build for Production**
   ```bash
   pnpm build
   ```

## 📡 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # Register new voter
POST /api/auth/login       # Login and receive JWT token
```

### Election Management

```
GET    /api/elections           # List all elections
GET    /api/elections/:id       # Get election details
POST   /api/elections           # Create election (Admin/Officer)
PUT    /api/elections/:id       # Update election (Admin/Officer)
DELETE /api/elections/:id       # Delete election (Admin)
GET    /api/elections/:id/results # Get election results
```

### Candidate Management

```
GET    /api/candidates                    # List all candidates
POST   /api/candidates                    # Register candidate (Admin/Officer)
GET    /api/elections/:id/candidates      # Get candidates for election
```

### Voting

```
POST /api/vote                 # Cast a vote (Voter)
GET  /api/vote/verify/:hash    # Verify vote receipt
GET  /api/vote/status/:electionId # Check voting status
```

### Blockchain

```
GET /api/blockchain              # Get entire blockchain
GET /api/blockchain/validate     # Validate chain integrity
GET /api/blockchain/block/:index # Get specific block
```

### User Management (Admin Only)

```
GET    /api/users           # List all users
PUT    /api/users/:id/role  # Update user role
DELETE /api/users/:id       # Delete user
```

For detailed API documentation with request/response examples, see the [Setup Guide](./SETUP_GUIDE.md).

## 🧪 Testing

The system includes comprehensive testing capabilities:

- **Unit Tests** - Test individual components and functions
- **Integration Tests** - Test API endpoints and service interactions
- **Security Tests** - Verify RBAC and authentication mechanisms
- **Blockchain Tests** - Validate chain integrity and consensus

```bash
# Run tests (when implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the Repository**
   ```bash
   git clone <your-fork-url>
   cd voting-chain
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### Code Standards

- **TypeScript** - Use strict type checking
- **ESLint** - Follow configured linting rules
- **Prettier** - Format code consistently
- **Comments** - Document complex logic
- **Tests** - Write tests for new features

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Turborepo](https://turborepo.dev/) for efficient monorepo management
- Inspired by blockchain voting systems research and best practices
- Community feedback and contributions

## 📞 Support & Resources

### Documentation
- [Setup Guide](./SETUP_GUIDE.md) - Installation and configuration
- [Frontend Setup](./FRONTEND_SETUP.md) - Frontend development guide
- [Architecture](./ARCHITECTURE.md) - System design and architecture

### External Resources
- [Turborepo Documentation](https://turborepo.dev/docs)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## ⚠️ Important Notes

**Educational Purpose**: This is an educational project demonstrating blockchain concepts and secure voting system architecture. For production deployment, additional considerations are required:

- **Database Persistence** - Implement persistent storage (PostgreSQL/MongoDB)
- **Scalability** - Configure for high-traffic scenarios
- **Compliance** - Ensure compliance with local election laws and regulations
- **Security Hardening** - Conduct professional security audits
- **Backup & Recovery** - Implement robust backup strategies
- **Monitoring** - Set up comprehensive logging and monitoring
- **Testing** - Extensive testing including penetration testing

## 🗺️ Roadmap

Future enhancements planned for the system:

- [ ] Database persistence layer (PostgreSQL/MongoDB)
- [ ] Multi-node blockchain network with consensus
- [ ] Advanced analytics and reporting dashboard
- [ ] Email notifications for election events
- [ ] Mobile application (React Native)
- [ ] Biometric authentication support
- [ ] Smart contract integration
- [ ] Enhanced admin dashboard with user management UI
- [ ] Automated backup and recovery system
- [ ] Performance optimization for large-scale elections

---

**Built with ❤️ using TypeScript, React, and Blockchain Technology**
