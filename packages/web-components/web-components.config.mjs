const stringProp = (name, sourceProp = name, description = "") => ({
  name,
  sourceProp,
  type: "string",
  description,
});
const numberProp = (name, sourceProp = name, description = "") => ({
  name,
  sourceProp,
  type: "number",
  description,
});
const booleanProp = (name, sourceProp = name, description = "") => ({
  name,
  sourceProp,
  type: "boolean",
  description,
});
const stringArrayProperty = (name, sourceProp = name, description = "") => ({
  name,
  sourceProp,
  type: "string",
  propertyType: "string[]",
  description,
});
const booleanValueProperty = (name, sourceProp = name, description = "") => ({
  name,
  sourceProp,
  type: "string",
  propertyType: "boolean",
  description,
});
const nativeProp = (name, type, description = "", options = {}) => ({
  name,
  sourceProp: null,
  type,
  description,
  ...options,
});
const storyParity = ({
  equivalents = [],
  exclusions = [],
  extensions = [],
} = {}) => ({
  equivalents,
  exclusions,
  extensions,
});
const slot = (name, description) => ({ name, description });

const elementDefinitions = [
  {
    tagName: "dt-button",
    adapterClassName: "DtButtonReactElement",
    sourceComponent: "Button",
    contract: "Button",
    defaultBackend: "native",
    nativeClassName: "DtButtonElement",
    description: "Digitaltableteur action or link control.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Async Action",
          reason:
            "React-only promise callback orchestration; native hosts own async state and set loading explicitly.",
        },
        {
          react: "Cta Bands",
          reason:
            "Marketing-site React composition rather than a reusable Button capability.",
        },
        {
          react: "Home Hero Band",
          reason:
            "Marketing-site React composition rather than a reusable Button capability.",
        },
      ],
    }),
    props: [
      stringProp("label", "children", "Visible button label."),
      stringProp("variant"),
      stringProp("tone"),
      stringProp("size"),
      stringProp("surface"),
      booleanProp("disabled"),
      booleanProp("loading"),
      booleanProp("rounded"),
      stringProp("icon"),
      stringProp("endIcon"),
      stringProp("accessibleName"),
      stringProp("accessibleNameRef"),
      stringProp("accessibleDescription"),
      stringProp("tooltip"),
      stringProp("href"),
      stringProp("target"),
      stringProp("rel"),
      booleanProp("submits"),
    ],
    events: [],
  },
  {
    tagName: "dt-badge",
    adapterClassName: "DtBadgeReactElement",
    sourceComponent: "Badge",
    contract: "Badge",
    defaultBackend: "native",
    nativeClassName: "DtBadgeElement",
    description: "Compact status label with semantic tone.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "In Button End Slot",
          reason:
            "React-node composition demo; native hosts compose separate custom elements without a React end-slot prop.",
        },
      ],
    }),
    props: [
      stringProp("label", "children", "Visible badge label."),
      stringProp("variant"),
      stringProp("tone"),
      stringProp("size"),
      booleanProp("removable"),
      booleanProp("dot"),
      booleanProp("square"),
      stringProp("role"),
      nativeProp("icon", "string", "Leading native icon name."),
    ],
    events: [
      {
        callbackProp: "onRemove",
        name: "remove",
        description: "Dispatched after a removable badge is dismissed.",
      },
    ],
  },
  {
    tagName: "dt-icon-button",
    sourceComponent: "IconButton",
    contract: "IconButton",
    defaultBackend: "native",
    nativeClassName: "DtIconButtonElement",
    description: "Accessible icon-only action composed from native Button.",
    storyParity: storyParity({
      equivalents: [
        { react: "Example (site header toolbar)", native: "Example" },
      ],
    }),
    props: [
      stringProp("icon"),
      stringProp("label"),
      stringProp("variant"),
      stringProp("tone"),
      stringProp("surface"),
      stringProp("size"),
      stringProp("tooltip"),
      nativeProp("disabled", "boolean"),
      nativeProp("loading", "boolean"),
      nativeProp("submits", "boolean"),
    ],
    events: [],
  },
  {
    tagName: "dt-button-group",
    sourceComponent: "ButtonGroup",
    contract: "ButtonGroup",
    defaultBackend: "native",
    nativeClassName: "DtButtonGroupElement",
    description: "Attached or spaced group of related action controls.",
    storyParity: storyParity(),
    props: [stringProp("ariaLabel"), booleanProp("attached")],
    events: [],
  },
  {
    tagName: "dt-filter-chip",
    sourceComponent: "FilterChip",
    contract: "FilterChip",
    defaultBackend: "native",
    nativeClassName: "DtFilterChipElement",
    description: "Controlled filter toggle with pressed semantics.",
    storyParity: storyParity({
      equivalents: [{ react: "Example (filter group)", native: "Example" }],
    }),
    props: [
      stringProp("label", "children", "Visible chip label."),
      booleanProp("pressed"),
      stringProp("variant"),
      stringProp("size"),
      numberProp("count"),
      nativeProp("disabled", "boolean"),
    ],
    events: [],
  },
  {
    tagName: "dt-link",
    sourceComponent: "Link",
    contract: "Link",
    defaultBackend: "native",
    nativeClassName: "DtLinkElement",
    description: "Protocol-safe native anchor with external-link affordance.",
    storyParity: storyParity(),
    props: [
      nativeProp("href", "string"),
      nativeProp("label", "string", "Visible link label."),
      stringProp("size"),
      stringProp("underline"),
      nativeProp("target", "string"),
      nativeProp("rel", "string"),
      nativeProp("download", "string"),
      nativeProp("hrefLang", "string", "", { attributeName: "hreflang" }),
      nativeProp("referrerPolicy", "string", "", {
        attributeName: "referrerpolicy",
      }),
      nativeProp("ariaCurrent", "string"),
      nativeProp("ariaLabel", "string"),
      nativeProp(
        "externalLabel",
        "string",
        "Override the external-link announcement for every locale.",
      ),
      nativeProp(
        "externalLabelEn",
        "string",
        "English external-link announcement override.",
      ),
      nativeProp(
        "externalLabelFi",
        "string",
        "Finnish external-link announcement override.",
      ),
      nativeProp(
        "externalLabelSv",
        "string",
        "Swedish external-link announcement override.",
      ),
    ],
    events: [],
  },
  {
    tagName: "dt-nav-link",
    sourceComponent: "NavLink",
    contract: "NavLink",
    defaultBackend: "native",
    nativeClassName: "DtNavLinkElement",
    description: "Host-routed navigation link with boundary-safe active state.",
    storyParity: storyParity(),
    props: [
      stringProp("href"),
      stringProp("label", "children", "Visible navigation label."),
      nativeProp(
        "currentPath",
        "string",
        "Current host route used to derive active state.",
      ),
      booleanProp("exact"),
      nativeProp("size", "string"),
      nativeProp("underline", "string"),
    ],
    events: [],
  },
  {
    tagName: "dt-skip-link",
    sourceComponent: "SkipLink",
    contract: "SkipLink",
    defaultBackend: "native",
    nativeClassName: "DtSkipLinkElement",
    description: "Keyboard bypass link revealed on focus.",
    storyParity: storyParity(),
    props: [
      stringProp("href"),
      stringProp("label", "children", "Visible link label on focus."),
    ],
    events: [],
  },
  {
    tagName: "dt-slide-button",
    sourceComponent: "SlideButton",
    contract: "SlideButton",
    defaultBackend: "native",
    nativeClassName: "DtSlideButtonElement",
    description:
      "Pill call-to-action whose icon disc slides across on hover while the label shifts and the disc rolls.",
    storyParity: storyParity(),
    props: [
      nativeProp("label", "string", "Visible label; also the accessible name."),
      nativeProp("href", "string", "Destination the anchor points to."),
      nativeProp("icon", "string", "Phosphor icon name for the sliding disc."),
      nativeProp(
        "iconSide",
        "string",
        "Side the disc rests on before it slides.",
        {
          attributeName: "icon-side",
        },
      ),
    ],
    events: [],
  },
  {
    tagName: "dt-scroll-indicator",
    sourceComponent: "ScrollIndicator",
    contract: "ScrollIndicator",
    defaultBackend: "native",
    nativeClassName: "DtScrollIndicatorElement",
    description:
      "Animated hero-footer affordance that scrolls to a named target; motion is CSS-driven and reduced-motion gated.",
    storyParity: storyParity(),
    props: [
      nativeProp(
        "label",
        "string",
        "Optional visible label; names the destination.",
      ),
      nativeProp(
        "targetId",
        "string",
        "Element id scrolled into view on activation.",
        {
          attributeName: "target-id",
        },
      ),
      nativeProp(
        "variant",
        "string",
        "Icon treatment: chevron, arrow or mouse.",
      ),
      nativeProp(
        "position",
        "string",
        "Horizontal placement: center, left or right.",
      ),
      nativeProp(
        "motion",
        "string",
        "Motion hint: bounce, pulse, fade or none.",
      ),
      nativeProp(
        "speed",
        "string",
        "Duration of one motion half-cycle, in seconds.",
      ),
      nativeProp(
        "distance",
        "string",
        "Vertical travel of the bounce motion, in pixels.",
      ),
    ],
    events: [],
  },
  {
    tagName: "dt-spinner",
    adapterClassName: "DtSpinnerReactElement",
    sourceComponent: "Spinner",
    contract: "Spinner",
    defaultBackend: "native",
    nativeClassName: "DtSpinnerElement",
    description: "Indeterminate loading indicator.",
    storyParity: storyParity(),
    props: [stringProp("label"), stringProp("size")],
    events: [],
  },
  {
    tagName: "dt-progress",
    adapterClassName: "DtProgressReactElement",
    sourceComponent: "Progress",
    contract: "Progress",
    defaultBackend: "native",
    nativeClassName: "DtProgressElement",
    description: "Linear determinate or indeterminate progress indicator.",
    storyParity: storyParity(),
    props: [
      numberProp("value"),
      numberProp("max"),
      stringProp("label"),
      stringProp("size"),
      stringProp("state"),
      booleanProp("indeterminate"),
    ],
    events: [],
  },
  {
    tagName: "dt-status-dot",
    sourceComponent: "StatusDot",
    contract: "StatusDot",
    defaultBackend: "native",
    nativeClassName: "DtStatusDotElement",
    description:
      "Inline semantic status indicator with visible or screen-reader label.",
    storyParity: storyParity(),
    props: [
      stringProp("tone"),
      stringProp("size"),
      booleanProp("pulse"),
      stringProp("label"),
    ],
    events: [],
  },
  {
    tagName: "dt-divider",
    sourceComponent: "Divider",
    contract: "Divider",
    defaultBackend: "native",
    nativeClassName: "DtDividerElement",
    description: "Decorative or semantic horizontal and vertical separator.",
    storyParity: storyParity(),
    props: [stringProp("orientation"), booleanProp("decorative")],
    events: [],
  },
  {
    tagName: "dt-icon",
    sourceComponent: "Icon",
    contract: "Icon",
    defaultBackend: "native",
    nativeClassName: "DtIconElement",
    description:
      "Framework-free Phosphor icon with design-system sizing and motion.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Brand Icon",
          reason:
            "React brand-asset node injection is outside the raw Phosphor icon registry contract.",
        },
      ],
    }),
    props: [
      stringProp("name"),
      stringProp("weight"),
      stringProp("legacyStyle"),
      stringProp("size"),
      stringProp("color"),
      numberProp("rotate"),
      stringProp("flip"),
      booleanProp("spin"),
      booleanProp("pulse"),
      booleanProp("mirrored"),
      stringProp("ariaLabel"),
      booleanProp("decorative"),
    ],
    events: [],
  },
  {
    tagName: "dt-alert-banner",
    sourceComponent: "AlertBanner",
    contract: "AlertBanner",
    defaultBackend: "native",
    nativeClassName: "DtAlertBannerElement",
    description:
      "Persistent semantic alert with title, description, action, and dismiss slots.",
    storyParity: storyParity(),
    props: [
      stringProp("tone"),
      stringProp("titleText", "title"),
      stringProp("description"),
      booleanProp("showIcon"),
      booleanProp("dismissible"),
      stringProp("ariaLive", "aria-live"),
    ],
    events: [
      {
        callbackProp: "onDismiss",
        name: "dismiss",
        description: "Dispatched when the dismiss control is activated.",
      },
    ],
  },
  {
    tagName: "dt-text",
    sourceComponent: "Text",
    contract: "Text",
    defaultBackend: "native",
    nativeClassName: "DtTextElement",
    description:
      "Semantic body and inline typography with tokenized size and line height.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Text Compliance",
          reason:
            "React-only internal compliance fixture; native parity is enforced by package and Storybook browser gates.",
        },
      ],
    }),
    props: [
      stringProp("content", "children", "Fallback text for the default slot."),
      stringProp("as"),
      stringProp("size"),
      stringProp("lineHeight"),
    ],
    events: [],
  },
  {
    tagName: "dt-title",
    sourceComponent: "Title",
    contract: "Title",
    defaultBackend: "native",
    nativeClassName: "DtTitleElement",
    description:
      "Semantic heading with independent level, display size, and line-height controls.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Title Compliance",
          reason:
            "React-only internal compliance fixture; native parity is enforced by package and Storybook browser gates.",
        },
      ],
    }),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback heading text for the default slot.",
      ),
      stringProp("as"),
      booleanProp("unstyled"),
      stringProp("size"),
      numberProp("level"),
      stringProp("lineHeight"),
    ],
    events: [],
  },
  {
    tagName: "dt-list",
    sourceComponent: "List",
    contract: "List",
    defaultBackend: "native",
    nativeClassName: "DtListElement",
    description:
      "Semantic ordered or unordered list with tokenized type, spacing, and marker styles.",
    storyParity: storyParity(),
    props: [
      stringArrayProperty(
        "items",
        "items",
        "JSON string array or string[] property; light-DOM li children are also supported.",
      ),
      stringProp("as"),
      stringProp("size"),
      stringProp("lineHeight"),
      stringProp("listStyleType"),
      stringProp("spacing"),
      stringProp("role"),
    ],
    events: [],
  },
  {
    tagName: "dt-section",
    sourceComponent: "Section",
    contract: "Section",
    defaultBackend: "native",
    nativeClassName: "DtSectionElement",
    description:
      "Semantic page section with responsive spacing and theme-aware surfaces.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback content for the default slot.",
      ),
      stringProp("spacing"),
      stringProp("background"),
      stringProp("spotlightTarget"),
      nativeProp("id", "string"),
      nativeProp("ariaLabel", "string"),
      nativeProp("ariaLabelledby", "string"),
      nativeProp("ariaDescribedby", "string"),
    ],
    events: [],
  },
  {
    tagName: "dt-stack",
    sourceComponent: "Stack",
    contract: "Stack",
    defaultBackend: "native",
    nativeClassName: "DtStackElement",
    description:
      "Semantic flex stack with tokenized direction, gap, alignment, distribution, and wrapping.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback content for the default slot.",
      ),
      stringProp("direction"),
      stringProp("gap"),
      stringProp("align"),
      stringProp("justify"),
      booleanProp("wrap"),
      stringProp("as"),
    ],
    events: [],
  },
  {
    tagName: "dt-card",
    sourceComponent: "Card",
    contract: "Card",
    defaultBackend: "native",
    nativeClassName: "DtCardElement",
    description:
      "Semantic content surface with structured header, body, footer, link, and loading modes.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback content for the default slot.",
      ),
      stringProp("variant"),
      stringProp("padding"),
      stringProp("as"),
      stringProp(
        "titleText",
        "title",
        "Card heading text; uses title-text to avoid the global HTML title tooltip.",
      ),
      numberProp("titleLevel", "titleProps"),
      stringProp("titleAs", "titleProps"),
      stringProp("titleSize", "titleProps"),
      stringProp("description"),
      stringProp("descriptionAs", "descriptionProps"),
      stringProp("descriptionSize", "descriptionProps"),
      stringProp("link"),
      stringProp("linkLabel"),
      booleanProp("loading"),
    ],
    slots: [
      slot("", "Card body content."),
      slot("header-start", "Leading header content; replaces the title block."),
      slot("header-end", "Trailing header metadata or actions."),
      slot("extra", "Deprecated alias for header-end."),
      slot("footer-start", "Leading footer action region."),
      slot("footer-end", "Trailing footer action region."),
    ],
    events: [],
  },
  {
    tagName: "dt-center",
    sourceComponent: "Center",
    contract: "Center",
    defaultBackend: "native",
    nativeClassName: "DtCenterElement",
    description: "Both-axis centering primitive for focal content.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback content for the default slot.",
      ),
      stringProp(
        "as",
        "as",
        "Safe intrinsic wrapper element; supports common sectioning, grouping, list, and phrasing tags.",
      ),
    ],
    slots: [slot("", "Content centered on both axes.")],
    events: [],
  },
  {
    tagName: "dt-container",
    sourceComponent: "Container",
    contract: "Container",
    defaultBackend: "native",
    nativeClassName: "DtContainerElement",
    description:
      "Responsive page-width constraint with tokenized gutters and semantic wrappers.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback content for the default slot.",
      ),
      stringProp("size"),
      booleanValueProperty(
        "center",
        "center",
        "Boolean property; the attribute accepts true or false and defaults to true when absent.",
      ),
      stringProp(
        "as",
        "as",
        "Safe intrinsic wrapper element; supports common sectioning, grouping, list, and phrasing tags.",
      ),
    ],
    slots: [slot("", "Content constrained by the container.")],
    events: [],
  },
  {
    tagName: "dt-spacer",
    sourceComponent: "Spacer",
    contract: "Spacer",
    defaultBackend: "native",
    nativeClassName: "DtSpacerElement",
    description:
      "Accessibility-hidden escape hatch for tokenized spatial gaps.",
    storyParity: storyParity(),
    props: [stringProp("size"), stringProp("axis")],
    events: [],
  },
  {
    tagName: "dt-aspect-ratio",
    sourceComponent: "AspectRatio",
    contract: "AspectRatio",
    defaultBackend: "native",
    nativeClassName: "DtAspectRatioElement",
    description: "Clipped media frame that reserves a tokenized aspect ratio.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "content",
        "children",
        "Fallback content for the default slot.",
      ),
      stringProp("ratio"),
    ],
    slots: [slot("", "Media or placeholder content filling the ratio frame.")],
    events: [],
  },
  {
    tagName: "dt-empty-state",
    sourceComponent: "EmptyState",
    contract: "EmptyState",
    defaultBackend: "native",
    nativeClassName: "DtEmptyStateElement",
    description:
      "Empty-result composition with semantic heading, description, icon, and action slots.",
    storyParity: storyParity(),
    props: [
      stringProp("icon"),
      stringProp("titleText", "title"),
      stringProp("description"),
      stringProp("headingLevel"),
      stringProp("size"),
    ],
    events: [],
  },
  {
    tagName: "dt-label",
    sourceComponent: "Label",
    contract: "Label",
    defaultBackend: "native",
    nativeClassName: "DtLabelElement",
    description: "Native form label with required and disabled presentation.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Label Compliance",
          reason:
            "React-only compliance fixture; native semantics are enforced by package and Storybook browser checks.",
        },
      ],
    }),
    props: [
      nativeProp("content", "string", "Fallback text for the default slot."),
      {
        ...stringProp("for", "htmlFor"),
        description: "ID of the labelled control.",
      },
      stringProp("tooltipText"),
      booleanProp("required"),
      booleanProp("disabled"),
      nativeProp(
        "requiredText",
        "string",
        "Override the localized screen-reader text for the required marker.",
      ),
      nativeProp("title", "string"),
    ],
    slots: [slot("", "Visible label content.")],
    events: [],
  },
  {
    tagName: "dt-helper-text",
    sourceComponent: "HelperText",
    contract: "HelperText",
    defaultBackend: "native",
    nativeClassName: "DtHelperTextElement",
    description: "Supporting or validation text with semantic state feedback.",
    storyParity: storyParity(),
    props: [
      stringProp("content", "children", "Fallback text for the default slot."),
      stringProp("state"),
      nativeProp("id", "string"),
    ],
    slots: [slot("", "Supporting message content.")],
    events: [],
  },
  {
    tagName: "dt-form-field",
    sourceComponent: "FormField",
    contract: "FormField",
    defaultBackend: "native",
    nativeClassName: "DtFormFieldElement",
    description: "Accessible fieldset wrapper for grouped form controls.",
    storyParity: storyParity(),
    props: [
      stringProp("legend"),
      stringProp("groupDescription"),
      stringProp("error"),
      booleanProp("required"),
      booleanProp("disabled"),
    ],
    slots: [
      slot("", "Grouped form controls."),
      slot("legend", "Rich legend content overriding the legend attribute."),
      slot(
        "group-description",
        "Rich group description overriding the group-description attribute.",
      ),
      slot("error", "Rich error content overriding the error attribute."),
    ],
    events: [],
  },
  {
    tagName: "dt-text-input",
    sourceComponent: "TextInput",
    contract: "TextInput",
    defaultBackend: "native",
    nativeClassName: "DtTextInputElement",
    description:
      "Form-associated single-line field with native validation, label, and messages.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      stringProp("type"),
      stringProp("size"),
      stringProp("value"),
      stringProp("defaultValue"),
      stringProp("error"),
      stringProp("helperText"),
      booleanProp("disabled"),
      booleanProp("clearable"),
      booleanProp("hideLabel"),
      nativeProp("required", "boolean"),
      nativeProp("placeholder", "string"),
      nativeProp("name", "string"),
      {
        ...nativeProp(
          "clearLabelPrefix",
          "string",
          "Override the localized clear-button accessible-label prefix.",
        ),
        attributeOnly: true,
      },
    ],
    events: [
      {
        callbackProp: "onValueChange",
        name: "value-change",
        description: "Dispatched with detail.value after user input.",
      },
      {
        callbackProp: "onClear",
        name: "clear",
        description: "Dispatched after the clear control resets the field.",
      },
    ],
  },
  {
    tagName: "dt-text-area",
    sourceComponent: "TextArea",
    contract: "TextArea",
    defaultBackend: "native",
    nativeClassName: "DtTextAreaElement",
    description:
      "Form-associated multiline field with bounded auto-grow and messages.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      stringProp("value"),
      stringProp("error"),
      stringProp("helperText"),
      booleanProp("animateResize"),
      numberProp("minRows"),
      numberProp("maxRows"),
      nativeProp("defaultValue", "string"),
      nativeProp("disabled", "boolean"),
      nativeProp("required", "boolean"),
      nativeProp("placeholder", "string"),
      nativeProp("name", "string"),
    ],
    events: [
      {
        callbackProp: "onChange",
        name: "value-change",
        description: "Dispatched with detail.value after user input.",
      },
    ],
  },
  {
    tagName: "dt-checkbox",
    sourceComponent: "Checkbox",
    contract: "Checkbox",
    defaultBackend: "native",
    nativeClassName: "DtCheckboxElement",
    description:
      "Form-associated checkbox with indeterminate, validation, and messaging states.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Checkbox Compliance",
          reason:
            "React-only internal compliance fixture; native behavior is enforced by the web-component DoD and browser tests.",
        },
      ],
    }),
    props: [
      stringProp("label"),
      booleanProp("showLabel"),
      booleanProp("checked"),
      booleanProp("indeterminate"),
      booleanProp("disabled"),
      booleanProp("defaultChecked"),
      stringProp("size"),
      stringProp("error"),
      stringProp("helperText"),
      nativeProp("required", "boolean"),
      nativeProp("name", "string"),
      nativeProp("value", "string"),
      {
        ...nativeProp(
          "requiredMessage",
          "string",
          "Override the localized required-state validation message.",
        ),
        attributeOnly: true,
      },
    ],
    events: [
      {
        callbackProp: "onCheckedChange",
        name: "checked-change",
        description: "Dispatched with detail.checked after user activation.",
      },
    ],
  },
  {
    tagName: "dt-checkbox-group",
    sourceComponent: "CheckboxGroup",
    contract: "CheckboxGroup",
    defaultBackend: "native",
    nativeClassName: "DtCheckboxGroupElement",
    description:
      "Accessible checkbox fieldset with optional select-all behavior.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Checkbox Group Compliance",
          reason:
            "React-only compliance fixture; native group behavior is enforced by web-component tests.",
        },
      ],
    }),
    props: [
      stringProp("label"),
      {
        ...stringProp("options"),
        propertyType: "{ value: string; label: string; disabled?: boolean }[]",
      },
      booleanProp("showMasterCheckbox"),
      stringProp("masterLabel"),
      {
        ...stringProp("defaultSelected"),
        propertyType: "string[]",
      },
      nativeProp("name", "string"),
    ],
    slots: [slot("", "Declarative dt-checkbox children overriding options.")],
    events: [
      {
        callbackProp: "onChange",
        name: "selected-change",
        description: "Dispatched with detail.selected after selection changes.",
      },
    ],
  },
  {
    tagName: "dt-radio",
    sourceComponent: "Radio",
    contract: "Radio",
    defaultBackend: "native",
    nativeClassName: "DtRadioElement",
    description: "Form-associated native radio control with tokenized sizing.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      stringProp("value"),
      stringProp("name"),
      booleanProp("checked"),
      booleanProp("defaultChecked"),
      booleanProp("disabled"),
      stringProp("size"),
      booleanProp("showLabel"),
      nativeProp("required", "boolean"),
      nativeProp(
        "requiredMessage",
        "string",
        "Override the localized required-state validation message.",
      ),
    ],
    events: [
      {
        callbackProp: "onCheckedChange",
        name: "checked-change",
        description: "Dispatched with detail.checked after user activation.",
      },
    ],
  },
  {
    tagName: "dt-radio-group",
    sourceComponent: "RadioGroup",
    contract: "RadioGroup",
    defaultBackend: "native",
    nativeClassName: "DtRadioGroupElement",
    description:
      "Form-associated radio fieldset with controlled and default selection modes.",
    storyParity: storyParity(),
    props: [
      stringProp("name"),
      stringProp("legend"),
      {
        ...stringProp("options"),
        propertyType: "{ value: string; label: string; disabled?: boolean }[]",
      },
      stringProp("value"),
      stringProp("defaultValue"),
      stringProp("orientation"),
      stringProp("size"),
      booleanProp("disabled"),
      stringProp("error"),
      stringProp("helperText"),
      nativeProp("required", "boolean"),
      nativeProp(
        "requiredMessage",
        "string",
        "Override the localized required-state validation message.",
      ),
    ],
    slots: [slot("", "Declarative dt-radio children overriding options.")],
    events: [
      {
        callbackProp: "onValueChange",
        name: "value-change",
        description: "Dispatched with detail.value after selection changes.",
      },
    ],
  },
  {
    tagName: "dt-select",
    sourceComponent: "Select",
    contract: "Select",
    defaultBackend: "native",
    nativeClassName: "DtSelectElement",
    description:
      "Form-associated native select with declarative options and validation messages.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Select Compliance",
          reason:
            "React-only compliance fixture; native select behavior is enforced by package and browser checks.",
        },
      ],
    }),
    props: [
      stringProp("label"),
      {
        ...stringProp("options"),
        propertyType:
          "{ value: string; label: string; disabled?: boolean; selected?: boolean }[]",
      },
      stringProp("helperText"),
      stringProp("error"),
      stringProp("size"),
      nativeProp("value", "string"),
      nativeProp("defaultValue", "string"),
      booleanProp("disabled"),
      nativeProp("required", "boolean"),
      nativeProp("name", "string"),
      {
        ...nativeProp(
          "requiredText",
          "string",
          "Override the localized screen-reader text for the required marker.",
        ),
        attributeOnly: true,
      },
    ],
    slots: [
      slot("", "Declarative dt-select-option children overriding options."),
    ],
    events: [
      {
        callbackProp: "onValueChange",
        name: "value-change",
        description:
          "Dispatched with detail.value before the compatibility change event.",
      },
      {
        callbackProp: "onChange",
        name: "change",
        description:
          "Compatibility change event dispatched after value-change.",
      },
    ],
  },
  {
    tagName: "dt-select-option",
    sourceComponent: "SelectOption",
    contract: "SelectOption",
    contractDirectory: "Select",
    defaultBackend: "native",
    nativeClassName: "DtSelectOptionElement",
    description: "Declarative option data materialized by a parent dt-select.",
    storyParity: storyParity(),
    props: [
      nativeProp("value", "string"),
      nativeProp("label", "string"),
      nativeProp("disabled", "boolean"),
      nativeProp("selected", "boolean"),
    ],
    slots: [slot("", "Option label overriding the label attribute.")],
    events: [],
  },
  {
    tagName: "dt-avatar",
    sourceComponent: "Avatar",
    contract: "Avatar",
    defaultBackend: "native",
    nativeClassName: "DtAvatarElement",
    description:
      "Profile image or initials with optional navigation and host-owned menu data.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "With Menu",
          reason:
            "React icon nodes and callback handlers are host-specific; the native menuItems property accepts serializable menu data and dispatches menu-select events.",
        },
      ],
    }),
    props: [
      stringProp("name"),
      stringProp("imageUrl"),
      booleanProp("clickable"),
      stringProp("destinationUrl"),
      stringProp("size"),
      stringProp("srcSet"),
      stringProp("sizes"),
      stringProp("loading"),
      stringProp("decoding"),
      {
        ...stringProp("menuItems"),
        propertyType:
          "{ id?: string; value?: string; label: string; href?: string; icon?: string; disabled?: boolean }[]",
      },
      stringProp("menuLabel"),
      stringProp("variant"),
    ],
    events: [
      {
        callbackProp: null,
        name: "menu-select",
        description:
          "Dispatched with the selected serializable menu item in detail.item.",
      },
    ],
    slots: [
      slot(
        "menu-item",
        "Host-rendered menu controls used instead of the menuItems property.",
      ),
    ],
  },
  {
    tagName: "dt-avatar-group",
    sourceComponent: "AvatarGroup",
    contract: "AvatarGroup",
    defaultBackend: "native",
    nativeClassName: "DtAvatarGroupElement",
    description: "Overlapping native avatar cluster with accessible overflow.",
    storyParity: storyParity(),
    props: [stringProp("ariaLabel"), numberProp("max"), stringProp("size")],
    slots: [slot("", "Native dt-avatar members in display order.")],
    events: [],
  },
  {
    tagName: "dt-display",
    sourceComponent: "Display",
    contract: "Display",
    defaultBackend: "native",
    nativeClassName: "DtDisplayElement",
    description: "Hero-scale semantic display typography.",
    storyParity: storyParity(),
    props: [
      stringProp("as"),
      stringProp("content", "children", "Text fallback for the default slot."),
    ],
    slots: [slot("", "Display copy or rich inline content.")],
    events: [],
  },
  {
    tagName: "dt-flex-box",
    sourceComponent: "FlexBox",
    contract: "FlexBox",
    defaultBackend: "native",
    nativeClassName: "DtFlexBoxElement",
    description: "Framework-neutral flexbox layout primitive.",
    storyParity: storyParity(),
    props: [
      stringProp("direction"),
      stringProp("wrap"),
      stringProp("justify"),
      stringProp("align"),
      stringProp("alignContent"),
      { ...stringProp("gap"), propertyType: "number | string" },
      { ...stringProp("rowGap"), propertyType: "number | string" },
      { ...stringProp("columnGap"), propertyType: "number | string" },
    ],
    slots: [slot("", "Flex items.")],
    events: [],
  },
  {
    tagName: "dt-grid",
    sourceComponent: "Grid",
    contract: "Grid",
    defaultBackend: "native",
    nativeClassName: "DtGridElement",
    description:
      "CSS grid primitive with token-breakpoint responsive columns and gaps.",
    storyParity: storyParity(),
    props: [
      { ...stringProp("columns"), propertyType: "number | string" },
      { ...stringProp("tabletColumns"), propertyType: "number | string" },
      { ...stringProp("desktopColumns"), propertyType: "number | string" },
      { ...stringProp("wideColumns"), propertyType: "number | string" },
      { ...stringProp("ultraColumns"), propertyType: "number | string" },
      { ...stringProp("rows"), propertyType: "number | string" },
      stringProp("gap"),
      stringProp("tabletGap"),
      stringProp("desktopGap"),
      stringProp("wideGap"),
      stringProp("ultraGap"),
      stringProp("rowGap"),
      stringProp("colGap"),
      stringProp("align"),
      stringProp("justify"),
    ],
    slots: [
      slot(
        "",
        "Grid cells; span and row-span attributes on direct children control placement.",
      ),
    ],
    events: [],
  },
  {
    tagName: "dt-kbd",
    sourceComponent: "Kbd",
    contract: "Kbd",
    defaultBackend: "native",
    nativeClassName: "DtKbdElement",
    description: "Semantic keyboard-key indicator styled as a keycap.",
    storyParity: storyParity(),
    props: [
      stringProp("size"),
      nativeProp("content", "string", "Text fallback for the default slot."),
    ],
    slots: [slot("", "Key label or symbol.")],
    events: [],
  },
  {
    tagName: "dt-list-item",
    sourceComponent: "ListItem",
    contract: "ListItem",
    defaultBackend: "native",
    nativeClassName: "DtListItemElement",
    description:
      "Presentational row: leading icon, truncating label, end-aligned meta, trailing icon, selection check, destructive tone.",
    storyParity: storyParity(),
    props: [
      stringProp("label", "children"),
      stringProp("icon"),
      stringProp("meta"),
      stringProp("trailingIcon"),
      stringProp("tone"),
      booleanProp("selected"),
      booleanProp("disabled"),
      booleanProp("highlighted"),
    ],
    slots: [
      slot("", "Primary label (overrides the label attribute)."),
      slot("icon", "Leading icon (overrides the icon attribute)."),
      slot(
        "meta",
        "End-aligned secondary content (overrides the meta attribute).",
      ),
      slot(
        "trailing-icon",
        "Trailing icon (overrides the trailing-icon attribute).",
      ),
    ],
    events: [],
  },
  {
    tagName: "dt-skeleton",
    sourceComponent: "Skeleton",
    contract: "Skeleton",
    defaultBackend: "native",
    nativeClassName: "DtSkeletonElement",
    description:
      "Motion-aware loading placeholder for text, media, avatars, and cards.",
    storyParity: storyParity(),
    props: [
      stringProp("variant"),
      { ...stringProp("width"), propertyType: "number | string" },
      { ...stringProp("height"), propertyType: "number | string" },
      numberProp("lines"),
      stringProp("label"),
      { ...booleanProp("animate"), attributeOnly: true },
    ],
    events: [],
  },
  {
    tagName: "dt-visually-hidden",
    sourceComponent: "VisuallyHidden",
    contract: "VisuallyHidden",
    defaultBackend: "native",
    nativeClassName: "DtVisuallyHiddenElement",
    description: "Screen-reader-only semantic content.",
    storyParity: storyParity(),
    props: [
      stringProp("as"),
      stringProp("content", "children", "Text fallback for the default slot."),
    ],
    slots: [slot("", "Content exposed to assistive technology.")],
    events: [],
  },
  {
    tagName: "dt-switch",
    sourceComponent: "Switch",
    contract: "Switch",
    defaultBackend: "native",
    nativeClassName: "DtSwitchElement",
    description:
      "Immediate-action switch with loading, placement, and message states.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Switch Compliance",
          reason:
            "React-only internal compliance fixture; native behavior is enforced by the web-component DoD and browser tests.",
        },
      ],
    }),
    props: [
      booleanProp("checked"),
      booleanProp("defaultChecked"),
      booleanProp("disabled"),
      booleanProp("loading"),
      stringProp("size"),
      stringProp("label"),
      stringProp("labelPlacement"),
      stringProp("helperText"),
      stringProp("error"),
    ],
    events: [
      {
        callbackProp: "onCheckedChange",
        name: "checked-change",
        description: "Dispatched with detail.checked after user activation.",
      },
    ],
  },
  {
    tagName: "dt-modal",
    sourceComponent: "Modal",
    contract: "Modal",
    defaultBackend: "native",
    nativeClassName: "DtModalElement",
    description:
      "Layered dialog with focus containment, dismissal, loading, and severity states.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "severity",
        "severity",
        "Optional success, error, warning, or info treatment. Error and warning use alertdialog semantics.",
      ),
      booleanProp(
        "loading",
        "isLoading",
        "Replaces the body with a centered progress indicator and hides the footer.",
      ),
      stringProp(
        "titleSize",
        "titleSize",
        "Heading size token: xxs, xs, sm, md, lg, xl, or xxl.",
      ),
      stringProp(
        "iconSize",
        "iconSize",
        "Semantic or slotted header icon size from 2xs through 2xl.",
      ),
      booleanProp(
        "open",
        "isOpen",
        "Current visibility. Use with controlled when the host owns state.",
      ),
      nativeProp(
        "defaultOpen",
        "boolean",
        "Opens an uncontrolled modal when it first connects.",
      ),
      nativeProp(
        "controlled",
        "boolean",
        "Makes dismissal request-only; the host must update open.",
      ),
      stringProp(
        "dialogTitle",
        "title",
        "Dialog heading; dialog-title avoids the global HTML title tooltip attribute.",
      ),
      stringProp(
        "description",
        "description",
        "Concise supporting text associated with the dialog through aria-describedby.",
      ),
      booleanProp(
        "showFooter",
        "showFooter",
        "Shows the footer slot or the default acknowledgement action.",
      ),
      stringProp(
        "animation",
        "animation",
        "Entrance animation: none, scale, slide, or fade. Disabled by reduced-motion preferences.",
      ),
      booleanProp(
        "showCloseIcon",
        "showCloseIcon",
        "Shows a design-system IconButton in the header.",
      ),
      stringProp(
        "closeIconName",
        "closeIconName",
        "Icon registry name used by the header IconButton.",
      ),
      stringProp(
        "closeButtonLabel",
        "closeButtonLabel",
        "Accessible name for the header close IconButton.",
      ),
      nativeProp(
        "dismissOnBackdrop",
        "boolean",
        "Whether an overlay click requests dismissal. Defaults to true.",
      ),
    ],
    slots: [
      slot("", "Dialog body content."),
      slot("icon", "Optional header icon."),
      slot("menu", "Optional contextual header controls."),
      slot("footer", "Optional dialog actions."),
    ],
    events: [
      {
        callbackProp: "onClose",
        name: "dismiss-request",
        description:
          "Dispatched when Escape, the backdrop, or the close control requests dismissal.",
      },
      {
        callbackProp: null,
        name: "open-change",
        description:
          "Dispatched with detail.open and detail.reason after state changes.",
      },
    ],
  },
  {
    tagName: "dt-tooltip",
    sourceComponent: "Tooltip",
    contract: "Tooltip",
    defaultBackend: "native",
    nativeClassName: "DtTooltipElement",
    description:
      "Non-interactive accessible hint shown from hover and keyboard focus.",
    storyParity: storyParity(),
    props: [
      stringProp("content", "children", "Short tooltip text."),
      stringProp("placement", "side"),
      numberProp("offset", "sideOffset"),
      nativeProp("open", "boolean"),
      nativeProp("defaultOpen", "boolean"),
      nativeProp("controlled", "boolean"),
      nativeProp("delay", "number"),
      nativeProp("disabled", "boolean"),
    ],
    slots: [slot("", "The trigger element whose semantics remain intact.")],
    events: [
      {
        callbackProp: null,
        name: "open-change",
        description:
          "Dispatched with detail.open when tooltip visibility changes.",
      },
    ],
  },
  {
    tagName: "dt-menu",
    sourceComponent: "Menu",
    contract: "Menu",
    defaultBackend: "native",
    nativeClassName: "DtMenuElement",
    description:
      "Menu-button primitive with roving focus, typeahead, and dismissal behavior.",
    storyParity: storyParity({
      extensions: [
        {
          native: "Declarative Items",
          reason:
            "Native-only slotted light-DOM items API; the React equivalent is ordinary JSX children, which every React story already demonstrates.",
        },
      ],
    }),
    props: [
      stringProp("side"),
      stringProp("align"),
      numberProp("sideOffset"),
      nativeProp("open", "boolean"),
      nativeProp("defaultOpen", "boolean"),
      nativeProp("modal", "boolean"),
      {
        ...nativeProp("items", "string"),
        propertyType: String.raw`import("../native/menu").DtMenuItem[]`,
      },
    ],
    slots: [
      slot("trigger", "Menu trigger control."),
      slot("", "Declarative menu item content overriding the items property."),
    ],
    events: [
      {
        callbackProp: null,
        name: "open-change",
        description:
          "Dispatched with detail.open when menu visibility changes.",
      },
      {
        callbackProp: null,
        name: "item-select",
        description: "Dispatched with the activated item in event.detail.",
      },
    ],
  },
  {
    tagName: "dt-split-button",
    sourceComponent: "SplitButton",
    contract: "SplitButton",
    defaultBackend: "native",
    nativeClassName: "DtSplitButtonElement",
    description:
      "Primary action paired with an accessible menu of related actions.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      {
        ...stringProp("options"),
        propertyType: String.raw`import("../native/split-button").DtSplitButtonOption[]`,
      },
      stringProp("menuAlign"),
      nativeProp("variant", "string"),
      nativeProp("size", "string"),
      nativeProp("surface", "string"),
      nativeProp("rounded", "boolean"),
      booleanProp("disabled"),
      stringProp("toggleLabel"),
      nativeProp("tooltip", "string"),
      nativeProp("accessibleName", "string"),
    ],
    slots: [slot("label", "Rich primary-action label content.")],
    events: [
      {
        callbackProp: "onPrimaryClick",
        name: "primary-click",
        description: "Dispatched when the primary action is activated.",
      },
      {
        callbackProp: null,
        name: "option-select",
        description:
          "Dispatched with the selected secondary option in event.detail.",
      },
    ],
  },
  {
    tagName: "dt-tabs",
    sourceComponent: "Tabs",
    contract: "Tabs",
    defaultBackend: "native",
    nativeClassName: "DtTabsElement",
    description:
      "Keyboard-navigable tab list with controlled and uncontrolled selection.",
    storyParity: storyParity(),
    props: [
      stringProp("activeTab"),
      stringProp("defaultActiveTab"),
      stringProp("size"),
      {
        ...stringProp("tabs"),
        propertyType:
          "{ key: string; label: string; disabled?: boolean; icon?: string; count?: number }[]",
      },
      stringProp("ariaLabel"),
      stringProp("variant"),
      nativeProp("orientation", "string"),
      nativeProp("activation", "string"),
    ],
    slots: [
      slot(
        "",
        "Tab panel content selected through slot names matching tab keys.",
      ),
    ],
    events: [
      {
        callbackProp: "onTabChange",
        name: "tab-change",
        description:
          "Dispatched with detail.activeTab after active-tab changes.",
      },
    ],
  },
  {
    tagName: "dt-segmented-control",
    sourceComponent: "SegmentedControl",
    contract: "SegmentedControl",
    defaultBackend: "native",
    nativeClassName: "DtSegmentedControlElement",
    description: "Single-select segmented control with radio-group semantics.",
    storyParity: storyParity(),
    props: [
      {
        ...stringProp("items"),
        propertyType:
          "{ value: string; label: string; icon?: string; disabled?: boolean }[]",
      },
      stringProp("value"),
      nativeProp("defaultValue", "string"),
      stringProp("size"),
      stringProp("ariaLabel"),
      nativeProp("disabled", "boolean"),
      nativeProp("orientation", "string"),
    ],
    events: [
      {
        callbackProp: "onValueChange",
        name: "value-change",
        description: "Dispatched with detail.value after selection changes.",
      },
    ],
  },
  {
    tagName: "dt-accordion",
    sourceComponent: "Accordion",
    contract: "Accordion",
    defaultBackend: "native",
    nativeClassName: "DtAccordionElement",
    description:
      "Single or multi-open disclosure group with controlled state support.",
    storyParity: storyParity(),
    props: [
      {
        ...stringProp("items"),
        propertyType:
          "{ id: string; title: string; content: string; disabled?: boolean }[]",
      },
      stringProp("type"),
      stringProp("variant"),
      stringProp("defaultOpenId"),
      stringArrayProperty("defaultOpenIds"),
      stringArrayProperty("openIds"),
    ],
    events: [
      {
        callbackProp: "onOpenChange",
        name: "open-change",
        description: "Dispatched with detail.openIds after disclosure changes.",
      },
    ],
  },
  {
    tagName: "dt-expandable-section",
    sourceComponent: "ExpandableSection",
    contract: "ExpandableSection",
    defaultBackend: "native",
    nativeClassName: "DtExpandableSectionElement",
    description:
      "Single disclosure for progressively revealing supporting content.",
    storyParity: storyParity({
      equivalents: [
        { react: "Example (contact form editorial)", native: "Example" },
      ],
    }),
    props: [
      stringProp("collapsedLabel"),
      stringProp("expandedLabel"),
      booleanProp("defaultExpanded"),
      booleanProp("expanded"),
    ],
    slots: [slot("", "Content revealed by the disclosure control.")],
    events: [
      {
        callbackProp: "onExpandedChange",
        name: "expanded-change",
        description:
          "Dispatched with detail.expanded after disclosure changes.",
      },
    ],
  },
  {
    tagName: "dt-command-palette",
    sourceComponent: "CommandPalette",
    contract: "CommandPalette",
    defaultBackend: "native",
    nativeClassName: "DtCommandPaletteElement",
    description:
      "Modal command launcher with filtering, active-option navigation, and host-owned command execution.",
    storyParity: storyParity(),
    props: [
      booleanProp("open"),
      nativeProp("defaultOpen", "boolean"),
      nativeProp("controlled", "boolean"),
      {
        ...stringProp("items"),
        propertyType: String.raw`import("../native/command-palette").DtCommandPaletteItem[]`,
      },
      stringProp("label"),
      stringProp("placeholder"),
      stringProp("emptyText"),
    ],
    events: [
      {
        callbackProp: "onClose",
        name: "dismiss-request",
        description:
          "Dispatched when Escape, the backdrop, or command selection requests dismissal.",
      },
      {
        callbackProp: null,
        name: "item-select",
        description:
          "Dispatched with the selected command in event.detail before dismissal is requested.",
      },
      {
        callbackProp: null,
        name: "open-change",
        description:
          "Dispatched with detail.open after uncontrolled visibility changes.",
      },
    ],
  },
  {
    tagName: "dt-nav-menu-list",
    sourceComponent: "NavMenuList",
    contract: "NavMenuList",
    defaultBackend: "native",
    nativeClassName: "DtNavMenuListElement",
    description:
      "Host-routed navigation list with exact or boundary-safe active-page matching.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Nav Menu List Compliance",
          reason:
            "React-only internal compliance fixture; native navigation behavior is enforced by the web-component DoD and browser tests.",
        },
      ],
    }),
    props: [
      {
        ...stringProp("items"),
        propertyType: String.raw`import("../native/nav-menu-list").DtNavMenuItem[]`,
      },
      nativeProp(
        "currentPath",
        "string",
        "Current host route used to derive aria-current without inspecting a framework router.",
      ),
    ],
    events: [
      {
        callbackProp: "onNavigate",
        name: "navigate",
        description:
          "Dispatched with the activated navigation item in event.detail.",
      },
    ],
  },
  {
    tagName: "dt-language-switcher",
    sourceComponent: "LanguageSwitcher",
    contract: "LanguageSwitcher",
    defaultBackend: "native",
    nativeClassName: "DtLanguageSwitcherElement",
    description:
      "Compact language chooser with host-owned locale changes and accessible disclosure behavior.",
    storyParity: storyParity(),
    props: [
      {
        ...stringProp("languages"),
        propertyType: String.raw`import("../native/language-switcher").DtLanguageSwitcherOption[]`,
      },
      stringProp("currentLang"),
      nativeProp("open", "boolean"),
      stringProp("buttonClassName"),
      stringProp("activeButtonClassName"),
      stringProp("openTriggerClassName"),
      stringProp("floatedButtonClassName"),
      nativeProp("ariaLabel", "string"),
    ],
    events: [
      {
        callbackProp: "onLanguageChange",
        name: "language-change",
        description:
          "Dispatched with detail.code after the user chooses a language.",
      },
      {
        callbackProp: null,
        name: "open-change",
        description:
          "Dispatched with detail.open when the language tray changes visibility.",
      },
    ],
  },
  {
    tagName: "dt-toast",
    sourceComponent: "Toast",
    contract: "Toast",
    defaultBackend: "native",
    nativeClassName: "DtToastElement",
    description:
      "Transient live-region message with semantic tone and optional auto-dismissal.",
    storyParity: storyParity(),
    props: [
      booleanProp("open"),
      stringProp("tone"),
      stringProp("position"),
      stringProp("size"),
      stringProp("message"),
      numberProp("duration"),
      booleanProp("inline"),
    ],
    events: [
      {
        callbackProp: "onClose",
        name: "close",
        description:
          "Dispatched when the auto-dismiss timer requests that the host close the toast.",
      },
    ],
  },
  {
    tagName: "dt-toast-stack",
    sourceComponent: "ToastStack",
    contract: "ToastStack",
    defaultBackend: "native",
    nativeClassName: "DtToastStackElement",
    description:
      "Docked queue of transient live-region messages with host-owned list state.",
    storyParity: storyParity({
      equivalents: [{ react: "ForcedColors", native: "Forced Colors" }],
    }),
    props: [
      {
        ...stringProp("toasts"),
        propertyType: String.raw`import("../native/toast-stack").DtToastStackItem[]`,
      },
      stringProp("position"),
      numberProp("max"),
    ],
    events: [
      {
        callbackProp: "onDismiss",
        name: "dismiss",
        description:
          "Dispatched with detail.id when a visible toast requests dismissal.",
      },
    ],
  },
  {
    tagName: "dt-phone-input",
    sourceComponent: "PhoneInput",
    contract: "PhoneInput",
    defaultBackend: "native",
    nativeClassName: "DtPhoneInputElement",
    description:
      "Form-associated international telephone field with explicit country context.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      stringProp("value"),
      nativeProp("defaultValue", "string"),
      stringProp("error"),
      stringProp("helperText"),
      stringProp("placeholder"),
      booleanProp("disabled"),
      booleanProp("required"),
      stringProp("id"),
      stringProp("defaultCountry"),
      nativeProp("country", "string"),
      nativeProp("name", "string"),
      nativeProp("countryLabel", "string"),
    ],
    events: [
      {
        callbackProp: "onChange",
        name: "value-change",
        description:
          "Dispatched with detail.value after the telephone value changes.",
      },
      {
        callbackProp: null,
        name: "country-change",
        description:
          "Dispatched with detail.country after the selected country changes.",
      },
    ],
  },
  {
    tagName: "dt-combobox",
    sourceComponent: "Combobox",
    contract: "Combobox",
    defaultBackend: "native",
    nativeClassName: "DtComboboxElement",
    description:
      "Form-associated searchable single-select control with listbox keyboard behavior.",
    storyParity: storyParity({
      extensions: [
        {
          native: "Filtering",
          reason:
            "Native-only editable filtering extends the canonical button-trigger selection model and emits filter-change for host observation.",
        },
      ],
    }),
    props: [
      stringProp("label"),
      {
        ...stringProp("options"),
        propertyType: String.raw`import("../native/combobox").DtComboboxOption[]`,
      },
      stringProp("value"),
      nativeProp("defaultValue", "string"),
      stringProp("id"),
      stringProp("placeholder"),
      stringProp("helperText"),
      stringProp("error"),
      booleanProp("required"),
      booleanProp("disabled"),
      nativeProp("name", "string"),
      nativeProp("noResultsText", "string"),
      nativeProp("toggleLabel", "string"),
    ],
    events: [
      {
        callbackProp: "onValueChange",
        name: "value-change",
        description:
          "Dispatched with detail.value after the selected option changes.",
      },
      {
        callbackProp: null,
        name: "filter-change",
        description:
          "Dispatched with detail.query as user input filters the options.",
      },
    ],
  },
  {
    tagName: "dt-multi-combobox",
    sourceComponent: "MultiCombobox",
    contract: "MultiCombobox",
    defaultBackend: "native",
    nativeClassName: "DtMultiComboboxElement",
    description:
      "Form-associated searchable multi-select with removable selections and listbox keyboard behavior.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      {
        ...stringProp("options"),
        propertyType: String.raw`import("../native/multi-combobox").DtMultiComboboxOption[]`,
      },
      {
        ...stringProp("value"),
        propertyType: "string[]",
      },
      {
        ...nativeProp("defaultValue", "string"),
        propertyType: "string[]",
      },
      stringProp("id"),
      stringProp("placeholder"),
      stringProp("helperText"),
      stringProp("error"),
      booleanProp("required"),
      booleanProp("disabled"),
      nativeProp("controlled", "boolean"),
      nativeProp("name", "string"),
      nativeProp("noResultsText", "string"),
      nativeProp("toggleLabel", "string"),
      nativeProp("removeLabelPrefix", "string"),
      nativeProp("requiredMessage", "string"),
    ],
    events: [
      {
        callbackProp: "onValueChange",
        name: "value-change",
        description:
          "Dispatched with detail.value after the selected value array changes.",
      },
      {
        callbackProp: null,
        name: "before-value-change",
        description:
          "Cancelable request carrying detail.value before a controlled selection changes.",
      },
    ],
  },
  {
    tagName: "dt-cookie-consent",
    sourceComponent: "CookieConsent",
    contract: "CookieConsent",
    defaultBackend: "native",
    nativeClassName: "DtCookieConsentElement",
    description:
      "Consent banner and preferences dialog with host-controlled policy, persistence, and analytics boundaries.",
    storyParity: storyParity(),
    props: [
      {
        ...nativeProp("categories", "string"),
        propertyType: String.raw`import("../native/cookie-consent").DtCookieConsentCategory[]`,
      },
      {
        ...nativeProp("value", "string"),
        propertyType: String.raw`import("../native/cookie-consent").DtCookieConsentValue`,
      },
      {
        ...nativeProp("defaultValue", "string"),
        propertyType: String.raw`import("../native/cookie-consent").DtCookieConsentValue`,
      },
      nativeProp("open", "boolean"),
      nativeProp("defaultOpen", "boolean"),
      nativeProp("autoShow", "boolean"),
      nativeProp("controlled", "boolean"),
      nativeProp("storageKey", "string"),
      nativeProp("storageVersion", "number"),
      {
        ...nativeProp(
          "persistence",
          "string",
          "Host-injected persistence adapter; not available as an HTML attribute.",
          { propertyOnly: true },
        ),
        propertyType: String.raw`import("../native/cookie-consent").DtCookieConsentPersistence | null`,
      },
      nativeProp("bannerLabel", "string"),
      nativeProp("summary", "string"),
      nativeProp("readOurText", "string"),
      nativeProp("policyLabel", "string"),
      nativeProp("policyHref", "string"),
      nativeProp("customizeLabel", "string"),
      nativeProp("acceptRequiredLabel", "string"),
      nativeProp("acceptAllLabel", "string"),
      nativeProp(
        "dialogTitle",
        "string",
        "Preferences dialog heading; dialog-title avoids the global HTML title tooltip attribute.",
      ),
      nativeProp("description", "string"),
      nativeProp("requiredLabel", "string"),
      nativeProp("saveLabel", "string"),
      nativeProp("closeLabel", "string"),
    ],
    events: [
      {
        callbackProp: null,
        name: "before-consent-change",
        description:
          "Cancelable request carrying the next consent decision before persistence.",
      },
      {
        callbackProp: null,
        name: "consent-change",
        description:
          "Dispatched with the decision type, normalized value, and timestamp.",
      },
      {
        callbackProp: null,
        name: "value-change",
        description:
          "Dispatched with detail.value after the consent value changes.",
      },
      {
        callbackProp: null,
        name: "open-change",
        description:
          "Dispatched with detail.open and detail.reason after visibility changes.",
      },
      {
        callbackProp: null,
        name: "persistence-error",
        description:
          "Dispatched when an injected or explicitly configured persistence operation fails.",
      },
    ],
  },
  {
    tagName: "dt-code-snippet",
    sourceComponent: "CodeSnippet",
    contract: "CodeSnippet",
    defaultBackend: "native",
    nativeClassName: "DtCodeSnippetElement",
    description:
      "Copyable raw-code presentation with optional line numbers and bounded expansion.",
    storyParity: storyParity(),
    props: [
      stringProp("code"),
      stringProp("language"),
      booleanProp("showLineNumbers"),
      nativeProp(
        "ariaLabel",
        "string",
        "Accessible name for the code region.",
        {
          attributeName: "aria-label",
        },
      ),
      booleanProp("allowCopy"),
      stringProp("variant"),
      numberProp("maxLines"),
    ],
    events: [
      {
        callbackProp: "onCopy",
        name: "copy",
        description:
          "Dispatched after the complete raw code value is copied successfully.",
      },
    ],
  },
  {
    tagName: "dt-code-block-window",
    sourceComponent: "CodeBlockWindow",
    contract: "CodeBlockWindow",
    defaultBackend: "native",
    nativeClassName: "DtCodeBlockWindowElement",
    description:
      "Framed presentation for host-highlighted pre/code markup with metadata and caption.",
    storyParity: storyParity({
      extensions: [
        {
          native: "Composed Snippet",
          reason:
            "Demonstrates framework-neutral composition with dt-code-snippet while the canonical React story receives highlighted nodes from its host pipeline.",
        },
      ],
    }),
    slots: [
      slot(
        "",
        "Host-highlighted pre/code markup; raw strings belong in dt-code-snippet.",
      ),
    ],
    props: [
      {
        ...stringProp(
          "windowTitle",
          "title",
          "Visible frame heading; window-title avoids the global HTML title tooltip attribute.",
        ),
        attributeName: "window-title",
      },
      stringProp("caption"),
      stringProp("language"),
      booleanProp("showLineNumbers"),
      stringProp("context"),
    ],
    events: [
      {
        callbackProp: null,
        name: "copy",
        description:
          "Dispatched after the complete code content is copied successfully.",
      },
    ],
  },
  {
    tagName: "dt-breadcrumb",
    sourceComponent: "Breadcrumb",
    contract: "Breadcrumb",
    defaultBackend: "native",
    nativeClassName: "DtBreadcrumbElement",
    description:
      "Host-routed location trail with current-page, collapse, and home affordances.",
    storyParity: storyParity({
      extensions: [
        {
          native: "Comparison",
          reason:
            "Native-only comparison verifies declarative items and property-assigned items render the same trail.",
        },
      ],
    }),
    props: [
      {
        ...stringProp("items"),
        propertyType: String.raw`import("../native/breadcrumb").DtBreadcrumbItem[]`,
      },
      nativeProp("ariaLabel", "string", "Navigation landmark label.", {
        attributeName: "aria-label",
      }),
      stringProp("underline"),
      numberProp("maxItems"),
      stringProp("collapseLabel"),
      booleanProp("homeIcon"),
    ],
    events: [
      {
        callbackProp: null,
        name: "navigate",
        description:
          "Cancelable host-routing request carrying the destination href and source item.",
      },
    ],
  },
  {
    tagName: "dt-pagination",
    sourceComponent: "Pagination",
    contract: "Pagination",
    defaultBackend: "native",
    nativeClassName: "DtPaginationElement",
    description:
      "Controlled content pager with numbered pages, ellipses, and localized labels.",
    storyParity: storyParity(),
    props: [
      numberProp("currentPage"),
      numberProp("totalPages"),
      numberProp("siblingCount"),
      nativeProp("ariaLabel", "string", "Pagination landmark label.", {
        attributeName: "aria-label",
      }),
      nativeProp("previousLabel", "string"),
      nativeProp("nextLabel", "string"),
      nativeProp("pageLabel", "string"),
      nativeProp(
        "pageParam",
        "string",
        "URL query parameter used by the native uncontrolled navigation mode.",
      ),
    ],
    events: [
      {
        callbackProp: "onPageChange",
        name: "page-change",
        description:
          "Dispatched with detail.page when the user requests another page.",
      },
      {
        callbackProp: null,
        name: "navigate",
        description:
          "Cancelable host-routing request carrying the page, href, and trigger.",
      },
    ],
  },
  {
    tagName: "dt-timestamp",
    sourceComponent: "Timestamp",
    contract: "Timestamp",
    defaultBackend: "native",
    nativeClassName: "DtTimestampElement",
    description:
      "Semantic locale-aware time value with absolute, relative, and live formats.",
    storyParity: storyParity(),
    props: [
      {
        ...stringProp("value"),
        propertyType: "string | number | Date",
      },
      stringProp("format"),
      numberProp("autoThreshold"),
      stringProp("size"),
      stringProp("tone"),
      booleanProp("showTimezone"),
      booleanProp("tooltip"),
      booleanProp("live"),
      {
        ...stringProp("now"),
        propertyType: "string | number | Date",
      },
      stringProp("locale"),
    ],
    events: [],
  },
  {
    tagName: "dt-group-label",
    sourceComponent: "GroupLabel",
    contract: "GroupLabel",
    defaultBackend: "native",
    nativeClassName: "DtGroupLabelElement",
    description:
      "Label for a compound control that preserves native label activation semantics.",
    storyParity: storyParity(),
    slots: [slot("", "Visible compound-control label text.")],
    props: [
      {
        ...stringProp("htmlFor"),
        attributeName: "for",
      },
      nativeProp(
        "content",
        "string",
        "Attribute alternative to the default text slot.",
      ),
      stringProp("tooltipText"),
      booleanProp("required"),
      nativeProp("requiredText", "string"),
      nativeProp("optional", "boolean"),
      nativeProp("optionalText", "string"),
      nativeProp("hint", "string"),
      booleanProp("disabled"),
      {
        ...stringProp(
          "tooltip",
          "title",
          "Native tooltip exposed under a collision-free typed property.",
        ),
        attributeName: "title",
      },
    ],
    events: [],
  },
  {
    tagName: "dt-mac-window-frame",
    sourceComponent: "MacWindowFrame",
    contract: "MacWindowFrame",
    defaultBackend: "native",
    nativeClassName: "DtMacWindowFrameElement",
    description:
      "Decorative desktop-window frame for demos and showcase content.",
    storyParity: storyParity(),
    slots: [
      slot("", "Showcase content rendered inside the decorative frame."),
      slot(
        "content",
        "Explicit alternative to the default showcase-content slot.",
      ),
      slot("title", "Host-rendered frame title content."),
      slot(
        "toolbar",
        "Host-rendered toolbar content replacing the built-in action.",
      ),
    ],
    props: [
      stringProp("titleKey"),
      stringProp("actionLabelKey"),
      nativeProp(
        "actionLabel",
        "string",
        "Visible and accessible action label.",
      ),
      stringProp("density"),
      nativeProp("bodyLabel", "string", "Accessible name for the framed body."),
    ],
    events: [
      {
        callbackProp: "onAction",
        name: "action-click",
        description: "Dispatched when the optional frame action is activated.",
      },
    ],
  },
  {
    tagName: "dt-file-upload",
    sourceComponent: "FileUpload",
    contract: "FileUpload",
    defaultBackend: "native",
    nativeClassName: "DtFileUploadElement",
    description:
      "Form-associated file picker with size validation, drag/drop, and clear behavior.",
    storyParity: storyParity(),
    props: [
      stringProp("label"),
      stringProp("placeholder"),
      stringProp("helperText"),
      stringProp("uploadButtonLabel"),
      stringProp("clearButtonLabel"),
      stringProp("accept"),
      numberProp("maxSizeInBytes"),
      stringProp("sizeErrorMessage"),
      stringProp("error"),
      {
        ...stringProp("value"),
        propertyType: "File | null",
        propertyOnly: true,
      },
      booleanProp("disabled"),
      booleanProp("required"),
      stringProp("appearance"),
      nativeProp("name", "string"),
      nativeProp(
        "inheritedDisabled",
        "boolean",
        "Property-only disabled state supplied by an owning form-field composition.",
        { propertyOnly: true },
      ),
    ],
    events: [
      {
        callbackProp: "onFileChange",
        name: "file-change",
        description:
          "Dispatched with detail.file after selection, drop, rejection, or clearing.",
      },
      {
        callbackProp: null,
        name: "change",
        description:
          "Standard composed change event emitted after the file value changes.",
      },
      {
        callbackProp: null,
        name: "picker-request",
        description:
          "Cancelable request emitted before opening the platform file picker.",
      },
    ],
  },
  {
    tagName: "dt-category-filter",
    sourceComponent: "CategoryFilter",
    contract: "CategoryFilter",
    defaultBackend: "native",
    nativeClassName: "DtCategoryFilterElement",
    description:
      "Controlled category filter rendered as a group of native toggle buttons.",
    storyParity: storyParity(),
    props: [
      {
        ...stringProp("categories"),
        propertyType: String.raw`import("../native/category-filter").DtCategoryOption[]`,
      },
      stringProp("activeCategory"),
      stringProp("size"),
      stringProp("variant"),
      nativeProp("ariaLabel", "string", "Accessible filter-group label.", {
        attributeName: "aria-label",
      }),
    ],
    events: [
      {
        callbackProp: "onCategoryChange",
        name: "category-change",
        description:
          "Dispatched with detail.category when a category is requested.",
      },
    ],
  },
  {
    tagName: "dt-gallery",
    sourceComponent: "Gallery",
    contract: "Gallery",
    defaultBackend: "native",
    nativeClassName: "DtGalleryElement",
    description:
      "Responsive image gallery with captions and keyboard-focusable items.",
    storyParity: storyParity(),
    props: [
      {
        ...stringProp("images"),
        propertyType: String.raw`import("../native/gallery").DtGalleryImage[]`,
      },
      numberProp("minColumnWidth"),
      numberProp("gutter"),
    ],
    events: [],
  },
  {
    tagName: "dt-reading-progress",
    sourceComponent: "ReadingProgress",
    contract: "ReadingProgress",
    defaultBackend: "native",
    nativeClassName: "DtReadingProgressElement",
    description:
      "Fixed reading-progress indicator tracking a host element or selector.",
    storyParity: storyParity(),
    props: [
      nativeProp("target", "string", "Property-only HTMLElement to track.", {
        propertyType: "HTMLElement | null",
        propertyOnly: true,
      }),
      nativeProp(
        "targetSelector",
        "string",
        "Document selector for the content to track.",
      ),
      booleanProp("showPercentage"),
      nativeProp("ariaLabel", "string", "Progressbar accessible name.", {
        attributeName: "aria-label",
      }),
    ],
    events: [],
  },
  {
    tagName: "dt-selectable-card",
    sourceComponent: "SelectableCard",
    contract: "SelectableCard",
    defaultBackend: "native",
    nativeClassName: "DtSelectableCardElement",
    description: "Native radio- or checkbox-style selectable card option.",
    storyParity: storyParity(),
    slots: [slot("", "Card content.")],
    props: [
      stringProp("value"),
      booleanProp("selected"),
      booleanProp("disabled"),
      nativeProp("selectionType", "string"),
      nativeProp("name", "string"),
    ],
    events: [
      {
        callbackProp: "onSelectedChange",
        name: "selection-request",
        description:
          "Dispatched when standalone selection changes or a group receives an option request.",
      },
    ],
  },
  {
    tagName: "dt-selectable-card-group",
    sourceComponent: "SelectableCardGroup",
    contract: "SelectableCard",
    defaultBackend: "native",
    nativeClassName: "DtSelectableCardGroupElement",
    description: "Selection owner for native selectable-card options.",
    storyParity: storyParity(),
    slots: [slot("", "dt-selectable-card options.")],
    props: [
      nativeProp("type", "string"),
      nativeProp("legend", "string"),
      nativeProp("name", "string"),
      nativeProp("value", "string", "Controlled group value.", {
        propertyType: "string | string[]",
      }),
      nativeProp(
        "defaultValue",
        "string",
        "Initial uncontrolled group value.",
        { propertyType: "string | string[]" },
      ),
      nativeProp("orientation", "string"),
      nativeProp("disabled", "boolean"),
      nativeProp("error", "string"),
      nativeProp("helperText", "string"),
    ],
    events: [
      {
        callbackProp: null,
        name: "value-change",
        description: "Dispatched with detail.value after selection changes.",
      },
    ],
  },
  {
    tagName: "dt-logo",
    sourceComponent: "Logo",
    contract: "Logo",
    defaultBackend: "native",
    nativeClassName: "DtLogoElement",
    description:
      "Native logo atom: Digitaltableteur brand mark with background and motion modes, or a custom image via src.",
    storyParity: storyParity(),
    props: [
      stringProp(
        "src",
        "src",
        "Custom logo image URL (PNG/JPEG/SVG); replaces the built-in mark",
      ),
      numberProp("size"),
      booleanProp("animated"),
      booleanProp(
        "background",
        "background",
        "Brand lime circle background behind a contrast mark",
      ),
      {
        ...stringProp("accessibleTitle", "title"),
        attributeName: "accessible-title",
      },
      booleanProp("decorative"),
    ],
    events: [],
  },
  {
    tagName: "dt-blog-media-image",
    sourceComponent: "BlogMediaImage",
    contract: "BlogMediaImage",
    defaultBackend: "native",
    nativeClassName: "DtBlogMediaImageElement",
    description: "Responsive native article image with fill and fit modes.",
    storyParity: storyParity(),
    props: [
      stringProp("src"),
      stringProp("alt"),
      booleanProp("fill"),
      numberProp("width"),
      numberProp("height"),
      booleanProp("priority"),
      stringProp("sizes"),
      nativeProp(
        "srcSet",
        "string",
        "Responsive candidate set for the native img; sizes only applies when this is present (React generates its srcset via next/image).",
      ),
      stringProp("fit"),
      booleanProp("fluid"),
    ],
    events: [
      {
        callbackProp: "onLoad",
        name: "image-load",
        description: "Dispatched after the native image loads.",
      },
      {
        callbackProp: "onError",
        name: "image-error",
        description: "Dispatched when the native image cannot load.",
      },
    ],
  },
  {
    tagName: "dt-author",
    sourceComponent: "Author",
    contract: "Author",
    defaultBackend: "native",
    nativeClassName: "DtAuthorElement",
    description: "Compact native author byline composed with dt-avatar.",
    storyParity: storyParity(),
    props: [
      stringProp("name"),
      stringProp("imageUrl"),
      stringProp("size"),
      stringProp("profileUrl"),
      nativeProp("bylinePrefix", "string", "Localized byline prefix override."),
    ],
    events: [],
  },
  {
    tagName: "dt-social-share",
    sourceComponent: "SocialShare",
    contract: "SocialShare",
    defaultBackend: "native",
    nativeClassName: "DtSocialShareElement",
    description:
      "Native multi-channel sharing row with Web Share and copy fallback.",
    storyParity: storyParity(),
    props: [
      stringProp("url"),
      {
        ...stringProp("shareTitle", "title"),
        attributeName: "share-title",
      },
      {
        ...stringProp("channels"),
        propertyType: String.raw`import("../native/social-share").DtSocialShareChannel[]`,
      },
      stringProp("variant"),
      booleanProp("showHeading"),
      stringProp("heading"),
    ],
    events: [
      {
        callbackProp: null,
        name: "native-share",
        description: "Dispatched after the Web Share API resolves.",
      },
      {
        callbackProp: null,
        name: "link-copy",
        description: "Dispatched with detail.url after the URL is copied.",
      },
      {
        callbackProp: null,
        name: "share-error",
        description: "Dispatched when neither native share nor copy succeeds.",
      },
    ],
  },
  {
    tagName: "dt-blog-nav",
    sourceComponent: "BlogNav",
    contract: "BlogNav",
    defaultBackend: "native",
    nativeClassName: "DtBlogNavElement",
    description:
      "Native previous and next navigation for ordered blog articles.",
    storyParity: storyParity(),
    props: [
      stringProp("currentPath"),
      {
        ...stringProp("pages"),
        propertyType: String.raw`import("../native/section-nav").DtSectionNavPage[]`,
      },
      booleanProp("disabled"),
    ],
    events: [
      {
        callbackProp: "onNavigate",
        name: "navigate",
        description: "Cancelable host-navigation request with detail.path.",
      },
    ],
  },
  {
    tagName: "dt-work-nav",
    sourceComponent: "WorkNav",
    contract: "WorkNav",
    defaultBackend: "native",
    nativeClassName: "DtWorkNavElement",
    description:
      "Native previous and next navigation for ordered work projects.",
    storyParity: storyParity(),
    props: [
      stringProp("currentPath"),
      {
        ...stringProp("pages"),
        propertyType: String.raw`import("../native/section-nav").DtSectionNavPage[]`,
      },
      booleanProp("disabled"),
    ],
    events: [
      {
        callbackProp: "onNavigate",
        name: "navigate",
        description: "Cancelable host-navigation request with detail.path.",
      },
    ],
  },
  {
    tagName: "dt-person-card",
    sourceComponent: "PersonCard",
    contract: "PersonCard",
    defaultBackend: "native",
    nativeClassName: "DtPersonCardElement",
    description:
      "Native profile card with responsive portrait, contact, and social links.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Person Card Compliance",
          reason:
            "React-only historical compliance fixture; native conformance is enforced by executable package and Storybook gates.",
        },
      ],
    }),
    props: [
      stringProp("imageSrc"),
      stringProp("imageAlt"),
      stringProp("imageSrcSet"),
      stringProp("imageSizes"),
      stringProp("name"),
      {
        ...stringProp("personTitle", "title"),
        attributeName: "person-title",
      },
      stringProp("email"),
      stringProp("linkedinUrl"),
      stringProp("linkedinLabel"),
      stringProp("githubUrl"),
      stringProp("githubLabel"),
      stringProp("facebookUrl"),
      stringProp("facebookLabel"),
      stringProp("twitterUrl"),
      stringProp("twitterLabel"),
      stringProp("dribbbleUrl"),
      stringProp("dribbbleLabel"),
      stringProp("mediumUrl"),
      stringProp("mediumLabel"),
      stringProp("instagramUrl"),
      stringProp("instagramLabel"),
      stringProp("substackUrl"),
      stringProp("substackLabel"),
      stringProp("imageLoading"),
      stringProp("imageDecoding"),
      booleanProp("loading"),
    ],
    events: [],
  },
  {
    tagName: "dt-testimonial",
    sourceComponent: "Testimonial",
    contract: "Testimonial",
    defaultBackend: "native",
    nativeClassName: "DtTestimonialElement",
    description:
      "Native testimonial quote with attribution and optional avatar and LinkedIn link.",
    storyParity: storyParity({
      exclusions: [
        {
          react: "Z Testimonial Compliance",
          reason:
            "React-only historical compliance fixture; native conformance is enforced by executable package and Storybook gates.",
        },
      ],
    }),
    props: [
      stringProp("quote"),
      stringProp("name"),
      {
        ...stringProp("personTitle", "title"),
        attributeName: "person-title",
      },
      stringProp("company"),
      stringProp("linkedinUrl"),
      stringProp("avatarUrl"),
    ],
    events: [],
  },
  {
    tagName: "dt-value-card",
    sourceComponent: "ValueCard",
    contract: "ValueCard",
    defaultBackend: "native",
    nativeClassName: "DtValueCardElement",
    description:
      "Compact value proposition card with icon, title, and description.",
    storyParity: storyParity(),
    slots: [
      slot("icon", "Icon or short visual mark."),
      slot("", "Optional supplemental content."),
    ],
    props: [
      stringProp("title"),
      stringProp("description"),
      stringProp("variant"),
    ],
    events: [],
  },
];

/**
 * Native maturity is independent from the canonical React contract. A port may
 * implement a stable API while its own production and accessibility evidence is
 * still accumulating. Promotion overrides belong on the individual definition.
 */
export default elementDefinitions.map((element) => ({
  implementationStatus: "beta",
  implementationConsumers: [],
  props: [],
  slots: [],
  events: [],
  ...element,
}));
