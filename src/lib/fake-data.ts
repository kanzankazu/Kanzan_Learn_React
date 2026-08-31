// =============================================================
// lib/fake-data.ts — Shared faker utilities
// =============================================================
// Centralized fake data generation using @faker-js/faker.
// All learning demos across phases import from here to keep
// data realistic but never tied to real people or companies.
//
// Why faker instead of hard-coded strings?
// - Data looks real (proper names, emails, job titles, etc.)
// - No personal/company info leaks into public repos
// - Easy to regenerate fresh data by changing the seed
// - Teaches real-world pattern: mock data for dev/test environments
//
// Faker seeding: faker.seed(N) makes generation deterministic.
// Same seed = same output every time = consistent UI across refreshes.
// =============================================================

import { faker } from "@faker-js/faker";

// Fix seed so the UI looks the same on every page refresh.
// Change the number to get a completely different set of fake data.
faker.seed(42);

// ── Types ─────────────────────────────────────────────────────

export type SkillLevel = "beginner" | "intermediate" | "expert";
export type SocialPlatform = "github" | "linkedin" | "twitter" | "youtube";
export type BadgeVariant = "blue" | "purple" | "green" | "orange" | "pink";

export interface FakeUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  company: string;
  location: string;
  bio: string;
  online: boolean;
  avatarInitials: string;
}

export interface FakeSkill {
  name: string;
  level: SkillLevel;
  variant: BadgeVariant;
}

export interface FakeSocial {
  platform: SocialPlatform;
  url: string;
  handle: string;
}

export interface FakeProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  skills: FakeSkill[];
  socials: FakeSocial[];
  isHiring: boolean;
  isOpenToWork: boolean;
}

// ── Helpers ───────────────────────────────────────────────────

/** Pick a random item from an array */
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Generate initials from a full name: "John Doe" -> "JD" */
export const toInitials = (name: string): string =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ── Generators ────────────────────────────────────────────────

/** Generate a single fake user */
export const makeFakeUser = (): FakeUser => {
  const name = faker.person.fullName();
  return {
    id:             faker.string.uuid(),
    name,
    email:          faker.internet.email({ firstName: name.split(" ")[0] }),
    jobTitle:       faker.person.jobTitle(),
    company:        faker.company.name(),
    location:       `${faker.location.city()}, ${faker.location.countryCode()}`,
    bio:            faker.lorem.sentence({ min: 10, max: 20 }),
    online:         faker.datatype.boolean(),
    avatarInitials: toInitials(name),
  };
};

/** Generate N fake users */
export const makeFakeUsers = (count: number): FakeUser[] =>
  Array.from({ length: count }, makeFakeUser);

// Tech skills pool — realistic for a dev profile card
const TECH_SKILLS: Array<{ name: string; variant: BadgeVariant }> = [
  { name: "React",         variant: "blue"   },
  { name: "TypeScript",    variant: "blue"   },
  { name: "Next.js",       variant: "purple" },
  { name: "Node.js",       variant: "green"  },
  { name: "Python",        variant: "green"  },
  { name: "GraphQL",       variant: "pink"   },
  { name: "Tailwind CSS",  variant: "blue"   },
  { name: "PostgreSQL",    variant: "orange" },
  { name: "Docker",        variant: "blue"   },
  { name: "AWS",           variant: "orange" },
  { name: "Kotlin",        variant: "purple" },
  { name: "Swift",         variant: "orange" },
  { name: "Go",            variant: "blue"   },
  { name: "Rust",          variant: "orange" },
  { name: "Vue.js",        variant: "green"  },
  { name: "Firebase",      variant: "orange" },
  { name: "MongoDB",       variant: "green"  },
  { name: "Redis",         variant: "pink"   },
  { name: "Figma",         variant: "pink"   },
  { name: "Git",           variant: "orange" },
];

const LEVELS: SkillLevel[] = ["beginner", "intermediate", "expert"];

/** Generate N random skills from the tech pool */
export const makeFakeSkills = (count: number): FakeSkill[] => {
  // Shuffle and take first N to avoid duplicates
  const shuffled = [...TECH_SKILLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s) => ({
    ...s,
    level: pick(LEVELS),
  }));
};

const PLATFORMS: SocialPlatform[] = ["github", "linkedin", "twitter", "youtube"];

/** Generate fake social links for N random platforms */
export const makeFakeSocials = (count: number): FakeSocial[] => {
  const shuffled = [...PLATFORMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((platform) => {
    // Generate a URL-friendly username from faker
    const username = faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const baseUrls: Record<SocialPlatform, string> = {
      github:   "https://github.com",
      linkedin: "https://linkedin.com/in",
      twitter:  "https://twitter.com",
      youtube:  "https://youtube.com/@",
    };
    return {
      platform,
      url:    `${baseUrls[platform]}/${username}`,
      handle: platform === "twitter" ? `@${username}` : username,
    };
  });
};

/** Generate a full fake developer profile */
export const makeFakeProfile = (): FakeProfile => {
  const name = faker.person.fullName();
  const jobTitle = faker.person.jobTitle();
  const company = faker.company.name();
  return {
    id:           faker.string.uuid(),
    name,
    title:        `${jobTitle} · ${company}`,
    bio:          faker.lorem.sentences({ min: 2, max: 3 }),
    location:     `${faker.location.city()}, ${faker.location.countryCode()}`,
    skills:       makeFakeSkills(faker.number.int({ min: 3, max: 6 })),
    socials:      makeFakeSocials(faker.number.int({ min: 1, max: 3 })),
    isHiring:     faker.datatype.boolean({ probability: 0.3 }),
    isOpenToWork: faker.datatype.boolean({ probability: 0.4 }),
  };
};

/** Generate N fake developer profiles */
export const makeFakeProfiles = (count: number): FakeProfile[] =>
  Array.from({ length: count }, makeFakeProfile);
