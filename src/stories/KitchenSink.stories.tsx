import React, { Suspense } from "react";
import { Meta } from "@storybook/react-webpack5";
import Label from "../components/Label/Label";
import Link from "../components/Link/Link";
import { FaSearch, FaArrowLeft } from "react-icons/fa";

const componentsContext: __WebpackModuleApi.RequireContext = require.context(
  "../components",
  true,
  /\.tsx$/,
);

const modules = import.meta.glob("../components/**/*.tsx", { eager: true });

const components = Object.entries(modules).reduce(
  (
    acc: Record<string, React.ComponentType<any>>,
    [path, module]: [string, any],
  ) => {
    const match = path.match(/\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\.tsx$/);
    const componentName = match?.[2];
    if (
      componentName &&
      module &&
      module.default &&
      isReactComponent(module.default)
    ) {
      acc[componentName] = module.default;
    }
    return acc;
  },
  {},
);

// Add Label to the components list
const allComponents = {
  ...components,
  Label,
  Link,
};

const excludedComponents = ["Grid", "Layout"];

export default {
  title: "Testing/Kitchen Sink",
} as Meta;

export const AllComponents = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <div style={{ padding: "1rem", display: "grid", gap: "2rem" }}>
      {Object.entries(allComponents)
        .filter(([name]) => !excludedComponents.includes(name))
        .map(([name, Component]) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "3rem",
              textAlign: "left",
            }}
          >
            <Label htmlFor={name}>{name}</Label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  name === "Button" ? "repeat(5, 1fr)" : "repeat(3, 1fr)",
                gap:
                  name === "Button"
                    ? "1rem"
                    : "3rem" /* Updated gap for Button grid */,
                maxWidth: "var(--size-width-lg)",
                margin: "0 auto",
                textAlign: "left" /* Align nested grids to the left */,
              }}
            >
              {isReactComponent(Component) ? (
                <>
                  <Component
                    {...(name === "Button"
                      ? { children: "Primary Button", variant: "primary" }
                      : {})}
                    {...(name === "Inputs"
                      ? {
                          label: "Input with Placeholder",
                          placeholder: "Enter text...",
                        }
                      : {})}
                    {...(name === "Link"
                      ? {
                          children: "Large Link",
                          href: "https://digitaltableteur.com",
                          size: "L",
                        }
                      : {})}
                    {...(name === "Select"
                      ? {
                          label: "Default Select",
                          options: [
                            { value: "option1", label: "Option 1" },
                            { value: "option2", label: "Option 2" },
                            { value: "option3", label: "Option 3" },
                          ],
                        }
                      : {})}
                  />
                  <Component
                    {...(name === "Button"
                      ? { children: "Secondary Button", variant: "secondary" }
                      : {})}
                    {...(name === "Inputs"
                      ? {
                          label: "Disabled Input",
                          placeholder: "Cannot type...",
                          disabled: true,
                        }
                      : {})}
                    {...(name === "Link"
                      ? {
                          children: "External Link",
                          className: "link external",
                          href: "https://google.com",
                        }
                      : {})}
                    {...(name === "Select"
                      ? { label: "Disabled Select", disabled: true }
                      : {})}
                  />
                  <Component
                    {...(name === "Button"
                      ? { children: "Error Button", variant: "error" }
                      : {})}
                    {...(name === "Inputs"
                      ? {
                          label: "Error Input",
                          placeholder: "Invalid input",
                          error: "This field is required",
                        }
                      : {})}
                    {...(name === "Link"
                      ? {
                          children: "Disabled Link",
                          href: "",
                          className: "link disabled",
                        }
                      : {})}
                  />
                  {name === "Button" && (
                    <>
                      <Component icon={FaSearch} />
                      <Component icon={FaArrowLeft}>Icon Left</Component>
                    </>
                  )}
                  {name === "Label" && (
                    <>
                      <Component
                        {...(name === "Label"
                          ? { children: "Default Label", htmlFor: "input-id" }
                          : {})}
                      />
                      <Component
                        {...(name === "Label"
                          ? {
                              children: "Label with Tooltip",
                              htmlFor: "input-id",
                              title: "This is a tooltip",
                            }
                          : {})}
                      />
                      <Component
                        {...(name === "Label"
                          ? {
                              children: "Required Label",
                              htmlFor: "input-id",
                              required: true,
                            }
                          : {})}
                      />
                      <Component
                        {...(name === "Label"
                          ? {
                              children: "Disabled Label",
                              htmlFor: "input-id",
                              disabled: true,
                            }
                          : {})}
                      />
                    </>
                  )}
                </>
              ) : (
                <div>Invalid Component</div>
              )}
            </div>
          </div>
        ))}
    </div>
  </Suspense>
);
