export type Media =
  | { type: "image"; src: string; portrait?: boolean }
  | {
      type: "video";
      src: string;
      poster?: string;
      portrait?: boolean;
      /** Show a sound toggle: for demos where the audio is the point. */
      sound?: boolean;
    };

export type Project = {
  title: string;
  description: string;
  media: Media;
  tech: string[];
  github: string;
  live?: string;
  /** Extra link shown next to source/live, e.g. a demo post. */
  demo?: { href: string; label: string };
  /** Shown in the blueprint title block. */
  date: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Clicky SDK",
    description:
      "An AI-powered UI guidance overlay for React Native and Expo apps. Users speak or type a question and Clicky highlights the relevant UI elements with step-by-step animated guidance, triggered by a shake, a volume-button triple-press or from code. Demoed on a UPI payments app to walk a first-time user through paying. Co-built with @shukla_pritika.",
    media: {
      type: "video",
      src: "/clicky-sdk.mp4",
      poster: "/clicky-sdk-poster.jpg",
      portrait: true,
    },
    tech: ["React Native", "Expo", "TypeScript", "Reanimated"],
    github: "https://github.com/Rishabjs03/clicky-sdk",
    demo: {
      href: "https://x.com/vineetwts/status/2042560329864143285",
      label: "demo on X ↗",
    },
    date: "APR 2026",
    featured: true,
  },
  {
    title: "clacky",
    description:
      "Your GitHub contribution graph as a grid of clickable mechanical keycaps. Every day is a key: press one and it bottoms out, springs back with a physically simulated return and clicks like a real switch, using real Blue, Brown, Red and Cream switch recordings. Pure-CSS keycaps, 8 themes, keyboard accessible, and it ships as both a React component and a zero-dependency web component.",
    media: {
      type: "video",
      src: "/clacky.mp4",
      poster: "/clacky-poster.jpg",
      sound: true,
    },
    tech: ["TypeScript", "React", "Web Components", "Motion"],
    github: "https://github.com/Rishabjs03/keyboard-graph",
    live: "https://clacky.rishabjs.xyz",
    demo: {
      href: "https://x.com/yrishavjs/status/2107120390120288277",
      label: "demo on X ↗",
    },
    date: "OCT 2026",
    featured: true,
  },
  {
    title: "lucidiff",
    description:
      "Turns a pull request into a self-contained, interactive HTML explainer for reviewing code you didn't write: a plain-English summary, per-file change cards, a flow diagram, risks cited to exact lines in the diff, and a test checklist. The model only fills a validated JSON schema, and every citation is checked against the diff before rendering. Works on GitHub PRs, local git ranges or any diff.",
    media: {
      type: "video",
      src: "/lucidiff.mp4",
      poster: "/lucidiff-poster.jpg",
    },
    tech: ["TypeScript", "Node.js", "AI SDK", "Zod", "Mermaid"],
    github: "https://github.com/Rishabjs03/pr-karpathy",
    live: "https://rishabjs03.github.io/pr-karpathy/",
    demo: {
      href: "https://x.com/yrishavjs/status/2106339914195607728",
      label: "demo on X ↗",
    },
    date: "OCT 2026",
    featured: true,
  },
  {
    title: "Gemini-Supermemory",
    description:
      "A Gemini CLI extension providing persistent AI memory across sessions and projects using Supermemory. Features auto-capture, codebase architecture indexing, and team-shared knowledge via MCP tools.",
    media: { type: "image", src: "/gemini-supermemory.png" },
    tech: ["Gemini", "Node.js", "TypeScript", "MCP"],
    github: "https://github.com/Rishabjs03/gemini-supermemory",
    date: "MAR 2026",
    featured: true,
  },
  {
    title: "MacClaw",
    description:
      "A macOS gesture control system that maps hand movements to desktop actions using Python and MediaPipe. Supports real-time cursor tracking, pinch-to-click, and gesture-based scrolling/dragging.",
    media: { type: "video", src: "/MacClaw.mp4" },
    tech: ["Python", "MediaPipe", "OpenCV"],
    github: "https://github.com/Rishabjs03/MacClaw",
    date: "MAR 2026",
    featured: true,
  },
  {
    title: "Zero",
    description:
      "An AI-powered search engine for discovering indie software products. Describe your problem in natural language and instantly surface the best matching tools built by independent developers.",
    media: { type: "video", src: "/zero.mp4" },
    tech: ["Next.js", "TypeScript", "Supabase"],
    github: "https://github.com/Rishabjs03",
    live: "https://zero.rishabjs.xyz",
    date: "MAR 2026",
  },
  {
    title: "ClipCraft AI",
    description:
      "An AI-powered video generator: enter a prompt and get a polished promo video. Claude AI writes the copy and Remotion renders the motion graphics, all automated end-to-end.",
    media: { type: "video", src: "/9feipLbs5TQANcQI.mp4" },
    tech: ["TypeScript", "Next.js", "Python"],
    github: "https://github.com/Rishabjs03/ClipCraft-Ai",
    date: "FEB 2026",
  },
  {
    title: "Nova AI",
    description:
      "Nova AI is an advanced multi-modal assistant that can read webpages, research live information, run Python code, and interact through natural voice conversations.",
    media: { type: "image", src: "/nova.png" },
    tech: ["LangChain", "TypeScript", "Next.js"],
    github: "https://github.com/Rishabjs03",
    live: "https://nova-gamma-five.vercel.app/",
    date: "2025",
  },
  {
    title: "Converso",
    description:
      "An AI-powered learning companion that lets students discuss topics and concepts in real time with an intelligent study partner.",
    media: { type: "image", src: "/converso.jpg" },
    tech: ["Next.js", "TypeScript", "React"],
    github: "https://github.com/Rishabjs03",
    live: "https://converso-amber-nine.vercel.app/",
    date: "2025",
  },
  {
    title: "SkillSwap",
    description:
      "A micro-gig platform where people list their specialized skills, host learning sessions, and earn per hour, complete with real-time chatting.",
    media: { type: "image", src: "/skillswap.png" },
    tech: ["Next.js", "TypeScript", "Prisma"],
    github: "https://github.com/Rishabjs03",
    live: "https://skill-swap-fsct.vercel.app/",
    date: "2025",
  },
  {
    title: "XMatch",
    description:
      "A Tinder-style matchmaking app for developers. Chat, match, and connect with fellow devs using real-time communication.",
    media: { type: "image", src: "/xmatch-new.png" },
    tech: ["Next.js", "Prisma", "Node.js"],
    github: "https://github.com/Rishabjs03",
    live: "https://tinder-clone-red.vercel.app/",
    date: "2025",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
