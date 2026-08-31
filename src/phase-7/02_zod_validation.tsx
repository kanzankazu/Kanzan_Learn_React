// =============================================================
// Phase 7 — 02: Zod Validation + RHF Integration
// =============================================================
// Zod is a TypeScript-first schema validation library.
// You define a schema, and Zod:
//   1. Validates data at runtime
//   2. Infers TypeScript types automatically (z.infer<typeof schema>)
//   3. Provides detailed, path-aware error messages
//
// Integration with RHF via @hookform/resolvers:
//   resolver: zodResolver(schema)
//   → RHF delegates ALL validation to Zod
//   → No manual validation rules in register()
//   → Schema is reusable outside forms (API validation, etc.)
//
// Benefits:
//   + Schema defined ONCE — inferred type + validation from same source
//   + Rich validation: regex, refine, transform, coerce
//   + Composable: .merge(), .extend(), .pick(), .omit()
//   + Same schema works on client AND server (Node.js)
//
// install: npm install zod @hookform/resolvers
// =============================================================

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// ─────────────────────────────────────────────────────────────
// DEMO 1: Registration schema — Zod + RHF
// ─────────────────────────────────────────────────────────────

// Step 1: Define schema — this IS the single source of truth
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email"),

  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

  confirmPassword: z.string().min(1, "Please confirm password"),

  age: z
    .string()
    .min(1, "Age is required")
    .refine(v => !isNaN(Number(v)) && Number(v) >= 18 && Number(v) <= 120, "Must be 18–120"),

  role: z.enum(["developer", "designer", "manager", "other"]),

  acceptTerms: z
    .boolean()
    .refine(val => val === true, "You must accept the terms"),

// .refine() for cross-field validation — runs after all individual fields
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // error shown on confirmPassword field
});

// Step 2: Infer TypeScript type — input type (what RHF sees: strings from form)
// z.infer uses the OUTPUT type. For form inputs use z.input<>
type RegisterFormData = z.infer<typeof registerSchema>;

const ZodRegisterDemo = () => {
  const [submitted, setSubmitted] = useState<Omit<RegisterFormData, "confirmPassword"> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    // Pass the schema to zodResolver — RHF calls Zod for all validation
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "developer", acceptTerms: false },
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    await new Promise(r => setTimeout(r, 600));
    const { confirmPassword: _, ...safe } = data;
    setSubmitted(safe);
  };

  const FieldError = ({ field }: { field: keyof RegisterFormData }) =>
    errors[field] ? <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{errors[field]?.message as string}</p> : null;

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Zod schema = TypeScript type + runtime validation in one. No register() rules needed:
      </p>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.username ? "#ef4444" : "#2d2d44" }} placeholder="Username" {...register("username")} />
          <FieldError field="username" />
        </div>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "#2d2d44" }} type="email" placeholder="Email" {...register("email")} />
          <FieldError field="email" />
        </div>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.password ? "#ef4444" : "#2d2d44" }} type="password" placeholder="Password" {...register("password")} />
          <FieldError field="password" />
        </div>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.confirmPassword ? "#ef4444" : "#2d2d44" }} type="password" placeholder="Confirm password" {...register("confirmPassword")} />
          <FieldError field="confirmPassword" />
        </div>
        <div>
          <input style={{ ...inputStyle, borderColor: errors.age ? "#ef4444" : "#2d2d44" }} type="number" placeholder="Age" {...register("age")} />
          <FieldError field="age" />
        </div>
        <div>
          <select style={{ ...inputStyle, borderColor: errors.role ? "#ef4444" : "#2d2d44" }} {...register("role")}>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
            <option value="other">Other</option>
          </select>
          <FieldError field="role" />
        </div>
        <div>
          <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", cursor: "pointer" }}>
            <input type="checkbox" {...register("acceptTerms")} />
            I accept the terms and conditions
          </label>
          <FieldError field="acceptTerms" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "⏳ Registering..." : "Register"}
        </button>
      </form>
      {submitted && (
        <div className="code-hint" style={{ marginTop: "12px" }}>{`✅ Valid data:\n${JSON.stringify(submitted, null, 2)}`}</div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Zod schema composition
// ─────────────────────────────────────────────────────────────

const ZodCompositionDemo = () => {
  // Base schema
  const baseAddress = z.object({
    street: z.string().min(1),
    city:   z.string().min(1),
    zip:    z.string().regex(/^\d{5}$/, "5-digit zip code"),
  });

  // Extend: adds extra fields
  const fullAddress = baseAddress.extend({
    country: z.string().min(2),
    state:   z.string().optional(),
  });

  // Partial: all fields optional (for update payloads)
  const partialAddress = baseAddress.partial();

  // Pick: only some fields
  const cityOnly = baseAddress.pick({ city: true });

  // Omit: all but some fields
  const withoutZip = baseAddress.omit({ zip: true });

  // Union: one of many shapes
  const contactMethod = z.union([
    z.object({ type: z.literal("email"), address: z.string().email() }),
    z.object({ type: z.literal("phone"), number: z.string().min(10) }),
  ]);

  // Array + transform
  const csvToArray = z.string().transform(s => s.split(",").map(t => t.trim()).filter(Boolean));

  const examples = [
    { label: "baseAddress",    desc: "{ street, city, zip }",                schema: baseAddress },
    { label: ".extend()",      desc: "+ country, state?",                     schema: fullAddress },
    { label: ".partial()",     desc: "All fields optional",                   schema: partialAddress },
    { label: ".pick(city)",    desc: "Only city field",                       schema: cityOnly },
    { label: ".omit(zip)",     desc: "street + city only",                   schema: withoutZip },
    { label: "z.union()",      desc: "email | phone contact",                schema: contactMethod },
    { label: ".transform()",   desc: "csv string → string[]",                schema: csvToArray },
  ];

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Zod schema composition — build complex schemas from simple ones:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {examples.map(ex => (
          <div key={ex.label} style={{ display: "flex", gap: "12px", padding: "6px 10px", background: "#12121c", borderRadius: "6px", fontSize: "13px" }}>
            <code style={{ color: "#f472b6", minWidth: "140px" }}>{ex.label}</code>
            <span style={{ color: "#94a3b8" }}>{ex.desc}</span>
          </div>
        ))}
      </div>
      <div className="code-hint" style={{ marginTop: "12px" }}>{`// Type inference — zero duplication
const schema = z.object({ name: z.string(), age: z.number() });
type MyType = z.infer<typeof schema>; // { name: string; age: number }
// Same schema validates API responses, form inputs, env vars, etc.`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const ZodValidation = () => (
  <div>
    <div className="section">
      <h3>1. Registration Form — Zod + RHF</h3>
      <ZodRegisterDemo />
    </div>
    <div className="section">
      <h3>2. Schema Composition</h3>
      <ZodCompositionDemo />
    </div>
  </div>
);
