# Progress Bar Component

The Progress Bar component provides two styles of progress indicators for displaying completion status: a standard linear progress bar and a blocks-based step indicator.

## Features

- Standard linear progress bar with gradient styling
- Block-based step indicator for multi-step processes
- Customizable progress percentage
- Support for current step highlighting in block mode

## Usage

```jsx
import ProgressBar from '../components/progressBar';

// Standard progress bar
function StandardProgressExample() {
  return <ProgressBar progress={75} />;
}

// Blocks-based step indicator
function BlocksProgressExample() {
  return (
    <ProgressBar 
      isBlocks={true}
      steps={5}
      currentStep={2}
      fillPercent={60}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| progress | number | - | Percentage of completion (0-100) for the standard progress bar |
| isBlocks | boolean | false | When true, renders a blocks-based step indicator instead of standard progress bar |
| steps | number | - | Number of steps/blocks to display when in blocks mode |
| currentStep | number | 0 | Current active step in blocks mode |
| fillPercent | number | 0 | Percentage to fill the current step's block (0-100) |

## Component Variants

### Standard Progress Bar

The standard progress bar displays a linear indicator with a gradient fill that represents completion percentage. The bar is styled with rounded corners and an outline.

### Blocks Progress Bar

The blocks progress bar displays a series of segments representing steps in a process. It visualizes:
- Completed steps (fully filled blocks)
- Current step (partially filled block based on fillPercent)
- Future steps (empty blocks)

## CSS Classes

- `.progresBar`: Container for the standard progress bar
- `.progresBarValue`: Filled portion of the standard progress bar
- `.blocksProgressBar`: Container for the blocks-based progress indicator
- `.blocksProgressBarSegment`: Individual step/block in the blocks progress indicator
- `.fill`: Filled portion of each block 