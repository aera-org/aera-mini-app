# Chat API Integration

## Overview

The chat functionality is integrated with a backend API that handles message processing and bot responses. This document outlines the API integration and usage in the frontend.

## API Endpoints

### POST /messages

Send a message to a bot and receive responses.

#### Request Body

```typescript
{
  chat_id: number;    // Unique identifier for the chat
  bot_name: string;   // Name of the bot to send the message to
  message: string;    // Message text to send to the bot
}
```

#### Response

```typescript
{
  success: boolean;
  messages: Array<{
    type: string;
    content: string;
    metadata: any | null;
    actions: any | null;
  }>;
  user: {
    chat_id: number;
    fuel: number;
    coins: number;
  };
  bot: {
    name: string;
  };
  options?: string[];  // Suggested response options for the user
}
```

## Frontend Implementation

The chat functionality is implemented in `src/components/chat/index.tsx` and uses the API client defined in `src/api/messages.ts`.

### Key Features

- Real-time message sending and receiving
- Loading states during API calls
- Error handling for failed requests
- Quick replies functionality with dynamic options
- Initial quick reply suggestions
- Disabled UI elements during processing

### Quick Replies

The chat component supports two types of quick replies:

1. Initial Quick Replies:
   - Predefined options shown when the chat starts
   - Default options include:
     - "Hello! How can you help me?"
     - "What services do you offer?"
     - "I need assistance"

2. Dynamic Quick Replies:
   - Options received from the API response
   - Automatically updates when new options are available
   - Replaces previous quick replies with new suggestions

### Usage Example

```typescript
import { sendMessage } from '../../api/messages';

// Send a message
const response = await sendMessage({
  chat_id: 12345678,
  bot_name: 'shopping_bot',
  message: 'Hello, how can you help me today?'
});

// Handle the response
const botMessage = response.messages[0]?.content;
const suggestedOptions = response.options;
```

## Error Handling

The API integration includes comprehensive error handling:

1. Network errors
2. Invalid responses
3. Server errors
4. Timeout handling

When an error occurs, the UI will display an appropriate error message to the user.

## Security

The API integration includes:

- Request validation
- Error handling
- Loading states to prevent duplicate submissions
- Disabled UI elements during processing

## Future Improvements

1. Add proper chat_id management from user context
2. Implement message history persistence
3. Add typing indicators
4. Support for rich message types (images, buttons, etc.)
5. Implement retry mechanism for failed requests
6. Add animations for quick reply updates
7. Support for custom styling of quick replies based on message type 