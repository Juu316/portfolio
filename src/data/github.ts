/**
 * GitHub data for the homepage, read at build time.
 *
 * The calendar is read from the public HTML fragment that github.com profiles
 * load, because it matches the profile: it counts private contributions,
 * which the Actions token CI passes can't see. That markup is not an official
 * API and can change, so the GraphQL calendar is the fallback.
 * With GITHUB_TOKEN set (CI passes the built-in Actions token; locally use
 * `GITHUB_TOKEN=$(gh auth token)`), one GraphQL call also returns the year's
 * totals and the language mix of public repos. If no calendar can be read the
 * section is left out. The build never fails because of GitHub.
 * In the browser, GithubActivity.astro then redraws the calendar from a live API.
 * 
 */

export type Level = 0 | 1 | 2 | 3 | 4;

export interface Day {
  date: string;
  level: Level;
  count: number;
  /** Column (week) and row (weekday, Sunday = 0) in GitHub's grid. */
  week: number;
  weekday: number;
}

export interface Calendar {
  total: number;
  weeks: number;
  days: Day[];
}

/** Contribution totals for the calendar's year. */
export interface Stats {
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  /** Contributions to private repos; GitHub reports only the count. */
  private: number;
}

export interface Language {
  name: string;
  color: string;
  /** Share of code bytes across public, non-fork repos, 0–100. */
  percent: number;
}

export interface Github {
  calendar: Calendar;
  stats: Stats | null;
  languages: Language[] | null;
}

const cache = new Map<string, Promise<Github | null>>();

/** One fetch per build, however many locales render the homepage. */
export function getGithub(login: string) {
  if (!cache.has(login)) cache.set(login, load(login));
  return cache.get(login)!;
}

async function load(login: string): Promise<Github | null> {
  const token = process.env.GITHUB_TOKEN;
  const [html, api] = await Promise.allSettled([
    scrapeCalendar(login),
    token ? fromApi(login, token) : Promise.reject(new Error("no GITHUB_TOKEN")),
  ]);
  if (api.status === "rejected" && token) {
    console.warn(`[github] API failed: ${(api.reason as Error).message}`);
  }
  // The profile's HTML counts private contributions; the Actions token doesn't see them.
  const calendar =
    html.status === "fulfilled"
      ? html.value
      : api.status === "fulfilled"
        ? api.value.calendar
        : null;
  if (!calendar) {
    console.warn(
      `[github] contribution calendar skipped: ${(html as PromiseRejectedResult).reason}`,
    );
    return null;
  }
  const extra = api.status === "fulfilled" ? api.value : null;
  return { calendar, stats: extra?.stats ?? null, languages: extra?.languages ?? null };
}

const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

const LEVELS: Record<string, Level> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/** How many languages get their own slice; the rest become "Other". */
const TOP_LANGUAGES = 6;

async function fromApi(login: string, token: string): Promise<Github> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors[0].message);
  const user = body.data?.user;
  if (!user) throw new Error(`no user ${login}`);

  const c = user.contributionsCollection;
  const weeks: { contributionDays: any[] }[] = c.contributionCalendar.weeks;
  const days: Day[] = weeks.flatMap((w, week) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      level: LEVELS[d.contributionLevel] ?? 0,
      count: d.contributionCount,
      week,
      weekday: d.weekday,
    })),
  );

  const bytes = new Map<string, { size: number; color: string }>();
  for (const repo of user.repositories.nodes) {
    for (const { size, node } of repo.languages.edges) {
      const entry = bytes.get(node.name) ?? { size: 0, color: node.color ?? "#8b949e" };
      entry.size += size;
      bytes.set(node.name, entry);
    }
  }
  const sorted = [...bytes].sort((a, b) => b[1].size - a[1].size);
  const sum = sorted.reduce((n, [, l]) => n + l.size, 0);
  const pct = (size: number) => Math.round((size / sum) * 1000) / 10;
  const languages: Language[] = sorted
    .slice(0, TOP_LANGUAGES)
    .map(([name, l]) => ({ name, color: l.color, percent: pct(l.size) }));
  const rest = sorted.slice(TOP_LANGUAGES).reduce((n, [, l]) => n + l.size, 0);
  // An empty name marks "Other"; the component labels it per locale.
  if (rest > 0) languages.push({ name: "", color: "#8b949e", percent: pct(rest) });

  return {
    calendar: { total: c.contributionCalendar.totalContributions, weeks: weeks.length, days },
    stats: {
      commits: c.totalCommitContributions,
      pullRequests: c.totalPullRequestContributions,
      issues: c.totalIssueContributions,
      reviews: c.totalPullRequestReviewContributions,
      private: c.restrictedContributionsCount,
    },
    languages: sum > 0 ? languages : null,
  };
}

async function scrapeCalendar(login: string): Promise<Calendar> {
  const res = await fetch(`https://github.com/users/${login}/contributions`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // "17 contributions on May 24th." / "No contributions on October 12th."
  const counts = new Map<string, number>();
  for (const [, id, text] of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)</g)) {
    counts.set(id, Number(text.match(/^\s*(\d+)/)?.[1] ?? 0));
  }

  const days: Day[] = [];
  for (const [td] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const date = td.match(/data-date="([^"]+)"/)?.[1];
    const level = Number(td.match(/data-level="(\d)"/)?.[1]);
    const pos = td.match(/id="(contribution-day-component-(\d+)-(\d+))"/);
    if (!date || !pos || !(level >= 0 && level <= 4)) continue;
    days.push({
      date,
      level: level as Level,
      count: counts.get(pos[1]) ?? 0,
      weekday: Number(pos[2]),
      week: Number(pos[3]),
    });
  }

  const heading = html.match(/id="js-contribution-activity-description"[^>]*>([^<]*)</)?.[1];
  const total = Number(heading?.match(/([\d,]+)\s+contribution/)?.[1].replace(/,/g, ""));
  if (days.length === 0 || !Number.isFinite(total)) throw new Error("unexpected markup");

  return { total, weeks: Math.max(...days.map((d) => d.week)) + 1, days };
}
