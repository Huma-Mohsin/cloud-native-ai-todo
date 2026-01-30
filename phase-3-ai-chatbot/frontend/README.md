# Phase III AI Chatbot - Frontend

AI-powered task management chatbot frontend built with Next.js 15, React 19, and TypeScript.

## Features

- 💬 Real-time chat interface
- 🤖 Natural language task management
- 📱 Responsive design with Tailwind CSS
- ⚡ Fast and modern with Next.js 15
- 🔒 Ready for authentication integration

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **API Client:** Fetch API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:8000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (chat interface)
│   └── globals.css        # Global styles
├── components/
│   └── chat/              # Chat components
│       ├── ChatInterface.tsx
│       └── ChatMessage.tsx
├── hooks/
│   └── useChat.ts         # Chat state management hook
├── services/
│   └── chatService.ts     # Backend API client
└── package.json
```

## Usage

### Chat Commands

The AI assistant understands natural language. Try:

- "Add a task to buy groceries"
- "Show me all my tasks"
- "Mark task 1 as complete"
- "Delete task 2"
- "Update task 3 to call mom"

## API Integration

The frontend connects to the backend at `http://localhost:8000/api/{user_id}/chat`.

To change the backend URL, modify `chatService.ts`:

```typescript
constructor(baseUrl: string = 'http://localhost:8000')
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Contributing

This is part of Phase III implementation for the Cloud-Native AI Todo Hackathon.

## License

MIT
