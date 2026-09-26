import LegacyTabs from "./LegacyTabs";

export default function ProfilePage() {
  return (
    <LegacyTabs
      label="Profile sections"
      items={[
        { id: "details", title: "Details", content: <p>Name and email</p> },
        { id: "security", title: "Security", content: <p>Password and two-factor</p> },
      ]}
    />
  );
}
