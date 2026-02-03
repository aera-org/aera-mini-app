# Energy Boost System

The Energy Boost system allows users to temporarily convert actions to points without consuming energy. This document outlines how the boost system works, its limitations, and possible decline reasons.

## Overview

Users can activate a boost which lasts for 60 seconds. During this time, they can perform actions that normally cost energy without depleting their energy bar.

## Boost Limitations

1. Users get 3 boosts per day
2. Boosts reset at midnight
3. Boosts cannot be stacked (only one active at a time)
4. Each boost lasts for 60 seconds

## Decline Reasons

The system may decline a boost request for the following reasons:

| Reason Code | Description | Solution |
|-------------|-------------|----------|
| `BOOST_ALREADY_ACTIVE` | User already has an active boost | Wait for the current boost to expire (60 seconds) |
| `NO_BOOSTS_REMAINING` | User has used all available boosts for the day | Wait for the daily reset |
| `SERVER_ERROR` | An internal server error occurred | Try again later |

## Implementation Details

### Backend (boost.ts)

The backend handles boost requests by:
1. Checking if a boost is already active
2. Verifying the user has boosts remaining
3. Decrementing the boost count
4. Setting the lastUpdate timestamp
5. Returning the result with appropriate reason codes

### Frontend (energyContext.tsx)

The frontend Energy Context provides:
1. A method to request boosts (`handleBoostAttempt`)
2. Status tracking for active boosts
3. Access to decline reasons through `boostDeclineReason`
4. A flag indicating if a boost is currently active

## Usage Example

```typescript
const { handleBoostAttempt, isBoostActive, boostDeclineReason } = useEnergy();

const activateBoost = async () => {
  const result = await handleBoostAttempt();
  
  if (!result.success) {
    switch(result.reason) {
      case 'BOOST_ALREADY_ACTIVE':
        alert('You already have an active boost!');
        break;
      case 'NO_BOOSTS_REMAINING':
        alert('No boosts remaining today. Try again tomorrow!');
        break;
      case 'SERVER_ERROR':
        alert('Server error. Please try again later.');
        break;
    }
  }
};
``` 