# Material UI Theme Implementation

This project now includes a comprehensive Material UI theme implementation using your specified color palette.

## Color Palette

- **Primary**: `#2B9CAE` (Teal/Cyan blue)
- **Secondary**: `#04243C` (Dark navy blue) 
- **Accent**: `#e7500d` (Orange/red accent)

## Theme Features

### 1. Custom Theme Configuration (`src/theme/theme.ts`)
- Complete Material UI theme with custom color scheme
- Typography settings using Inter font family
- Component overrides for consistent styling
- Shadow and border radius customizations

### 2. Theme Utilities (`src/theme/themeUtils.ts`)
- `useThemeColors()` hook for easy color access
- Status color mapping utilities
- Confidence score color helpers
- Pre-defined shadow styles

### 3. Material UI Components

#### StatusChip (`src/components/Common/StatusChip.tsx`)
- Material UI replacement for status indicators
- Supports multiple status types (success, error, warning, pending, etc.)
- Customizable variants (filled, outlined)
- Icon support with animations

#### MuiStatusIndicator (`src/components/Common/MuiStatusIndicator.tsx`)
- Advanced status indicator with multiple display variants
- Chip, compact, and full variants
- Theme-aware colors and styling

#### MuiAgGridWrapper (`src/components/Common/MuiAgGridWrapper.tsx`)
- AG Grid integration with Material UI theme
- Custom cell renderers for status and confidence
- Theme-aware grid styling

### 4. Theme Showcase (`src/components/ThemeShowcase.tsx`)
- Comprehensive demonstration of all Material UI components
- Live examples of buttons, cards, tables, forms
- AG Grid integration example
- Status indicators in action

## Usage Examples

### Basic Theme Usage
```tsx
import { useTheme } from '@mui/material/styles';
import { useThemeColors } from './theme/themeUtils';

const MyComponent = () => {
  const theme = useTheme();
  const colors = useThemeColors();
  
  return (
    <Box sx={{ backgroundColor: colors.primaryAlpha }}>
      <Typography color={colors.primary}>
        Themed Component
      </Typography>
    </Box>
  );
};
```

### Status Components
```tsx
import { StatusChip } from './components/Common';

<StatusChip status="success" label="Mapped" />
<StatusChip status="pending" label="Processing" variant="outlined" />
```

### Themed Buttons
```tsx
<Button variant="contained" color="primary">Primary Action</Button>
<Button variant="contained" color="secondary">Secondary Action</Button>
<Button variant="outlined" color="primary">Outlined</Button>
```

## How to View the Theme

1. Start the development server: `npm run dev`
2. Click the "View Theme" button in the top header
3. Explore all the Material UI components with your custom theme

## Integration with Existing Code

The theme is designed to work alongside your existing Tailwind CSS styling. You can:

1. **Gradually migrate** components from Tailwind to Material UI
2. **Use both** - Material UI for complex components, Tailwind for utilities
3. **Mix and match** as needed for your specific use cases

## Available Components

- ✅ Buttons (Primary, Secondary, Outlined, Text)
- ✅ Cards and Papers with custom shadows
- ✅ Status indicators and chips
- ✅ Tables with themed styling
- ✅ Form elements (TextField, etc.)
- ✅ Progress indicators
- ✅ Icons and avatars
- ✅ AG Grid integration

## Next Steps

1. **Convert existing components** to use Material UI components where beneficial
2. **Use the theme utilities** for consistent color and styling
3. **Leverage the status components** for better user feedback
4. **Integrate AG Grid wrapper** for data tables with theme consistency

The theme is fully configured and ready to use throughout your application!