import SectionTabs from "./SectionTabs";

export default function TeamPage() {
  return (
    <SectionTabs
      label="Team sections"
      items={[
        { id: "members", title: "Members", content: <p>3 members</p> },
        { id: "roles", title: "Roles", content: <p>Admin, Editor, Viewer</p> },
      ]}
    />
  );
}
