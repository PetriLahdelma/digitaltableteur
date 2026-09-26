"use client";

import { useState } from "react";
import Button from "@dt/Button";
import Switch from "@dt/Switch";
import Tabs from "@dt/Tabs";

export interface Settings {
  emailNotifications: boolean;
  weeklyDigest: boolean;
  darkMode: boolean;
}

const TABS = [
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
];

export default function SettingsPanel({ onSave }: { onSave: (settings: Settings) => void }) {
  const [active, setActive] = useState("notifications");
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    weeklyDigest: false,
    darkMode: false,
  });
  const [saved, setSaved] = useState(false);
  const set = (key: keyof Settings) => (value: boolean) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <section>
      <Tabs
        tabs={TABS}
        activeTab={active}
        onTabChange={setActive}
        ariaLabel="Settings sections"
      />
      {active === "notifications" && (
        <div role="tabpanel" id="tabpanel-notifications" aria-labelledby="tab-notifications">
          <Switch
            label="Email notifications"
            checked={settings.emailNotifications}
            onCheckedChange={set("emailNotifications")}
          />
          <Switch
            label="Weekly digest"
            checked={settings.weeklyDigest}
            onCheckedChange={set("weeklyDigest")}
          />
        </div>
      )}
      {active === "appearance" && (
        <div role="tabpanel" id="tabpanel-appearance" aria-labelledby="tab-appearance">
          <Switch
            label="Dark mode"
            checked={settings.darkMode}
            onCheckedChange={set("darkMode")}
          />
        </div>
      )}
      <Button
        variant="primary"
        onClick={() => {
          onSave(settings);
          setSaved(true);
        }}
      >
        Save settings
      </Button>
      <p role="status">{saved ? "Settings saved" : ""}</p>
    </section>
  );
}
