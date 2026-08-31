// LoginForm component used in form tests
import { useState } from "react";

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Min 8 characters";
    return e;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await onSubmit({ email, password });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p id="email-error" role="alert">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          aria-describedby={errors.password ? "password-error" : undefined}
          aria-invalid={!!errors.password}
        />
        {errors.password && <p id="password-error" role="alert">{errors.password}</p>}
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
