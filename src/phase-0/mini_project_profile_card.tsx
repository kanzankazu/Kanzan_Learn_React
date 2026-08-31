// =============================================================
// Phase 0 — Mini Project: Profile Card UI
// =============================================================
// This mini project combines ALL Phase 0 concepts into one
// real-world UI: a developer profile card grid.
//
// Concepts demonstrated:
// [x] JSX syntax & JavaScript expressions
// [x] Functional components (arrow function style)
// [x] TypeScript interfaces for props
// [x] Optional props with default values
// [x] String literal union types
// [x] Callback props (onMouseEnter/Leave)
// [x] List rendering with .map() and key prop
// [x] Conditional rendering (&&, ternary)
// [x] Children prop as content slot
// [x] Atomic Design: Atom -> Molecule -> Organism
//
// Component tree:
//   MiniProjectProfileCard  (organism — page level)
//   └── ProfileCard         (molecule — card container)
//       ├── AvatarCard      (atom — initials avatar)
//       ├── SkillBadge      (atom — skill with level indicator)
//       └── SocialLinkItem  (atom — social media link)
// =============================================================

import React from "react";
import { makeFakeProfiles, type FakeSkill, type FakeSocial } from "../lib/fake-data";

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────
// We reuse shared types from lib/fake-data.ts — defined once, imported here.
// FakeSkill and FakeSocial already have the exact shape we need.
// ProfileCardProps uses them to keep types consistent across the whole project.

// Local aliases for readability inside this file
type SkillLevel = FakeSkill["level"];       // "beginner" | "intermediate" | "expert"
type SocialPlatform = FakeSocial["platform"]; // "github" | "linkedin" | "twitter" | "youtube"

// Re-alias imported types with local names to match the component API
type Skill = FakeSkill;
type SocialLinkData = FakeSocial;

interface ProfileCardProps {
  name: string;
  title: string;
  bio: string;
  location: string;
  skills: Skill[];
  socials?: SocialLinkData[]; // optional — some profiles may not have socials
  isHiring?: boolean;         // optional badge flag
  isOpenToWork?: boolean;     // optional badge flag
  children?: React.ReactNode; // optional slot for extra content
}

// ─────────────────────────────────────────────────────────────
// ATOM: SkillBadge — displays a skill with its proficiency level
// ─────────────────────────────────────────────────────────────
// Record<K, V> is a TypeScript utility type: an object where
// all keys are of type K and all values are of type V.
// Here: every SkillLevel maps to a style config object.

const levelConfig: Record<SkillLevel, { color: string; bg: string; label: string }> = {
  beginner:     { color: "#94a3b8", bg: "#1e293b", label: "Beginner" },
  intermediate: { color: "#60a5fa", bg: "#1e3a5f", label: "Mid" },
  expert:       { color: "#a78bfa", bg: "#2e1d5e", label: "Expert" },
};

const SkillBadge = ({ name, level }: Skill) => {
  // Look up the style config for this skill level
  const config = levelConfig[level];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: config.bg,
      padding: "5px 10px",
      borderRadius: "8px",
    }}>
      <span style={{ color: config.color, fontSize: "13px", fontWeight: 500 }}>{name}</span>
      {/* Small label chip showing the level */}
      <span style={{
        fontSize: "10px",
        color: config.color,
        opacity: 0.7,
        background: "rgba(255,255,255,0.05)",
        padding: "1px 5px",
        borderRadius: "4px",
      }}>
        {config.label}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ATOM: SocialLink — clickable social media link
// ─────────────────────────────────────────────────────────────
// Record maps each platform to its emoji icon
const socialIcons: Record<SocialPlatform, string> = {
  github: "🐙",
  linkedin: "💼",
  twitter: "🐦",
  youtube: "▶️",
};

// Note: the interface name SocialLink conflicts with the component name.
// Using a different variable name for the component to avoid collision.
const SocialLinkItem = ({ platform, url, handle }: SocialLinkData) => (
  <a
    href={url}
    target="_blank"           // opens in new tab
    rel="noopener noreferrer" // security: prevents the new tab from accessing window.opener
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#7c85a2",
      fontSize: "13px",
      textDecoration: "none",
      padding: "4px 8px",
      borderRadius: "6px",
      transition: "background 0.15s",
    }}
    // Inline event handlers for hover effect
    // e.currentTarget refers to the element the handler is attached to
    onMouseEnter={(e) => { e.currentTarget.style.background = "#2d2d44"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
  >
    <span>{socialIcons[platform]}</span>
    <span>{handle}</span>
  </a>
);

// ─────────────────────────────────────────────────────────────
// ATOM: Avatar — generates a gradient avatar from initials
// ─────────────────────────────────────────────────────────────
const AvatarCard = ({ name }: { name: string }) => {
  // Extract up to 2 initials from the full name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color selection: same name always gets same gradient
  // Using name.length % colors.length ensures consistent mapping
  const colors = [
    ["#6366f1", "#a855f7"],
    ["#0ea5e9", "#6366f1"],
    ["#f59e0b", "#ef4444"],
    ["#10b981", "#0ea5e9"],
  ];
  const gradient = colors[name.length % colors.length];

  return (
    <div style={{
      width: "72px",
      height: "72px",
      borderRadius: "50%",
      // Template literal to inject dynamic color values into CSS gradient
      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: "24px",
      color: "#fff",
      flexShrink: 0, // don't shrink in flex container
      // Subtle glow effect using the first gradient color with 25% opacity
      boxShadow: `0 0 20px ${gradient[0]}40`,
    }}>
      {initials}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MOLECULE: ProfileCard — the main card component
// ─────────────────────────────────────────────────────────────
// This component orchestrates multiple atoms and renders
// all the data from ProfileCardProps.

const ProfileCard = ({
  name,
  title,
  bio,
  location,
  skills,
  socials = [],        // default to empty array so .length doesn't error
  isHiring = false,
  isOpenToWork = false,
  children,
}: ProfileCardProps) => (
  <div
    style={{
      background: "#1e1e2e",
      border: "1px solid #2d2d44",
      borderRadius: "16px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      transition: "border-color 0.2s",
    }}
    // Hover effect: highlight border on hover (inline event handlers)
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d44"; }}
  >
    {/* ── Header: Avatar + name + badges ── */}
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <AvatarCard name={name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>{name}</span>

          {/*
           * Conditional rendering with && operator:
           * Both badges only appear when their respective boolean props are true.
           * If false, React renders nothing (not even an empty element).
           */}
          {isOpenToWork && (
            <span style={{
              fontSize: "11px", padding: "2px 8px", borderRadius: "999px",
              background: "#14532d", color: "#4ade80", fontWeight: 600,
            }}>
              #OpenToWork
            </span>
          )}
          {isHiring && (
            <span style={{
              fontSize: "11px", padding: "2px 8px", borderRadius: "999px",
              background: "#1e3a5f", color: "#60a5fa", fontWeight: 600,
            }}>
              We&apos;re Hiring
            </span>
          )}
        </div>
        <p style={{ color: "#a5b4fc", fontSize: "13px", marginTop: "2px" }}>{title}</p>
        <p style={{ color: "#7c85a2", fontSize: "12px", marginTop: "4px" }}>📍 {location}</p>
      </div>
    </div>

    {/* ── Bio ── */}
    <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>{bio}</p>

    {/* ── Skills list — only render section if skills array is not empty ── */}
    {skills.length > 0 && (
      <div>
        <p style={{
          fontSize: "12px",
          color: "#7c85a2",
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          Skills
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {/* Map each Skill object to a SkillBadge atom — spread passes all fields */}
          {skills.map((skill) => (
            <SkillBadge key={skill.name} {...skill} />
          ))}
        </div>
      </div>
    )}

    {/* ── Social links — only render if at least one social is provided ── */}
    {socials.length > 0 && (
      <div style={{ borderTop: "1px solid #2d2d44", paddingTop: "12px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {/* Spread operator on SocialLink object — equivalent to passing each prop individually */}
          {socials.map((s) => (
            <SocialLinkItem key={s.platform} {...s} />
          ))}
        </div>
      </div>
    )}

    {/*
     * ── Children slot ──
     * Only render the container div when children is truthy.
     * This prevents an empty bordered section from appearing
     * when no children are passed.
     */}
    {children && (
      <div style={{ borderTop: "1px solid #2d2d44", paddingTop: "12px" }}>
        {children}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// DATA — Profile data array
// ─────────────────────────────────────────────────────────────
// In a real app this would come from an API. For this demo,
// hard-coding it here keeps the focus on React concepts.
// ─────────────────────────────────────────────────────────────
// DATA — Generated with faker, not real people
// ─────────────────────────────────────────────────────────────
// makeFakeProfiles() generates 3 profiles with randomized names,
// job titles, companies, skills, and social handles.
// The faker seed (set in lib/fake-data.ts) ensures the same output
// on every page render — so the UI is stable during development.

const fakeProfiles = makeFakeProfiles(3);

// Map FakeProfile to ProfileCardProps — shapes are compatible
const profiles: ProfileCardProps[] = fakeProfiles.map((p) => ({
  name:         p.name,
  title:        p.title,
  bio:          p.bio,
  location:     p.location,
  skills:       p.skills,
  socials:      p.socials,
  isHiring:     p.isHiring,
  isOpenToWork: p.isOpenToWork,
}));

// ─────────────────────────────────────────────────────────────
// ORGANISM: MiniProjectProfileCard — the page-level component
// ─────────────────────────────────────────────────────────────
export const MiniProjectProfileCard = () => (
  <div>
    {/* Summary banner explaining what this mini project covers */}
    <div style={{
      background: "#12121c",
      border: "1px solid #6366f1",
      borderRadius: "12px",
      padding: "16px 20px",
      marginBottom: "32px",
    }}>
      <p style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: "6px" }}>🎯 Mini Project — Profile Card</p>
      <p style={{ color: "#7c85a2", fontSize: "13px", lineHeight: "1.7" }}>
        Component tree:{" "}
        <code style={{ color: "#f472b6" }}>AvatarCard</code> →{" "}
        <code style={{ color: "#f472b6" }}>SkillBadge</code> →{" "}
        <code style={{ color: "#f472b6" }}>SocialLinkItem</code> →{" "}
        <code style={{ color: "#f472b6" }}>ProfileCard</code>.{" "}
        All Phase 0 concepts applied: TypeScript interfaces, optional props,
        conditional rendering, list rendering with key, children slot, spread operator.
      </p>
    </div>

    {/* CSS Grid layout — auto-fills columns with minimum 280px width */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "16px",
    }}>
      {profiles.map((profile) => (
        /*
         * Spread operator: {...profile} is shorthand for:
         * name={profile.name}
         * title={profile.title}
         * bio={profile.bio}
         * ... (all other props)
         */
        <ProfileCard key={profile.name} {...profile}>
          {/*
           * Anything between <ProfileCard> tags becomes "children" inside.
           * Each card gets a unique children based on its data.
           */}
          <p style={{ fontSize: "12px", color: "#7c85a2" }}>
            🔗 {profile.skills.length} skills listed
          </p>
        </ProfileCard>
      ))}
    </div>
  </div>
);
