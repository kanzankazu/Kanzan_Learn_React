// =============================================================
// Phase 7 — Mini Project: Multi-step Registration Form
// =============================================================
// A 3-step wizard form using React Hook Form + Zod.
//
// Steps:
//   Step 1 — Personal Info:  name, email, date of birth
//   Step 2 — Account Setup:  username, password, confirm
//   Step 3 — Preferences:    role, skills, notifications
//
// Patterns used:
// [x] Per-step Zod schemas + zodResolver
// [x] useForm with defaultValues persistence between steps
// [x] watch() for derived UI (password strength, age)
// [x] handleSubmit with step validation (only validate current step)
// [x] Progress indicator component
// [x] Review step before final submit
// =============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Schemas — one per step
// ─────────────────────────────────────────────────────────────

const step1Schema = z.object({
  firstName: z.string().min(2, "Min 2 chars"),
  lastName:  z.string().min(2, "Min 2 chars"),
  email:     z.string().email("Invalid email"),
  birthYear: z.string()
    .min(1, "Birth year required")
    .refine(v => !isNaN(Number(v)) && Number(v) >= 1900 && Number(v) <= new Date().getFullYear() - 18, "Must be 18+"),
});

const step2Schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "Lowercase, numbers, underscores only"),
  password: z.string().min(8).regex(/[A-Z]/, "Needs uppercase").regex(/[0-9]/, "Needs number"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const step3Schema = z.object({
  role:          z.enum(["frontend", "backend", "fullstack", "mobile", "devops"]),
  skills:        z.string().min(1, "Enter at least one skill"),
  notifications: z.enum(["all", "important", "none"]),
  agreeTerms:    z.boolean().refine(v => v, "Must agree to terms"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type AllData = Step1Data & Step2Data & Step3Data;

// ─────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "6px",
  border: "1px solid #2d2d44",
  background: "#12121c",
  color: "#e2e8f0",
  fontSize: "14px",
} as const;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{message}</p> : null;

const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <div style={{ marginBottom: "24px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: i < step ? "#6366f1" : i === step ? "#a78bfa" : "#2d2d44",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: i < step ? "#fff" : i === step ? "#fff" : "#4a4a6a",
            fontSize: "13px", fontWeight: 600,
            border: i === step ? "2px solid #6366f1" : "none",
          }}>
            {i < step ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: "11px", color: i === step ? "#a78bfa" : "#4a4a6a", marginTop: "4px" }}>
            {["Personal", "Account", "Prefs"][i]}
          </span>
        </div>
      ))}
    </div>
    <div style={{ height: "3px", background: "#2d2d44", borderRadius: "2px" }}>
      <div style={{ height: "100%", width: `${(step / (total - 1)) * 100}%`, background: "#6366f1", borderRadius: "2px", transition: "width 0.3s" }} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Step forms
// ─────────────────────────────────────────────────────────────

const Step1Form = ({ defaultValues, onNext }: { defaultValues: Partial<Step1Data>; onNext: (d: Step1Data) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.firstName ? "#ef4444" : "#2d2d44" }} placeholder="First name" {...register("firstName")} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.lastName ? "#ef4444" : "#2d2d44" }} placeholder="Last name" {...register("lastName")} />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>
      <div>
        <input style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "#2d2d44" }} type="email" placeholder="Email address" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <input style={{ ...inputStyle, borderColor: errors.birthYear ? "#ef4444" : "#2d2d44" }} type="number" placeholder={`Birth year (must be 18+)`} {...register("birthYear")} />
        <FieldError message={errors.birthYear?.message} />
      </div>
      <button type="submit" className="btn btn-primary">Next →</button>
    </form>
  );
};

const Step2Form = ({ defaultValues, onNext, onBack }: { defaultValues: Partial<Step2Data>; onNext: (d: Step2Data) => void; onBack: () => void }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });
  const password = watch("password", "");
  const strength = password.length === 0 ? null : password.length < 8 ? "weak" : password.length < 12 ? "medium" : "strong";
  const strengthColor = { weak: "#f87171", medium: "#fbbf24", strong: "#4ade80" };
  const strengthWidth = { weak: "33%", medium: "66%", strong: "100%" };

  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <input style={{ ...inputStyle, borderColor: errors.username ? "#ef4444" : "#2d2d44" }} placeholder="Username (lowercase only)" {...register("username")} />
        <FieldError message={errors.username?.message} />
      </div>
      <div>
        <input style={{ ...inputStyle, borderColor: errors.password ? "#ef4444" : "#2d2d44" }} type="password" placeholder="Password" {...register("password")} />
        {strength && (
          <div style={{ marginTop: "4px" }}>
            <div style={{ height: "3px", background: "#2d2d44", borderRadius: "2px" }}>
              <div style={{ height: "100%", width: strengthWidth[strength], background: strengthColor[strength], borderRadius: "2px", transition: "all 0.3s" }} />
            </div>
            <p style={{ fontSize: "11px", color: strengthColor[strength], marginTop: "2px" }}>{strength}</p>
          </div>
        )}
        <FieldError message={errors.password?.message} />
      </div>
      <div>
        <input style={{ ...inputStyle, borderColor: errors.confirmPassword ? "#ef4444" : "#2d2d44" }} type="password" placeholder="Confirm password" {...register("confirmPassword")} />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Next →</button>
      </div>
    </form>
  );
};

const Step3Form = ({ defaultValues, onNext, onBack }: { defaultValues: Partial<Step3Data>; onNext: (d: Step3Data) => void; onBack: () => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { role: "frontend", notifications: "important", agreeTerms: false, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <label style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "4px", display: "block" }}>Role</label>
        <select style={{ ...inputStyle, borderColor: errors.role ? "#ef4444" : "#2d2d44" }} {...register("role")}>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="fullstack">Fullstack</option>
          <option value="mobile">Mobile</option>
          <option value="devops">DevOps</option>
        </select>
      </div>
      <div>
        <input style={{ ...inputStyle, borderColor: errors.skills ? "#ef4444" : "#2d2d44" }} placeholder="Skills (comma-separated: React, TypeScript, ...)" {...register("skills")} />
        <FieldError message={errors.skills?.message} />
      </div>
      <div>
        <label style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "4px", display: "block" }}>Notifications</label>
        <select style={inputStyle} {...register("notifications")}>
          <option value="all">All notifications</option>
          <option value="important">Important only</option>
          <option value="none">None</option>
        </select>
      </div>
      <label style={{ display: "flex", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
        <input type="checkbox" {...register("agreeTerms")} />
        I agree to the terms and conditions
      </label>
      <FieldError message={errors.agreeTerms?.message} />
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Review →</button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// Review + Submit
// ─────────────────────────────────────────────────────────────

const ReviewStep = ({ data, onBack, onSubmit }: { data: AllData; onBack: () => void; onSubmit: () => void }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    {[
      { label: "Personal", entries: [["Name", `${data.firstName} ${data.lastName}`], ["Email", data.email], ["Birth Year", String(data.birthYear)]] },
      { label: "Account",  entries: [["Username", data.username], ["Password", "••••••••"]] },
      { label: "Prefs",    entries: [["Role", data.role], ["Skills", data.skills], ["Notifications", data.notifications]] },
    ].map(section => (
      <div key={section.label} style={{ background: "#12121c", borderRadius: "8px", padding: "12px" }}>
        <p style={{ fontWeight: 600, color: "#a5b4fc", marginBottom: "8px", fontSize: "13px" }}>{section.label}</p>
        {section.entries.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "3px 0" }}>
            <span style={{ color: "#7c85a2" }}>{k}</span>
            <span style={{ color: "#e2e8f0" }}>{v}</span>
          </div>
        ))}
      </div>
    ))}
    <div style={{ display: "flex", gap: "8px" }}>
      <button className="btn btn-ghost" onClick={onBack}>← Edit</button>
      <button className="btn btn-primary" style={{ flex: 1 }} onClick={onSubmit}>🚀 Create Account</button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────────────────────

export const MiniProjectMultistepForm = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<AllData>>({});
  const [done, setDone] = useState(false);

  const saveAndNext = (data: Partial<AllData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(s => s + 1);
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Account Created!</h2>
        <p style={{ color: "#7c85a2", marginBottom: "20px" }}>Welcome, {formData.firstName} {formData.lastName}</p>
        <button className="btn btn-primary" onClick={() => { setStep(0); setFormData({}); setDone(false); }}>
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      <ProgressBar step={Math.min(step, 2)} total={3} />
      <div style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "12px", padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#a5b4fc" }}>
          {["Personal Information", "Account Setup", "Preferences", "Review"][step]}
        </h3>
        {step === 0 && <Step1Form defaultValues={formData} onNext={saveAndNext} />}
        {step === 1 && <Step2Form defaultValues={formData} onNext={saveAndNext} onBack={() => setStep(0)} />}
        {step === 2 && <Step3Form defaultValues={formData} onNext={saveAndNext} onBack={() => setStep(1)} />}
        {step === 3 && <ReviewStep data={formData as AllData} onBack={() => setStep(2)} onSubmit={() => setDone(true)} />}
      </div>
    </div>
  );
};
