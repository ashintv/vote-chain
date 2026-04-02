# Frontend Service - Detailed Tasks

## Service Overview
React application with Vite, Tailwind CSS, and shadcn/ui for the voting system user interface. Includes voter authentication, election browsing, voting interface, results dashboard, and blockchain explorer.

**Location**: `apps/web/`

---

## Task 1: Setup React + Vite Project

### Subtasks:

1. **Remove Next.js Configuration**
   - Delete `next.config.js`, `next-env.d.ts`
   - Remove Next.js dependencies from package.json
   - Clear existing app directory structure

2. **Create Vite Configuration**
   - Create `vite.config.ts`
   - Configure React plugin
   - Set up path aliases (`@/`)
   - Configure proxy for API calls

3. **Update `package.json`**
   - Package name: `@voting-chain/web`
   - Dependencies:
     - `react`, `react-dom`, `react-router-dom`
     - `axios`, `socket.io-client`
     - `recharts` (for charts)
     - `@voting-chain/types`
   - Dev dependencies:
     - `vite`, `@vitejs/plugin-react`
     - `typescript`, `@types/react`, `@types/react-dom`
   - Scripts:
     - `dev`: `vite`
     - `build`: `tsc && vite build`
     - `preview`: `vite preview`

4. **Create `index.html`**
   - Root HTML file
   - Include div with id="root"
   - Link to main.tsx

5. **Create `src/main.tsx`**
   - React entry point
   - Render App component
   - Import global CSS

**Acceptance Criteria:**
- ✅ Vite dev server starts successfully
- ✅ React app renders without errors
- ✅ Hot module replacement works
- ✅ TypeScript compilation works

---

## Task 2: Setup Tailwind CSS

### Subtasks:

1. **Install Tailwind Dependencies**
   ```bash
   pnpm add -D tailwindcss postcss autoprefixer
   pnpm add -D tailwindcss-animate
   ```

2. **Initialize Tailwind**
   ```bash
   npx tailwindcss init -p
   ```

3. **Configure `tailwind.config.js`**
   - Set content paths
   - Configure theme extensions
   - Add CSS variables for colors
   - Add animations
   - Enable dark mode

4. **Create `src/index.css`**
   - Add Tailwind directives
   - Define CSS variables for theming
   - Add base styles
   - Configure dark mode colors

5. **Import CSS in `main.tsx`**
   ```typescript
   import './index.css'
   ```

**Acceptance Criteria:**
- ✅ Tailwind classes work in components
- ✅ Dark mode toggle works
- ✅ Custom theme colors are applied
- ✅ Animations work correctly

---

## Task 3: Setup shadcn/ui

### Subtasks:

1. **Install shadcn/ui Dependencies**
   ```bash
   pnpm add class-variance-authority clsx tailwind-merge
   pnpm add lucide-react
   pnpm add @radix-ui/react-slot @radix-ui/react-label
   ```

2. **Create `lib/utils.ts`**
   ```typescript
   import { type ClassValue, clsx } from "clsx"
   import { twMerge } from "tailwind-merge"
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

3. **Initialize shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   ```
   - Choose TypeScript
   - Choose default style
   - Choose Slate as base color
   - Use CSS variables
   - Configure component location

4. **Install Essential Components**
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add form
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add alert
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add tabs
   npx shadcn-ui@latest add toast
   npx shadcn-ui@latest add avatar
   npx shadcn-ui@latest add separator
   npx shadcn-ui@latest add skeleton
   ```

**Acceptance Criteria:**
- ✅ shadcn/ui components render correctly
- ✅ Components are accessible
- ✅ Styling is consistent
- ✅ Dark mode works with components

---

## Task 4: Setup Routing

### File: `src/App.tsx`

### Subtasks:

1. **Install React Router**
   ```bash
   pnpm add react-router-dom
   ```

2. **Create Route Structure**
   ```typescript
   import { BrowserRouter, Routes, Route } from 'react-router-dom'
   ```

3. **Define Routes**
   - `/` → Home page
   - `/login` → Login page
   - `/register` → Register page
   - `/elections` → Elections list
   - `/elections/:id` → Election details
   - `/vote/:id` → Voting interface
   - `/results/:id` → Results page
   - `/blockchain` → Blockchain explorer
   - `/profile` → User profile (protected)

4. **Create Layout Component**
   - Header with navigation
   - Main content area
   - Footer

5. **Implement Protected Routes**
   - Check authentication
   - Redirect to login if not authenticated

**Acceptance Criteria:**
- ✅ All routes are accessible
- ✅ Navigation works correctly
- ✅ Protected routes require auth
- ✅ 404 page for invalid routes

---

## Task 5: Create API Client

### File: `src/lib/api.ts`

### Subtasks:

1. **Setup Axios Instance**
   ```typescript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
     headers: { 'Content-Type': 'application/json' }
   });
   ```

2. **Add Request Interceptor**
   - Attach JWT token from localStorage
   - Add to Authorization header

3. **Add Response Interceptor**
   - Handle 401 errors (redirect to login)
   - Handle network errors

4. **Create API Methods**
   - `authAPI.register(data)`
   - `authAPI.login(data)`
   - `electionAPI.getAll()`
   - `electionAPI.getById(id)`
   - `electionAPI.getResults(id)`
   - `voteAPI.cast(data)`
   - `voteAPI.verify(hash)`
   - `blockchainAPI.getChain()`
   - `blockchainAPI.getBlock(index)`

**Acceptance Criteria:**
- ✅ API calls work correctly
- ✅ Authentication token is sent
- ✅ Errors are handled gracefully
- ✅ TypeScript types are correct

---

## Task 6: Create WebSocket Hook

### File: `src/hooks/useWebSocket.ts`

### Subtasks:

1. **Install Socket.io Client**
   ```bash
   pnpm add socket.io-client
   ```

2. **Create WebSocket Hook**
   ```typescript
   export function useWebSocket() {
     const [socket, setSocket] = useState<Socket | null>(null);
     const [connected, setConnected] = useState(false);
     
     useEffect(() => {
       const newSocket = io(SOCKET_URL);
       setSocket(newSocket);
       
       newSocket.on('connect', () => setConnected(true));
       newSocket.on('disconnect', () => setConnected(false));
       
       return () => { newSocket.close(); };
     }, []);
     
     return { socket, connected };
   }
   ```

3. **Create Event Listeners**
   - `on(event, callback)`
   - `off(event, callback)`
   - `emit(event, data)`

4. **Add Reconnection Logic**
   - Auto-reconnect on disconnect
   - Show connection status

**Acceptance Criteria:**
- ✅ WebSocket connects successfully
- ✅ Events are received
- ✅ Reconnection works
- ✅ Connection status is tracked

---

## Task 7: Create Authentication Context

### File: `src/contexts/AuthContext.tsx`

### Subtasks:

1. **Create Auth Context**
   ```typescript
   interface AuthContextType {
     voter: VoterPublic | null;
     token: string | null;
     login: (email: string, password: string) => Promise<void>;
     register: (data: RegisterRequest) => Promise<void>;
     logout: () => void;
     isAuthenticated: boolean;
   }
   ```

2. **Implement Auth Provider**
   - Store token in localStorage
   - Store voter data in state
   - Provide login/register/logout functions

3. **Create `useAuth` Hook**
   ```typescript
   export function useAuth() {
     return useContext(AuthContext);
   }
   ```

4. **Add Token Persistence**
   - Load token on mount
   - Clear token on logout

**Acceptance Criteria:**
- ✅ Authentication state persists
- ✅ Login/register work correctly
- ✅ Logout clears state
- ✅ Hook is accessible everywhere

---

## Task 8: Create Authentication Pages

### Files: `src/pages/Login.tsx`, `src/pages/Register.tsx`

### Subtasks:

1. **Create Login Page**
   - Email input field
   - Password input field
   - Submit button
   - Link to register
   - Error message display
   - Loading state

2. **Create Register Page**
   - Name input field
   - Email input field
   - Password input field
   - Confirm password field
   - Submit button
   - Link to login
   - Error message display
   - Loading state

3. **Add Form Validation**
   - Email format validation
   - Password strength validation
   - Required field validation
   - Password match validation (register)

4. **Integrate with Auth Context**
   - Call login/register functions
   - Handle success/error
   - Redirect on success

**Acceptance Criteria:**
- ✅ Forms validate input
- ✅ Login works correctly
- ✅ Registration creates account
- ✅ Errors are displayed
- ✅ Redirects after success

---

## Task 9: Create Elections List Page

### File: `src/pages/Elections.tsx`

### Subtasks:

1. **Fetch Elections**
   - Call API on mount
   - Store in state
   - Handle loading state
   - Handle errors

2. **Create Election Card Component**
   - Display title, description
   - Show status badge
   - Show dates
   - "Vote Now" button (if active)
   - "View Results" button (if closed)

3. **Add Filtering**
   - Filter by status (active, closed, all)
   - Search by title

4. **Add Real-time Updates**
   - Listen for election status changes
   - Update list automatically

**Acceptance Criteria:**
- ✅ Elections load and display
- ✅ Cards show correct information
- ✅ Filtering works
- ✅ Real-time updates work
- ✅ Navigation to details works

---

## Task 10: Create Election Details Page

### File: `src/pages/ElectionDetails.tsx`

### Subtasks:

1. **Fetch Election Data**
   - Get election by ID
   - Get candidates
   - Handle loading/errors

2. **Display Election Info**
   - Title, description
   - Status, dates
   - Candidate count

3. **Display Candidates**
   - List all candidates
   - Show name, party, description
   - Show images (if available)

4. **Add Actions**
   - "Vote" button (if active and not voted)
   - "View Results" button
   - "Already Voted" message (if voted)

**Acceptance Criteria:**
- ✅ Election details load
- ✅ Candidates display correctly
- ✅ Actions work based on status
- ✅ Voted status is tracked

---

## Task 11: Create Voting Interface

### File: `src/pages/Vote.tsx`

### Subtasks:

1. **Fetch Election and Candidates**
   - Verify election is active
   - Check if already voted
   - Load candidates

2. **Create Candidate Selection**
   - Radio buttons or cards
   - Highlight selected candidate
   - Show candidate details

3. **Implement Vote Submission**
   - Confirm selection dialog
   - Call vote API
   - Show loading state
   - Display receipt on success

4. **Create Vote Receipt Modal**
   - Show block hash
   - Show timestamp
   - "Download Receipt" button
   - "View on Blockchain" link

5. **Add Security Measures**
   - Confirm before submitting
   - Prevent double voting
   - Show warning about immutability

**Acceptance Criteria:**
- ✅ Candidates display correctly
- ✅ Selection works
- ✅ Vote is cast successfully
- ✅ Receipt is generated
- ✅ Double voting is prevented

---

## Task 12: Create Results Dashboard

### File: `src/pages/Results.tsx`

### Subtasks:

1. **Fetch Results Data**
   - Get election results
   - Get vote statistics
   - Handle loading/errors

2. **Create Results Display**
   - Candidate rankings
   - Vote counts
   - Percentages
   - Winner highlight (if finalized)

3. **Add Visualizations**
   - Bar chart (vote counts)
   - Pie chart (vote distribution)
   - Use Recharts library

4. **Add Real-time Updates**
   - Listen for vote cast events
   - Update counts automatically
   - Animate changes

5. **Add Statistics**
   - Total votes
   - Voter turnout
   - Votes by time

**Acceptance Criteria:**
- ✅ Results display correctly
- ✅ Charts render properly
- ✅ Real-time updates work
- ✅ Statistics are accurate
- ✅ Winner is highlighted

---

## Task 13: Create Blockchain Explorer

### File: `src/pages/Blockchain.tsx`

### Subtasks:

1. **Fetch Blockchain Data**
   - Get entire chain
   - Get validation status
   - Handle loading/errors

2. **Create Block List**
   - Display all blocks
   - Show index, hash, timestamp
   - Show vote data (anonymized)
   - Expandable details

3. **Create Block Details View**
   - Full block information
   - Previous hash link
   - Nonce value
   - Mining difficulty

4. **Add Search/Filter**
   - Search by hash
   - Filter by election
   - Filter by date range

5. **Add Validation Display**
   - Show chain validity
   - Highlight invalid blocks (if any)
   - Show validation errors

6. **Add Real-time Updates**
   - Listen for new blocks
   - Add to list automatically
   - Animate new blocks

**Acceptance Criteria:**
- ✅ Blockchain displays correctly
- ✅ Blocks are expandable
- ✅ Search/filter works
- ✅ Validation status shows
- ✅ Real-time updates work

---

## Task 14: Create Layout Components

### Files: `src/components/layout/`

### Subtasks:

1. **Create Header Component**
   - Logo/title
   - Navigation menu
   - User menu (if authenticated)
   - Login/Register buttons (if not authenticated)
   - Dark mode toggle

2. **Create Footer Component**
   - Copyright info
   - Links (About, Privacy, Terms)
   - Social media links

3. **Create Sidebar Component (Optional)**
   - Quick navigation
   - Election status overview
   - User stats

4. **Create Loading Component**
   - Skeleton loaders
   - Spinner
   - Progress bar

5. **Create Error Component**
   - Error message display
   - Retry button
   - Back to home link

**Acceptance Criteria:**
- ✅ Header shows on all pages
- ✅ Navigation works
- ✅ User menu functions correctly
- ✅ Footer displays properly
- ✅ Loading states are smooth

---

## Task 15: Create Reusable Components

### Files: `src/components/`

### Subtasks:

1. **Create ElectionCard Component**
   - Reusable election display
   - Props for election data
   - Action buttons

2. **Create CandidateCard Component**
   - Candidate display
   - Selection state
   - Vote button

3. **Create VoteReceipt Component**
   - Receipt display
   - Download functionality
   - Print functionality

4. **Create BlockCard Component**
   - Block information display
   - Expandable details
   - Copy hash button

5. **Create StatCard Component**
   - Statistic display
   - Icon support
   - Trend indicator

6. **Create ProtectedRoute Component**
   - Authentication check
   - Redirect logic
   - Loading state

**Acceptance Criteria:**
- ✅ Components are reusable
- ✅ Props are well-typed
- ✅ Styling is consistent
- ✅ Components are accessible

---

## Task 16: Add Toast Notifications

### Subtasks:

1. **Install Toast Component**
   ```bash
   npx shadcn-ui@latest add toast
   ```

2. **Create Toast Context**
   - Provide toast functions
   - Success, error, info, warning

3. **Integrate Throughout App**
   - Show on successful actions
   - Show on errors
   - Show on important events

**Acceptance Criteria:**
- ✅ Toasts display correctly
- ✅ Multiple toasts stack
- ✅ Auto-dismiss works
- ✅ Accessible

---

## Task 17: Add Dark Mode

### Subtasks:

1. **Create Theme Context**
   - Store theme preference
   - Provide toggle function
   - Persist to localStorage

2. **Create Theme Toggle Component**
   - Sun/moon icon
   - Toggle button
   - Smooth transition

3. **Apply Theme Classes**
   - Add `dark` class to root
   - Update CSS variables

**Acceptance Criteria:**
- ✅ Dark mode toggles correctly
- ✅ Preference persists
- ✅ All components support dark mode
- ✅ Transitions are smooth

---

## Task 18: Add Responsive Design

### Subtasks:

1. **Test on Mobile**
   - All pages work on mobile
   - Navigation is mobile-friendly
   - Forms are usable

2. **Add Breakpoints**
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

3. **Optimize Components**
   - Stack on mobile
   - Grid on desktop
   - Adjust font sizes

**Acceptance Criteria:**
- ✅ App works on all screen sizes
- ✅ No horizontal scroll
- ✅ Touch targets are adequate
- ✅ Text is readable

---

## Task 19: Add Loading States

### Subtasks:

1. **Create Skeleton Components**
   - Election card skeleton
   - Candidate card skeleton
   - Block card skeleton

2. **Add Loading Indicators**
   - Spinner for actions
   - Progress bar for uploads
   - Skeleton for data loading

3. **Implement Optimistic Updates**
   - Update UI immediately
   - Revert on error

**Acceptance Criteria:**
- ✅ Loading states are clear
- ✅ Skeletons match content
- ✅ No layout shift
- ✅ Smooth transitions

---

## Task 20: Add Error Handling

### Subtasks:

1. **Create Error Boundary**
   - Catch React errors
   - Display fallback UI
   - Log errors

2. **Add Error States**
   - Network errors
   - API errors
   - Validation errors

3. **Create Retry Logic**
   - Retry failed requests
   - Exponential backoff
   - Max retry limit

**Acceptance Criteria:**
- ✅ Errors don't crash app
- ✅ Error messages are helpful
- ✅ Retry works correctly
- ✅ Errors are logged

---

## Dependencies

**Required Packages:**
- `react`, `react-dom`, `react-router-dom`
- `axios`, `socket.io-client`
- `recharts`
- `tailwindcss`, `tailwindcss-animate`
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `lucide-react`
- `@radix-ui/*` (various components)
- `@voting-chain/types`

**Dev Dependencies:**
- `vite`, `@vitejs/plugin-react`
- `typescript`, `@types/react`, `@types/react-dom`
- `autoprefixer`, `postcss`

---

## Estimated Effort

- **Task 1-3**: 4 hours (Setup)
- **Task 4-7**: 6 hours (Core infrastructure)
- **Task 8**: 3 hours (Auth pages)
- **Task 9-10**: 4 hours (Elections)
- **Task 11**: 4 hours (Voting)
- **Task 12**: 4 hours (Results)
- **Task 13**: 4 hours (Blockchain explorer)
- **Task 14-15**: 6 hours (Components)
- **Task 16-20**: 5 hours (Polish)

**Total**: ~40 hours (5-7 days)

---

## Success Metrics

1. ✅ All pages load in < 2 seconds
2. ✅ No console errors
3. ✅ Lighthouse score > 90
4. ✅ Fully responsive on all devices
5. ✅ Accessible (WCAG 2.1 AA)
6. ✅ Real-time updates work smoothly
7. ✅ Dark mode works perfectly
8. ✅ All user flows complete successfully