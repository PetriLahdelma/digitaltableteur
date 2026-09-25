"use client";

import { useState, type FormEvent } from "react";

// Plausible first attempt: visible errors, but not wired to the fields
// (no aria-invalid, no aria-describedby) and no focus management.
export default function SignupForm({
  onSubmit,
}: {
  onSubmit: (values: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!email.includes("@") || !email.includes(".")) {
      next.email = "Enter a valid email address";
    }
    setErrors(next);
    if (!next.name && !next.email) onSubmit({ name: name.trim(), email });
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      {errors.name && <p className="error">{errors.name}</p>}
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <p className="error">{errors.email}</p>}
      <button type="submit">Create account</button>
    </form>
  );
}
