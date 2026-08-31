// =============================================================
// Phase 7 — 01: React Hook Form (RHF)
// =============================================================
// React Hook Form is the most popular form library for React.
// It solves the pain of:
//   - Controlled inputs causing re-renders on every keystroke
//   - Manually tracking touched, dirty, errors per field
//   - Verbose form validation logic
//
// Core API:
//   useForm()       → returns register, handleSubmit, formState, watch, etc.
//   register(name)  → connects an input to RHF (spread props onto input)
//   handleSubmit(fn)→ validates form, calls fn(data) only if valid
//   formState       → { errors, isSubmitting, isDirty, isValid, touchedFields }
//   watch(field)    → reactively read a field's current value
//   setValue(name)  → programmatically set a field value
//   reset()         → reset all fields to defaultValues
//
// Key advantage: UNCONTROLLED by default (uses refs internally)
//   → NO re-render on every keystroke
//   → Much better performance than useState per field
//
// install: npm install react-hook-form
//
// Android/Compose analogy:
//   TextFieldState + FormState  ~ register() + formState
//   rememberSaveable            ~ defaultValues persistence
// =============================================================

import { useForm, type SubmitHandler } from "react-hook-form";
import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "6px",
  border: "1px solid #2d2d44",
  background: "#12121c",
  color: "#e2e8f0",
  fontSize: "14px",
} as const;

const errorStyle = {
  color: "#f87171",
  fontSize: "12px",
  marginTop: "4px",
} as const;

// ─────────────────────────────────────────────────────────────
// DEMO 1: Basic RHF — register, handleSubmit, errors
// ─────────────────────────────────────────────────────────────

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const BasicRHFDemo = () => {
  const [submitted, setSubmitted] = useState<LoginForm | null>(null);

  const {
    register,       // connects input to RHF
    handleSubmit,   // wraps submit handler with validation
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    // Simulate async API call
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(data);
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Basic RHF — no re-renders on keystroke, validation on submit:
      </p>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <input
            style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "#2d2d44" }}
            type="email"
            placeholder="Email"
            // register() returns { name, ref, onChange, onBlur } — spread onto input
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
            })}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        <div>
          <input
            style={{ ...inputStyle, borderColor: errors.password ? "#ef4444" : "#2d2d44" }}
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Min 8 characters" },
            })}
          />
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
          <input type="checkbox" {...register("rememberMe")} />
          Remember me
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Logging in..." : "Login"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!isDirty}
            onClick={() => { reset(); setSubmitted(null); }}
          >
            Reset
          </button>
        </div>
      </form>

      {submitted && (
        <div className="code-hint" style={{ marginTop: "12px" }}>
          {`✅ Submitted:\n${JSON.stringify(submitted, null, 2)}`}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: watch() — reactive field reading
// ─────────────────────────────────────────────────────────────

interface PasswordForm {
  password: string;
  confirmPassword: string;
}

const WatchDemo = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PasswordForm>();

  // watch() subscribes to a field value — re-renders this component when it changes
  // Use sparingly — causes re-renders. For expensive derived state, use getValues() in handlers.
  const password = watch("password", "");

  const getStrength = (p: string) => {
    if (p.length === 0) return { label: "", color: "#2d2d44", width: "0%" };
    if (p.length < 6)   return { label: "Weak",   color: "#f87171", width: "33%" };
    if (p.length < 10)  return { label: "Medium", color: "#fbbf24", width: "66%" };
    return                     { label: "Strong", color: "#4ade80", width: "100%" };
  };
  const strength = getStrength(password);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        watch() — reactively read field value for derived UI:
      </p>
      <form onSubmit={handleSubmit(() => alert("Password set!"))} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <input
            style={{ ...inputStyle, borderColor: errors.password ? "#ef4444" : "#2d2d44" }}
            type="password"
            placeholder="New password"
            {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })}
          />
          {/* Strength meter — derived from watched value */}
          {password && (
            <div style={{ marginTop: "6px" }}>
              <div style={{ height: "4px", background: "#2d2d44", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "2px", transition: "all 0.3s" }} />
              </div>
              <p style={{ fontSize: "11px", color: strength.color, marginTop: "3px" }}>{strength.label}</p>
            </div>
          )}
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>
        <div>
          <input
            style={{ ...inputStyle, borderColor: errors.confirmPassword ? "#ef4444" : "#2d2d44" }}
            type="password"
            placeholder="Confirm password"
            {...register("confirmPassword", {
              required: "Required",
              validate: val => val === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary">Set Password</button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Dynamic fields — useFieldArray
// ─────────────────────────────────────────────────────────────

import { useFieldArray } from "react-hook-form";

interface TeamForm { teamName: string; members: { name: string; role: string }[]; }

const FieldArrayDemo = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<TeamForm>({
    defaultValues: { teamName: "", members: [{ name: "", role: "developer" }] },
  });

  // useFieldArray manages arrays of fields — add/remove/swap without re-registering
  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        useFieldArray — dynamic array of fields (add/remove team members):
      </p>
      <form onSubmit={handleSubmit(d => alert(JSON.stringify(d, null, 2)))} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          style={inputStyle}
          placeholder="Team name"
          {...register("teamName", { required: "Team name required" })}
        />

        {fields.map((field, index) => (
          <div key={field.id} style={{ display: "flex", gap: "8px" }}>
            <input
              style={{ ...inputStyle, flex: 2 }}
              placeholder="Member name"
              {...register(`members.${index}.name`, { required: "Name required" })}
            />
            <select
              style={{ ...inputStyle, flex: 1 }}
              {...register(`members.${index}.role`)}
            >
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
            </select>
            <button
              type="button"
              className="btn btn-danger"
              style={{ padding: "4px 10px", flexShrink: 0 }}
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => append({ name: "", role: "developer" })}
        >
          + Add Member
        </button>
        <button type="submit" className="btn btn-primary">Create Team</button>
      </form>
      {Object.keys(errors).length > 0 && (
        <p style={{ ...errorStyle, marginTop: "8px" }}>⚠️ Please fix errors above</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const ReactHookForm = () => (
  <div>
    <div className="section">
      <h3>1. Basic — register, handleSubmit, errors</h3>
      <BasicRHFDemo />
    </div>
    <div className="section">
      <h3>2. watch() — reactive field reading</h3>
      <WatchDemo />
    </div>
    <div className="section">
      <h3>3. useFieldArray — dynamic fields</h3>
      <FieldArrayDemo />
    </div>
  </div>
);
