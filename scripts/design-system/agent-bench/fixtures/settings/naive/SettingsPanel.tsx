"use client";

import { useState } from "react";

// Plausible first attempt: correct roles and labels, but each panel owns its
// own state (lost when the panel unmounts) and there is no arrow-key support.
type Settings = { emailNotifications: boolean; weeklyDigest: boolean; darkMode: boolean };

function Toggle({ label, initial }: { label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)}>
      {label}
    </button>
  );
}

export default function SettingsPanel({ onSave }: { onSave: (settings: Settings) => void }) {
  const [active, setActive] = useState("notifications");
  const [saved, setSaved] = useState(false);
  return (
    <section>
      <div role="tablist" aria-label="Settings sections">
        {["notifications", "appearance"].map((key) => (
          <button
            key={key}
            id={`tab-${key}`}
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
          >
            {key === "notifications" ? "Notifications" : "Appearance"}
          </button>
        ))}
      </div>
      {active === "notifications" ? (
        <div role="tabpanel" aria-labelledby="tab-notifications">
          <Toggle label="Email notifications" initial />
          <Toggle label="Weekly digest" initial={false} />
        </div>
      ) : (
        <div role="tabpanel" aria-labelledby="tab-appearance">
          <Toggle label="Dark mode" initial={false} />
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          onSave({ emailNotifications: true, weeklyDigest: false, darkMode: false });
          setSaved(true);
        }}
      >
        Save settings
      </button>
      {saved && <p>Settings saved</p>}
    </section>
  );
}
