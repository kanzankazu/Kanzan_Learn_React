// =============================================================
// Phase 0 — 03: Props
// =============================================================
// Props (short for "properties") are the mechanism for passing
// data INTO a component from its parent. Think of them as the
// function parameters of a React component.
//
// CORE PRINCIPLES:
// 1. Props are READ-ONLY — a component must never mutate its own props
// 2. Data flows ONE-WAY: parent -> child (via props)
// 3. Events flow the other way: child -> parent (via callback props)
// 4. Always type props with TypeScript interface or type alias
//
// Android/Compose analogy:
//   Props              ~ @Composable function parameters
//   Callback props     ~ lambda parameters (onClick: () -> Unit)
//   children prop      ~ content: @Composable () -> Unit
//   optional prop (?)  ~ default parameter value in Kotlin
//
// Concepts covered:
// - Basic typed props with TypeScript interface
// - Optional props with default values
// - String literal union types for constrained options
// - Callback (function) props — child-to-parent communication
// - Props drilling visualization
// - Spreading props with the spread operator {...obj}
// =============================================================

import React from "react";
import { makeFakeUsers, type BadgeVariant } from "../lib/fake-data";

// Generate fake users once at module level
const fakeUsers = makeFakeUsers(2);

// ─────────────────────────────────────────────────────────────
// SECTION 1: Basic Props + Optional Props + Default Values
// ─────────────────────────────────────────────────────────────
// Always define props as a TypeScript interface.
// The "?" makes a prop optional — if not passed, it's undefined.
// Default values are set via destructuring: { size = 44 }

interface AvatarProps {
  name: string;        // required — TypeScript will error if omitted
  size?: number;       // optional — defaults to 44 if not passed
}

const Avatar = ({ name, size = 44 }: AvatarProps) => {
  // Extract initials from name: "John Doe" -> "JD"
  // .split(" ")  -> ["John", "Doe"]
  // .map(n => n[0]) -> ["J", "D"]
  // .join("") -> "JD"
  // .toUpperCase().slice(0, 2) -> cap at 2 chars, uppercase
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #6366f1, #a855f7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      // Proportional font size: 35% of the avatar diameter
      fontSize: size * 0.35,
      color: "#fff",
      flexShrink: 0, // prevent shrinking in flex containers
    }}>
      {initials}
    </div>
  );
};

// String Literal Union Types — constrained option sets
// Instead of accepting any string, we restrict to specific values.
// TypeScript will show an error if you pass an invalid variant.
// This is equivalent to a sealed class / enum in Kotlin.
// NOTE: BadgeVariant is imported from lib/fake-data.ts — defined once, reused everywhere.

// Remove local BadgeVariant — imported from lib/fake-data.ts

interface SkillBadgeProps {
  label: string;
  variant?: BadgeVariant; // only these 5 values are valid
}

// Default value for variant is "blue" if not specified
const SkillBadge = ({ label, variant = "blue" }: SkillBadgeProps) => (
  // Dynamic className using template literal — combines base + variant
  <span className={`badge badge-${variant}`}>{label}</span>
);

// ─────────────────────────────────────────────────────────────
// SECTION 2: Callback Props — Child to Parent Communication
// ─────────────────────────────────────────────────────────────
// Since data flows one-way (parent → child), to send data UP
// we pass a function (callback) from parent → child as a prop.
// The child calls it when an event occurs.
//
// This is exactly like passing a lambda in Kotlin/Compose:
//   onClick: () -> Unit    ≈    onClick: () => void

interface ActionButtonProps {
  label: string;
  /** Controls the visual style — maps to CSS class */
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
  /** Called when the button is clicked — parent decides what happens */
  onClick: () => void;
}

const ActionButton = ({
  label,
  variant = "primary",
  disabled = false,
  onClick,
}: ActionButtonProps) => (
  <button
    className={`btn btn-${variant}`}
    disabled={disabled}
    onClick={onClick} // wire the DOM event to our prop callback
  >
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────
// SECTION 3: Props Drilling — passing data through component tree
// ─────────────────────────────────────────────────────────────
// Props drilling = passing props down through multiple levels of components.
// It's fine for 2-3 levels. For deeper trees, use Context or state management.
//
// Data flow:  MenuPage → MenuItem → NotifBadge
//              (count)    (count)    (renders number)

interface NotifBadgeProps {
  count: number;
}

// This component renders only when count > 0 (returns null otherwise)
// Returning null is the React way of rendering nothing
const NotifBadge = ({ count }: NotifBadgeProps) =>
  count > 0 ? (
    <span style={{
      background: "#ef4444",
      color: "#fff",
      borderRadius: "999px",
      fontSize: "11px",
      padding: "2px 6px",
      marginLeft: "6px",
    }}>
      {/* Cap display at 99+ to avoid layout breaking with large numbers */}
      {count > 99 ? "99+" : count}
    </span>
  ) : null; // explicitly return null — renders nothing, no DOM node

interface MenuItemProps {
  icon: string;
  label: string;
  notifCount?: number;   // props drilling: passed down to NotifBadge
  isActive?: boolean;
  onClick: () => void;   // callback prop — parent handles navigation
}

const MenuItem = ({
  icon,
  label,
  notifCount = 0,       // default: no notifications
  isActive = false,     // default: not active
  onClick,
}: MenuItemProps) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      // Conditional style: highlighted background when active
      background: isActive ? "#2e1d5e" : "transparent",
      color: isActive ? "#a78bfa" : "#94a3b8",
      transition: "background 0.15s",
    }}
  >
    <span>{icon}</span>
    {/* flex: 1 makes the label take all remaining space, pushing badge to the right */}
    <span style={{ flex: 1 }}>{label}</span>
    {/* Drilling the count prop down one more level */}
    <NotifBadge count={notifCount} />
  </div>
);

// ─────────────────────────────────────────────────────────────
// SECTION 4: Complex Props + Spread Operator
// ─────────────────────────────────────────────────────────────
// When a component has many props, you can spread an object:
//   const userData = { name: "John Doe", role: "Dev", ... }
//   <UserCard {...userData} />   ← equivalent to writing each prop manually
//
// Useful to avoid: <UserCard name={u.name} role={u.role} skills={u.skills} .../>

interface UserCardProps {
  name: string;
  role: string;
  skills: Array<{ label: string; variant: BadgeVariant }>;
  isOnline?: boolean;
  onMessage: () => void;   // callback: child tells parent "message was clicked"
  onFollow: () => void;    // callback: child tells parent "follow was clicked"
  children?: React.ReactNode; // optional slot content
}

const UserCard = ({
  name,
  role,
  skills,
  isOnline = false,
  onMessage,
  onFollow,
  children,
}: UserCardProps) => (
  <div className="card">
    {/* ── Header section ── */}
    <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
      {/* Reusing Avatar atom — passing name and fixed size */}
      <Avatar name={name} size={52} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          {/* Online indicator dot — conditional style based on isOnline prop */}
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: isOnline ? "#4ade80" : "#6b7280",
            display: "inline-block",
          }} />
        </div>
        <p style={{ color: "#7c85a2", fontSize: "13px" }}>{role}</p>
      </div>
    </div>

    {/* ── Skills section — mapping array prop to SkillBadge components ── */}
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
      {skills.map((s) => (
        // Each skill has a unique label — safe to use as key
        <SkillBadge key={s.label} label={s.label} variant={s.variant} />
      ))}
    </div>

    {/* ── Action buttons — callbacks wired to parent handlers ── */}
    <div style={{ display: "flex", gap: "8px" }}>
      <ActionButton label="💬 Message" variant="primary" onClick={onMessage} />
      <ActionButton label="➕ Follow" variant="ghost" onClick={onFollow} />
    </div>

    {/*
     * ── Children slot ──
     * Conditional render: only show wrapper div if children is provided.
     * Without this check, an empty div with border would render needlessly.
     */}
    {children && (
      <div style={{ marginTop: "14px", borderTop: "1px solid #2d2d44", paddingTop: "14px" }}>
        {children}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — Puts all demos on one page
// ─────────────────────────────────────────────────────────────
export const Props = () => {
  // Handlers defined in parent — child components call them via callback props
  // This is the React way: child says "something happened", parent decides action
  const handleMessage = (name: string) => alert(`Send message to ${name}`);
  const handleFollow = (name: string) => alert(`Follow ${name}`);

  // Typed array — TypeScript ensures each item matches UserCardProps shape.
  // Using faker-generated users — no real names or company data.
  const users: UserCardProps[] = [
    {
      name: fakeUsers[0].name,
      role: `${fakeUsers[0].jobTitle} · ${fakeUsers[0].company}`,
      skills: [
        { label: "Kotlin",   variant: "purple" },
        { label: "Compose",  variant: "blue"   },
        { label: "Hilt",     variant: "green"  },
        { label: "Firebase", variant: "orange" },
      ],
      isOnline: fakeUsers[0].online,
      onMessage: () => handleMessage(fakeUsers[0].name),
      onFollow:  () => handleFollow(fakeUsers[0].name),
    },
    {
      name: fakeUsers[1].name,
      role: `${fakeUsers[1].jobTitle} · ${fakeUsers[1].company}`,
      skills: [
        { label: "Architecture", variant: "pink" },
        { label: "Clean Code",   variant: "blue" },
        { label: "TypeScript",   variant: "purple" },
      ],
      isOnline: fakeUsers[1].online,
      onMessage: () => handleMessage(fakeUsers[1].name),
      onFollow:  () => handleFollow(fakeUsers[1].name),
    },
  ];

  return (
    <div>
      {/* ── Demo 1: Basic Props ── */}
      <div className="section">
        <h3>1. Basic Props + String Literal Union Types</h3>
        <div className="demo-box">
          <p style={{ marginBottom: "12px", color: "#7c85a2", fontSize: "13px" }}>
            Avatar with optional <code style={{ color: "#f472b6" }}>size</code> prop,{" "}
            SkillBadge with type-safe <code style={{ color: "#f472b6" }}>variant</code>:
          </p>
          {/* Passing different sizes to the same Avatar component */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
            <Avatar name={fakeUsers[0].name} size={36} />
            <Avatar name={fakeUsers[1].name} size={48} />
            <Avatar name="A" size={64} />
          </div>
          {/* All 5 valid variant values — TypeScript won't allow anything else */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["blue", "purple", "green", "orange", "pink"] as BadgeVariant[]).map((v) => (
              <SkillBadge key={v} label={v} variant={v} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Demo 2: Callback Props + Props Drilling ── */}
      <div className="section">
        <h3>2. Callback Props + Props Drilling</h3>
        <div className="demo-box">
          <p style={{ marginBottom: "12px", color: "#7c85a2", fontSize: "13px" }}>
            The <code style={{ color: "#f472b6" }}>onClick</code> callback flows from parent → MenuItem.
            The <code style={{ color: "#f472b6" }}>notifCount</code> drills from parent → MenuItem → NotifBadge.
          </p>
          {[
            { icon: "🏠", label: "Home",          notifCount: 0,  isActive: true },
            { icon: "🔔", label: "Notifications", notifCount: 12 },
            { icon: "💬", label: "Messages",      notifCount: 3 },
            { icon: "👤", label: "Profile",       notifCount: 0 },
          ].map((item) => (
            <MenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              notifCount={item.notifCount}
              isActive={item.isActive}
              onClick={() => alert(`Navigate to ${item.label}`)}
            />
          ))}
        </div>
      </div>

      {/* ── Demo 3: Spread props + children slot ── */}
      <div className="section">
        <h3>3. Spread Operator + children Slot</h3>
        <div className="card-grid">
          {users.map((user) => (
            // Spread operator: {...user} unpacks all properties as individual props
            // Equivalent to: name={user.name} role={user.role} skills={user.skills} ...
            <UserCard key={user.name} {...user}>
              {/* This JSX becomes the "children" prop inside UserCard */}
              <p style={{ fontSize: "13px", color: "#7c85a2" }}>
                💡 This content is injected via the <strong>children</strong> prop
              </p>
            </UserCard>
          ))}
        </div>
      </div>
    </div>
  );
};
