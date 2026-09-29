import "server-only";
import { site } from "./content/site";

/**
 * Pull requests authored by the site owner, fetched on the server only.
 *
 * - Uses the REST search API, which works with or without a token. Set
 *   GITHUB_TOKEN (server-side env var, never NEXT_PUBLIC_*) for the higher
 *   rate limit: 30 search requests/min instead of 10.
 * - Cached with Next's data cache: each query is fetched at most once per
 *   `REVALIDATE_SECONDS`, so visitors never hit GitHub directly and the page
 *   stays statically rendered (ISR). Tag "github-prs" can be revalidated on
 *   demand with revalidateTag().
 * - Never throws: on failure it returns empty lists plus `error`, and the UI
 *   shows a friendly note instead.
 */

export type PRState = "merged" | "open" | "closed";

export type PullRequest = {
  id: number;
  number: number;
  title: string;
  url: string;
  repo: string;
  state: PRState;
  createdAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  draft: boolean;
  comments: number;
};

export type PullRequestBuckets = Record<PRState, PullRequest[]> & {
  totals: Record<PRState, number>;
  error?: string;
};

const REVALIDATE_SECONDS = 60 * 60;
const PER_PAGE = 12;

const QUALIFIERS: Record<PRState, string> = {
  merged: "is:merged",
  open: "is:open",
  closed: "is:closed is:unmerged",
};

type SearchItem = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  created_at: string;
  closed_at: string | null;
  draft?: boolean;
  comments: number;
  pull_request?: { merged_at: string | null };
};

async function search(
  state: PRState,
): Promise<{ items: PullRequest[]; total: number }> {
  const q = `author:${site.githubUser} type:pr ${QUALIFIERS[state]}`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=${PER_PAGE}`;
  const token = process.env.GITHUB_TOKEN;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "rishav-portfolio",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github-prs"] },
  });

  if (!res.ok) throw new Error(`GitHub search failed (${res.status})`);
  const data = (await res.json()) as {
    total_count: number;
    items: SearchItem[];
  };

  const items = data.items.map((it) => ({
    id: it.id,
    number: it.number,
    title: it.title,
    url: it.html_url,
    repo: it.repository_url.replace("https://api.github.com/repos/", ""),
    state,
    createdAt: it.created_at,
    closedAt: it.closed_at,
    mergedAt: it.pull_request?.merged_at ?? null,
    draft: Boolean(it.draft),
    comments: it.comments,
  }));

  // Newest activity first: merge/close date, falling back to creation.
  items.sort(
    (a, b) =>
      +new Date(b.mergedAt ?? b.closedAt ?? b.createdAt) -
      +new Date(a.mergedAt ?? a.closedAt ?? a.createdAt),
  );
  return { items, total: data.total_count };
}

export async function getPullRequests(): Promise<PullRequestBuckets> {
  const states: PRState[] = ["merged", "open", "closed"];
  const results = await Promise.allSettled(states.map(search));

  const out: PullRequestBuckets = {
    merged: [],
    open: [],
    closed: [],
    totals: { merged: 0, open: 0, closed: 0 },
  };
  const errors: string[] = [];
  results.forEach((r, i) => {
    const state = states[i];
    if (r.status === "fulfilled") {
      out[state] = r.value.items;
      out.totals[state] = r.value.total;
    } else {
      errors.push(String(r.reason));
    }
  });
  if (errors.length === states.length) out.error = errors[0];
  return out;
}

/*
 * ─── Contribution calendar ───────────────────────────────────────────────
 * The last year of daily contribution counts, for the sketched heatmap.
 *
 * With GITHUB_TOKEN set, it asks GitHub's GraphQL API directly (GraphQL
 * always needs a token). Without one, or if that fails, it falls back to
 * the public github-contributions-api.jogruber.de service, the same source
 * the previous react-github-calendar widget used. Cached like the PRs.
 */

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};
export type ContributionCalendar = {
  total: number;
  days: ContributionDay[];
} | null;

const LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function fromGraphQL(token: string): Promise<ContributionCalendar> {
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "rishav-portfolio",
    },
    body: JSON.stringify({ query, variables: { login: site.githubUser } }),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github-contributions"] },
  });
  if (!res.ok) throw new Error(`GitHub GraphQL failed (${res.status})`);
  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: Array<{
              contributionDays: Array<{
                date: string;
                contributionCount: number;
                contributionLevel: string;
              }>;
            }>;
          };
        };
      };
    };
  };
  const cal = json.data?.user?.contributionsCollection.contributionCalendar;
  if (!cal) throw new Error("GitHub GraphQL returned no calendar");
  return {
    total: cal.totalContributions,
    days: cal.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      })),
    ),
  };
}

async function fromPublicApi(): Promise<ContributionCalendar> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${site.githubUser}?y=last`,
    {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["github-contributions"] },
    },
  );
  if (!res.ok) throw new Error(`Contributions API failed (${res.status})`);
  const json = (await res.json()) as {
    total: { lastYear: number };
    contributions: ContributionDay[];
  };
  return { total: json.total.lastYear, days: json.contributions };
}

/** Never throws: returns null when no source answers. */
export async function getContributions(): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      return await fromGraphQL(token);
    } catch {
      // fall through to the public API
    }
  }
  try {
    return await fromPublicApi();
  } catch {
    return null;
  }
}
