# ADR 002: Custom React Chat UI Instead of OpenAI ChatKit

**Status**: Accepted
**Date**: 2026-01-16
**Deciders**: Development Team
**Context**: Phase III AI-Powered Chatbot Implementation

---

## Context

Phase III of the Evolution of Todo project requires implementing a chat-based user interface for the AI-powered chatbot. The project constitution (Section V, Line 51) and feature specification (spec.md) mandate the use of **OpenAI ChatKit** as the frontend chat UI framework.

### Requirements
- **Constitution**: "Frontend: OpenAI ChatKit"
- **Spec**: "Frontend: OpenAI ChatKit"
- **Plan**: "✅ PASS: Chat UI - OpenAI ChatKit (new, Phase III requirement)"

### Constraints Encountered
1. **OpenAI ChatKit Dependency**: Requires OpenAI API integration and authentication
2. **API Access Required**: ChatKit needs OpenAI API key for functionality
3. **Cost Barrier**: OpenAI API requires minimum $5.00 credit purchase (no free tier available)
4. **Budget Constraint**: No payment method available for API access
5. **Related Decision**: ADR 001 already documented use of rule-based agent instead of OpenAI Agents SDK

### Constitution Guidance
Constitution Section V (Line 214-217) states:
```
Technology Substitution Policy:
- Core stack is non-negotiable and cannot be changed
- Any substitution requires ADR (Architecture Decision Record)
```

---

## Decision

Implement a **custom React-based chat interface** using Better Auth session management and direct backend API integration, while maintaining a clean architecture that allows future migration to OpenAI ChatKit.

### Implementation Approach

**Component Architecture**:

1. **ChatInterface Component** (`frontend/components/chat/ChatInterface.tsx`):
   - Main chat container with header, messages area, and input
   - Integrates with Better Auth session
   - Displays user info and logout button
   - Auto-scrolls to latest message
   - Loading states and error handling

2. **ChatMessage Component** (`frontend/components/chat/ChatMessage.tsx`):
   - Renders individual messages (user and assistant)
   - Different styling for each role
   - Supports markdown formatting
   - Timestamp display

3. **useChat Hook** (`frontend/hooks/useChat.ts`):
   - State management for messages, loading, errors
   - Accepts userId and JWT token from session
   - Sends messages to backend API
   - Updates UI with responses

4. **ChatService** (`frontend/services/chatService.ts`):
   - API client for chat endpoint
   - Handles authentication (JWT Bearer token)
   - Error handling and retry logic
   - Type-safe with TypeScript interfaces

**Technology Stack**:
- React 19 (Client Components)
- TypeScript (strict mode)
- Tailwind CSS (styling)
- Better Auth (session management)
- Next.js 15 App Router

---

## Consequences

### Positive Consequences ✅

1. **Zero Operational Cost**
   - No OpenAI API dependency
   - No ChatKit licensing or usage fees
   - Sustainable for development and production

2. **Full Control Over UI/UX**
   - Custom design matching project branding
   - Responsive layout with Tailwind CSS
   - Optimized for task management use case
   - Can add custom features as needed

3. **Better Auth Integration**
   - Seamless integration with existing authentication
   - JWT token management working perfectly
   - User session displayed in header
   - Secure logout functionality

4. **Performance Optimized**
   - Lightweight components (no external chat library overhead)
   - Fast rendering with React 19
   - Efficient state management
   - Auto-scroll optimization

5. **Type Safety**
   - Full TypeScript coverage
   - Type-safe API client
   - Compile-time error detection
   - Better developer experience

6. **Constitution Compliance**
   - Proper documentation via ADR (this document)
   - Follows constitution's substitution policy
   - Demonstrates architectural decision-making

### Negative Consequences ⚠️

1. **Constitution Stack Deviation**
   - Deviates from recommended technology stack
   - May impact hackathon scoring (though properly documented)

2. **Missing ChatKit Features**
   - No built-in typing indicators
   - No read receipts
   - No message reactions
   - No file upload UI (not required for Phase III)

3. **Custom Maintenance**
   - Custom code requires ongoing maintenance
   - Bug fixes and updates are our responsibility
   - ChatKit would handle this automatically

4. **No ChatKit Ecosystem**
   - Cannot leverage ChatKit plugins
   - Cannot use ChatKit themes
   - Cannot benefit from ChatKit updates

---

## Alternatives Considered

### Alternative 1: OpenAI ChatKit
**Description**: Use official OpenAI ChatKit as specified in constitution

**Pros**:
- 100% constitution compliance
- Production-ready chat UI
- Built-in features (typing indicators, etc.)
- Regular updates from OpenAI
- Professional appearance

**Cons**:
- Requires OpenAI API key ($5 minimum purchase)
- Budget constraint - payment not available
- Dependency on external service
- Less control over customization
- Related to ADR 001 (no OpenAI API access)

**Decision**: ❌ Rejected - Budget constraint, API access unavailable

---

### Alternative 2: Other Chat UI Libraries
**Description**: Use alternative chat libraries (react-chat-elements, chatscope, etc.)

**Pros**:
- Pre-built components
- No OpenAI dependency
- Free and open source

**Cons**:
- Constitution specifically requires ChatKit
- Would be a greater deviation
- Additional dependencies
- Learning curve for new library
- May not integrate well with Better Auth

**Decision**: ❌ Rejected - Greater constitution violation, unnecessary complexity

---

### Alternative 3: Minimal Text-Based Interface
**Description**: Simple form-based interface without chat UI

**Pros**:
- Extremely simple implementation
- No dependencies
- Fast to build

**Cons**:
- Poor user experience
- Doesn't feel like a chatbot
- No conversation history display
- Doesn't meet "chat interface" requirement

**Decision**: ❌ Rejected - Poor UX, doesn't meet requirements

---

### Alternative 4: Custom React Chat UI
**Description**: Build custom chat interface with React + Tailwind CSS

**Pros**:
- Zero cost - no API fees
- Full control over design and features
- Better Auth integration
- Type-safe with TypeScript
- Optimized for our use case
- Professional appearance
- All required features implemented

**Cons**:
- Constitution stack deviation (documented)
- Custom maintenance required
- Missing some ChatKit advanced features (not needed for Phase III)

**Decision**: ✅ **Accepted** - Best balance of constraints and requirements

---

## Implementation Details

### Component Structure

**ChatInterface.tsx**:
```typescript
interface ChatInterfaceProps {
  session: Session;  // Better Auth session
}

export function ChatInterface({ session }: ChatInterfaceProps) {
  const userId = session.user.id;
  const token = session.session.token;

  const { messages, isLoading, error, sendMessage } = useChat({ userId, token });

  // Header with user info and logout
  // Messages area with auto-scroll
  // Input form with send button
}
```

**useChat Hook**:
```typescript
export function useChat({ userId, token }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    // Add user message to UI
    // Call backend API with JWT token
    // Update with assistant response
  };
}
```

**ChatService**:
```typescript
export class ChatService {
  async sendMessage(message: string, userId: string, token: string, conversationId?: number) {
    const response = await fetch(`${this.baseUrl}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ conversation_id: conversationId, message }),
    });
    return response.json();
  }
}
```

### Styling

**Tailwind CSS Classes**:
- Header: `bg-blue-600 text-white p-4 shadow-md`
- Messages: `flex-1 overflow-y-auto p-4 space-y-4`
- User message: `bg-blue-500 text-white rounded-lg px-4 py-2 ml-auto`
- Assistant message: `bg-gray-200 text-gray-800 rounded-lg px-4 py-2 mr-auto`
- Input: `border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`

### Features Implemented

✅ **Core Features**:
- Message display (user and assistant)
- Message input with send button
- Auto-scroll to latest message
- Loading indicators
- Error display
- User info in header
- Logout functionality

✅ **Authentication**:
- JWT token from Better Auth session
- Token passed to backend API
- User ID extraction from session
- Secure logout

✅ **State Management**:
- Conversation ID tracking
- Message history
- Loading states
- Error states

✅ **Responsive Design**:
- Mobile-friendly layout
- Flexible message containers
- Proper spacing and padding

---

## Migration Path to ChatKit

When OpenAI API access becomes available and ChatKit migration is desired:

### Step 1: Install ChatKit
```bash
cd frontend
npm install @openai/chatkit
```

### Step 2: Replace ChatInterface Component
```typescript
import { ChatKit } from '@openai/chatkit';

export function ChatInterface({ session }: ChatInterfaceProps) {
  return (
    <ChatKit
      apiKey={process.env.NEXT_PUBLIC_OPENAI_KEY}
      userId={session.user.id}
      onMessage={handleMessage}
      // ... ChatKit configuration
    />
  );
}
```

### Step 3: Update Environment Variables
```bash
NEXT_PUBLIC_OPENAI_KEY=your-api-key
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
```

### Step 4: Configure Domain Allowlist
- Add production domain to OpenAI allowlist
- Get domain key from OpenAI dashboard

### Step 5: Test and Deploy
- Test ChatKit integration
- Verify authentication working
- Deploy to production

**Note**: Backend API remains unchanged - ChatKit will call same `/api/{user_id}/chat` endpoint

---

## Validation

### Functional Requirements ✅
- ✅ Chat interface displays messages
- ✅ User can send messages
- ✅ Assistant responses displayed
- ✅ Conversation history visible
- ✅ Loading states shown
- ✅ Errors handled gracefully
- ✅ User info displayed
- ✅ Logout working

### Technical Requirements ✅
- ✅ React 19 components
- ✅ TypeScript strict mode
- ✅ Tailwind CSS styling
- ✅ Better Auth integration
- ✅ JWT authentication
- ✅ Responsive design
- ✅ Auto-scroll functionality

### User Experience ✅
- ✅ Professional appearance
- ✅ Intuitive interface
- ✅ Fast and responsive
- ✅ Clear message distinction (user vs assistant)
- ✅ Helpful error messages

---

## References

- Constitution: `.specify/memory/constitution.md` (Section V, Line 51, Lines 214-217)
- Spec: `specs/003-phase-iii-chatbot/spec.md` (Line 123)
- Plan: `specs/003-phase-iii-chatbot/plan.md` (Line 51)
- Implementation: `frontend/components/chat/ChatInterface.tsx`
- Related ADR: ADR 001 (Rule-Based Agent Fallback)

---

## Decision Outcome

**Status**: ✅ **Accepted and Implemented**

**Rationale**: Given the constraints (no OpenAI API access, budget limitations, related to ADR 001), the custom React chat UI provides a pragmatic solution that:
1. Satisfies all functional requirements
2. Integrates seamlessly with Better Auth
3. Provides professional user experience
4. Complies with constitution's ADR requirement
5. Enables immediate hackathon submission
6. Costs zero operational expenses
7. Maintains migration path to ChatKit

**Future Action**: When OpenAI API access becomes available, can migrate to ChatKit by installing package and replacing component (backend API unchanged).

---

**Approved By**: Development Team
**Date**: 2026-01-16
**Related ADRs**: ADR 001 (Rule-Based Agent Fallback)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
