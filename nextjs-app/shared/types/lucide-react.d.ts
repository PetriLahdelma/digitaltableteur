declare module "lucide-react" {
  import { FC, SVGProps } from "react";

  export interface LucideProps extends Partial<
    Omit<SVGProps<SVGSVGElement>, "ref">
  > {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = FC<LucideProps>;

  // Common icons used in project
  export const Copy: LucideIcon;
  export const Check: LucideIcon;
  export const Share2: LucideIcon;
  export const X: LucideIcon;
  export const Menu: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Info: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const XCircle: LucideIcon;
  export const Loader: LucideIcon;
  export const Search: LucideIcon;
  export const Settings: LucideIcon;
  export const User: LucideIcon;
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const MapPin: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Download: LucideIcon;
  export const Upload: LucideIcon;
  export const File: LucideIcon;
  export const Folder: LucideIcon;
  export const Image: LucideIcon;
  export const Video: LucideIcon;
  export const Music: LucideIcon;
  export const Code: LucideIcon;
  export const Terminal: LucideIcon;
  export const Command: LucideIcon;
  export const Sparkles: LucideIcon;
  export const UserCheck: LucideIcon;
  export const Network: LucideIcon;
  export const ClipboardCheck: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const KeyRound: LucideIcon;
}
