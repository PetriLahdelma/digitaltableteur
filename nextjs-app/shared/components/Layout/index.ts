// Default layout (existing page layout with header/footer)
export { default } from "./Layout";

// Layout primitives (new - Phase 04)
export { Container, type ContainerProps } from "../Container";
export { Section, type SectionProps } from "../Section";
export { Stack, type StackProps } from "../Stack";
export { Spacer, type SpacerProps } from "../Spacer";
export { AspectRatio, type AspectRatioProps } from "../AspectRatio";
export { Center, type CenterProps } from "../Center";

// Re-export existing layout components
export { default as Grid } from "../Grid";
export { GridItem } from "../Grid/Grid";
export { default as FlexBox } from "../FlexBox";
export type { FlexBoxProps } from "../FlexBox/FlexBox";
