declare module "react-helmet-async" {
  import { Component, ReactNode } from "react";

  export interface HelmetProps {
    base?: any;
    bodyAttributes?: Record<string, string>;
    defaultTitle?: string;
    defer?: boolean;
    encodeSpecialCharacters?: boolean;
    htmlAttributes?: Record<string, string>;
    link?: Array<Record<string, string>>;
    meta?: Array<Record<string, string>>;
    noscript?: Array<Record<string, string>>;
    onChangeClientState?: (
      newState: any,
      addedTags: any,
      removedTags: any,
    ) => void;
    script?: Array<Record<string, string>>;
    style?: Array<Record<string, string>>;
    title?: string;
    titleAttributes?: Record<string, string>;
    titleTemplate?: string;
    prioritizeSeoTags?: boolean;
    children?: ReactNode;
  }

  export class Helmet extends Component<HelmetProps> {}

  export interface HelmetProviderProps {
    context?: any;
    children: ReactNode;
  }

  export class HelmetProvider extends Component<HelmetProviderProps> {}
}
