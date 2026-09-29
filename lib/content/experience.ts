export type Role = {
  company: string;
  href: string;
  role: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
  tech: string[];
  /** Optional margin note: which bullet it points at and what it says. */
  note?: { bullet: number; text: string };
};

/** Newest first: the top floor of the building is the latest role. */
export const experience: Role[] = [
  {
    company: "Array Education",
    href: "https://arrayeducation.org",
    role: "AI Engineer",
    start: "Apr 2026",
    end: "Present",
    location: "USA · Remote",
    bullets: [
      "Solely architected and built an end-to-end AI Video Studio for generating career-focused video content for high school students across the US, set to be distributed on Overgrad's student platform",
      "Owned the full stack from pipeline architecture and API integrations (Kling, fal.ai, Claude) to frontend (Next.js, TypeScript) and backend (Python) development",
      "Designed and optimized multi-stage prompt engineering workflows using Claude and LLMs to drive character consistency across voice, wardrobe, appearance, and background visuals, with zero human talent involvement",
      "Reduced per-minute video production cost to under $10, matching influencer-level production quality at a fraction of the cost through an Applied AI workflow",
      "Currently iterating and refining the product pipeline in preparation for full-scale deployment to Overgrad's student network",
    ],
    tech: ["Python", "Next.js", "TypeScript", "Claude"],
    note: { bullet: 3, text: "< $10 / min of video" },
  },
  {
    company: "NAWKOUT",
    href: "https://nawkout.com",
    role: "Full Stack & AI Developer",
    start: "Dec 2025",
    end: "Apr 2026",
    location: "Houston, USA · Remote",
    bullets: [
      "Built an end-to-end AI-powered CEO CRM Tool, handling the entire development lifecycle from concept to production",
      "Took the product from 0 to 100 in under 1 month, delivering a fully functional platform at rapid pace",
      "Primarily worked with Python and TypeScript to build robust backend services and dynamic frontends",
      "Automated every workflow end-to-end, streamlining operations and eliminating manual processes",
      "Managed the full stack independently, from AI integrations and backend APIs to frontend UI and deployment",
    ],
    tech: ["Python", "TypeScript", "Next.js", "Node.js"],
    note: { bullet: 1, text: "built this in <1 month" },
  },
  {
    company: "AskGuru.ai",
    href: "https://askguru-six.vercel.app/",
    role: "AI & UI/UX Developer",
    start: "Oct 2025",
    end: "Nov 2025",
    location: "India · Remote",
    bullets: [
      "Contributed to building the intelligent AI chatbot architecture for AskGuru's platform",
      "Led the design and implementation of the complete UI/UX for the entire web interface",
      "Worked across both AI workflow and front-end systems ensuring a cohesive user experience",
      "Collaborated on refining conversational logic, responsiveness, and brand consistency",
    ],
    tech: ["Next.js", "TypeScript", "React", "Node.js"],
  },
];
