# WalletModal Component

## Overview

The `WalletModal` component provides a user interface for managing TON blockchain wallet connections. It allows users to connect their wallet, view their wallet address, and disconnect from the application. The component handles various states of the wallet connection process and displays appropriate UI based on those states.

## Component Architecture

The component uses a state-based approach for rendering different views:

```typescript
enum ModalState {
  CONNECT,            // Initial state, wallet not connected
  CONNECTED,          // Wallet connected, showing address
  JUST_CONNECTED,     // Wallet just connected, showing success message
  JUST_DISCONNECTED,  // Wallet just disconnected, showing success message
  DISCONNECT_CONFIRM, // Confirming disconnect action
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| isOpen | boolean | Controls the visibility of the modal |
| onClose | () => void | Function to close the modal |
| title | string | Title text to display in the modal |

## Hooks Used

- `useTonConnectModal` - Provides the TON Connect modal functionality
- `useCheckTonConnect` - Custom hook for checking TON connection status
- `useTonConnect` - Custom hook providing wallet connection state and functions
- `useTonAddress` - Hook that provides the connected wallet address

## State Management

The component determines its current state by checking the following conditions:
1. `justDisconnected` - User just disconnected their wallet
2. `showDisconnectConfirm` - User is confirming wallet disconnection
3. `justConnected` and has an address - User just connected their wallet
4. Has an address and is connected - User has a connected wallet
5. Default state - Prompt user to connect wallet

## User Interactions

- **Connect Wallet** - Opens the TON Connect modal for wallet connection
- **Disconnect Wallet** - Shows a confirmation dialog before disconnecting
- **Cancel Disconnect** - Cancels the disconnect action
- **Confirm Disconnect** - Proceeds with wallet disconnection

## Implementation Details

The component uses a switch statement to render different UI components based on the current state, which simplifies the conditional rendering logic and makes the code more maintainable.

## Usage Example

```jsx
import WalletModal from './components/walletModal';

function App() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsWalletModalOpen(true)}>
        Connect Wallet
      </button>
      
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title="Connect Wallet"
      />
    </>
  );
}
``` 