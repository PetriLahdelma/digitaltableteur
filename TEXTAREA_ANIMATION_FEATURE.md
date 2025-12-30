# Smooth Animated TextArea Feature (v2.0.0)

## Summary

Added smooth auto-growing animation to the existing TextArea component with opt-in/opt-out control via the `animateResize` prop.

## Implementation Details

### Components Updated

1. **TextArea component** ([TextArea.tsx:12-135](nextjs-app/shared/components/Inputs/TextArea.tsx#L12-L135))
   - Added `animateResize?: boolean` prop (default: `false` for backward compatibility)
   - Added `minRows?: number` prop (default: `2`)
   - Added `maxRows?: number` prop (default: `10`)
   - Implemented smooth resize with double requestAnimationFrame technique

2. **ChatTextArea component** ([TextArea.tsx:137-290](nextjs-app/shared/components/Inputs/TextArea.tsx#L137-L290))
   - Added `animateResize?: boolean` prop (default: `true` since chat interfaces benefit from smooth animations)
   - Updated existing `resize` callback to support both animated and instant modes
   - Reuses same minRows/maxRows props

### CSS Styles

Added to [Inputs.module.css](nextjs-app/shared/components/Inputs/Inputs.module.css#L134-L146):

```css
/* Smooth animated textarea (v2.0.0) */
.animatedTextarea {
  resize: none;
  overflow-y: hidden;
  transition: height 180ms ease;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .animatedTextarea {
    transition: none;
  }
}
```

## Algorithm

The smooth resize algorithm follows this pattern:

1. **Measure current height** before any changes
2. **Set height to 'auto'** temporarily to get accurate scrollHeight
3. **Calculate dimensions**:
   - Parse lineHeight, verticalPadding, borderWidth from computed styles
   - Calculate minHeight = lineHeight × minRows + padding + border
   - Calculate maxHeight = lineHeight × maxRows + padding + border
4. **Clamp target height** between min and max
5. **Manage overflow**: Set overflow-y to 'auto' if content exceeds maxHeight, otherwise 'hidden'
6. **Apply smooth transition**:
   - First RAF: Set current height explicitly
   - Second RAF: Set target height (ensures CSS transition applies)

## Usage Examples

### TextArea (opt-in animation)

```tsx
<TextArea
  label="Animated Message"
  animateResize={true}
  minRows={3}
  maxRows={8}
  value={message}
  onChange={setMessage}
/>
```

### ChatTextArea (animated by default)

```tsx
// Animated by default
<ChatTextArea
  placeholder="Type your message..."
  onValueChange={handleChange}
/>

// Disable animation
<ChatTextArea
  animateResize={false}
  placeholder="Type your message..."
  onValueChange={handleChange}
/>
```

## Accessibility

- Respects `prefers-reduced-motion` media query (transitions disabled)
- Height changes are smooth and non-jarring for users
- No impact on keyboard navigation or screen readers

## Performance

- Uses requestAnimationFrame for optimal rendering performance
- Double-RAF technique ensures transitions apply correctly
- Minimal recalculations (only on value change)
- No layout thrashing

## Browser Support

- Modern browsers with requestAnimationFrame support
- Graceful degradation: without animation support, height changes are instant
- CSS custom properties required (already baseline for this project)

## Related Files

- [TextArea.tsx](nextjs-app/shared/components/Inputs/TextArea.tsx) - Component implementation
- [Inputs.module.css](nextjs-app/shared/components/Inputs/Inputs.module.css) - CSS styles
- [TextArea.test.tsx](nextjs-app/shared/components/Inputs/TextArea.test.tsx) - Unit tests (existing)

## Version History

- **v2.0.0**: Feature added with `animateResize` prop for both TextArea and ChatTextArea
