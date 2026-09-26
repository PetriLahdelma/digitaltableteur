import SectionTabs from "./SectionTabs";

export default function ProfilePage() {
  return (
    <SectionTabs
      label="Profile sections"
      items={[
        { id: "details", title: "Details", content: <p>Name and email</p> },
        { id: "security", title: "Security", content: <p>Password and two-factor</p> },
      ]}
    />
  );
}
