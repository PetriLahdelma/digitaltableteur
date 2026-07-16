import React from "react";
import { Section } from "./Section";
import styles from "./AnatomySection.module.css";

type NativeProp = {
  name: string;
  type: string;
  propertyType?: string;
  description?: string;
};

function attributeName(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function WebComponentApiSection({ props }: { props: NativeProp[] }) {
  if (props.length === 0) return null;
  return (
    <Section block="native-api" heading="Native API">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Attribute</th>
            <th scope="col">Property</th>
            <th scope="col">Type</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <th scope="row">
                <code>{attributeName(prop.name)}</code>
              </th>
              <td>
                <code>{prop.name}</code>
              </td>
              <td>{prop.propertyType ?? prop.type}</td>
              <td>{prop.description ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
