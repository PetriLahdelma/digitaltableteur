"use client";

import { useRef, useState, type FormEvent } from "react";
import Button from "@dt/Button";
import TextInput from "@dt/TextInput";

export interface SignupFormProps {
  onSubmit: (values: { name: string; email: string }) => void;
}

type Errors = { name?: string; email?: string };

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address";
    }
    setErrors(next);
    if (next.name || next.email) {
      // TextInput renders the error synchronously on the next commit.
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }
    onSubmit({ name: name.trim(), email });
  };

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <TextInput
        label="Name"
        type="text"
        value={name}
        onValueChange={(value) => setName(String(value))}
        error={errors.name}
      />
      <TextInput
        label="Email"
        type="email"
        value={email}
        onValueChange={(value) => setEmail(String(value))}
        error={errors.email}
      />
      <Button type="submit" variant="primary">
        Create account
      </Button>
    </form>
  );
}
