# Energy Bar Component

The Energy Bar component displays a circular energy indicator that shows the current energy level and allows users to activate energy boosts.

## Features

- Circular progress indicator that displays the current energy level
- Visual feedback when energy boost is active
- Animated effects for energy consumption
- Click to activate energy boost

## Usage

```jsx
import EnergyBar from '../components/EnergyBar';

function MyComponent() {
  return (
    <div>
      <EnergyBar />
    </div>
  );
}
```

## Component Structure

The component uses the following CSS classes:

- `.progressContainer`: Main container for the energy bar
- `.progressSvg`: SVG element that renders the circular progress bar
- `.backgroundCircle`: Background circle of the progress indicator
- `.progressCircle`: Foreground circle that shows the progress
- `.centerIcon`: Container for the energy icon in the center
- `.iconBackground`: Background for the center icon that visualizes energy level

## Animation States

The component has two main states:
1. **Normal state**: Shows current energy level
2. **Boost active state**: Shows animated energy consumption with rotating circle

## Dependencies

The component relies on:
- Energy context from `energyContext.js` for energy data and boost functionality
- CSS animations defined in `index.module.css`
- Energy icon asset

## CSS Animations

The component uses three animations:
- `continuousPulse`: Pulsing effect for the center icon during boost
- `pulseAndShrink`: Animation for the center icon container during boost
- `progressAnimation`: Animation for the circle progress during energy consumption 