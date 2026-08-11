"use client";

import * as React from "react";
import { Github, ExternalLink, GitFork, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ExternalProfileLink } from "@/lib/qq/types";
import { externalProfileHandle } from "@/lib/qq/external";
import { timeAgo } from "@/lib/qq/format";

type GitHubUser = { login: string; name?: string; avatar_url?: string; bio?: string; public_repos?: number; followers?: number; html_url?: string };
type GitHubRepo = { name: string; html_url: string; description?: string; language?: string; stargazers_count?: number; forks_count?: number; topics?: string[]; pushed_at?: string };

function initials(name: string) {
  return name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();
}

function demoActivityLevel(seed: string, dayIndex: number) {
  let hash = 0;
  for (const char of `${seed}-${dayIndex}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const n = hash % 18;
  if (n < 8) return 0;
  if (n < 12) return 1;
  if (n < 15) return 2;
  if (n < 17) return 3;
  return 4;
}

function DemoActivityCalendar({ seed }: { seed: string }) {
  const levels = ["bg-muted", "bg-emerald-200 dark:bg-emerald-900", "bg-emerald-400 dark:bg-emerald-700", "bg-emerald-500", "bg-emerald-700 dark:bg-emerald-400"];
  const cells = React.useMemo(() => Array.from({ length: 26 * 7 }, (_, index) => demoActivityLevel(seed, index)), [seed]);
  const activeDays = cells.filter((level) => level > 0).length;

  return (
    <div className="rounded-md border border-dashed border-border bg-muted/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-medium">GitHub activity calendar</div>
          <p className="text-[11px] text-muted-foreground">{activeDays} demo activity days across 26 weeks — not a GitHub contribution total.</p>
        </div>
        <Badge variant="outline" className="text-[10px]">Demo calendar</Badge>
      </div>
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="grid w-max grid-rows-7 gap-1" style={{ gridTemplateColumns: "repeat(26, 10px)" }} aria-label="Demo GitHub activity calendar">
          {cells.map((level, index) => <span key={index} className={`size-2.5 rounded-[2px] ${levels[level]}`} />)}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground"><span>Less</span>{levels.map((tone, index) => <span key={index} className={`size-2.5 rounded-[2px] ${tone}`} />)}<span>More</span></div>
    </div>
  );
}

/**
 * Presents public GitHub REST data when available plus a deliberately labelled
 * fixture calendar. A real contribution calendar needs authenticated GraphQL
 * and must replace the fixture in the production adapter.
 */
export function GitHubProofPanel({ link, seed }: { link: ExternalProfileLink; seed: string }) {
  const [githubUser, setGithubUser] = React.useState<GitHubUser | null>(null);
  const [repos, setRepos] = React.useState<GitHubRepo[]>([]);
  const [syncing, setSyncing] = React.useState(true);
  const handle = externalProfileHandle(link);

  React.useEffect(() => {
    if (!handle || typeof window === "undefined") { setSyncing(false); return; }
    let cancelled = false;
    setSyncing(true);
    Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, { headers: { Accept: "application/vnd.github+json" } }).then((response) => response.ok ? response.json() : null),
      fetch(`https://api.github.com/users/${encodeURIComponent(handle)}/repos?sort=updated&per_page=4`, { headers: { Accept: "application/vnd.github+json" } }).then((response) => response.ok ? response.json() : []),
    ]).then(([user, sourceRepos]) => {
      if (cancelled) return;
      setGithubUser(user && typeof user.login === "string" ? user : null);
      setRepos(Array.isArray(sourceRepos) ? sourceRepos.filter((repo) => repo && typeof repo.name === "string" && typeof repo.html_url === "string").map((repo) => ({ name: repo.name, html_url: repo.html_url, description: repo.description, language: repo.language, stargazers_count: repo.stargazers_count, forks_count: repo.forks_count, topics: Array.isArray(repo.topics) ? repo.topics.filter((topic: unknown): topic is string => typeof topic === "string").slice(0, 3) : [], pushed_at: repo.pushed_at })).slice(0, 4) : []);
    }).catch(() => { if (!cancelled) { setGithubUser(null); setRepos([]); } }).finally(() => { if (!cancelled) setSyncing(false); });
    return () => { cancelled = true; };
  }, [handle]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2"><Github className="size-4" /><h3 className="text-sm font-semibold">GitHub proof</h3>{link.isDemo && <Badge variant="outline" className="text-[10px]">Demo API source</Badge>}{syncing && <span className="text-xs text-muted-foreground">Syncing public profile…</span>}</div>
      {link.isDemo && <p className="text-xs text-amber-700 dark:text-amber-300">This prototype points at a public demonstration account. Replace it with the Pro’s consented GitHub connection before production.</p>}
      {githubUser && <a href={githubUser.html_url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3 hover:border-primary/50"><Avatar className="size-11"><AvatarImage src={githubUser.avatar_url} alt={`${githubUser.name || githubUser.login} GitHub avatar`} /><AvatarFallback>{initials(githubUser.name || githubUser.login)}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="flex items-center gap-1 font-medium">{githubUser.name || githubUser.login}<ExternalLink className="size-3 text-muted-foreground" /></span><span className="block truncate text-xs text-muted-foreground">@{githubUser.login}{githubUser.bio ? ` · ${githubUser.bio}` : ""}</span><span className="mt-1 block text-[10px] text-muted-foreground">{githubUser.public_repos ?? 0} public repos · {githubUser.followers ?? 0} followers</span></span></a>}
      <DemoActivityCalendar seed={seed} />
      {repos.length > 0 ? <div className="grid gap-2 sm:grid-cols-2">{repos.map((repo) => <a key={repo.html_url} href={repo.html_url} target="_blank" rel="noreferrer" className="rounded-md border border-border p-3 hover:border-primary/50"><div className="flex items-start justify-between gap-2"><span className="text-xs font-medium">{repo.name}</span><ExternalLink className="size-3 shrink-0 text-muted-foreground" /></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{repo.description || "Public repository"}</p><div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-muted-foreground"><span>{repo.language || "Code"}</span><span className="inline-flex items-center gap-0.5"><Star className="size-2.5" />{repo.stargazers_count ?? 0}</span><span className="inline-flex items-center gap-0.5"><GitFork className="size-2.5" />{repo.forks_count ?? 0}</span>{repo.pushed_at && <span>Updated {timeAgo(repo.pushed_at)}</span>}</div>{repo.topics?.length ? <div className="mt-2 flex flex-wrap gap-1">{repo.topics.map((topic) => <Badge key={topic} variant="secondary" className="text-[10px]">{topic}</Badge>)}</div> : null}</a>)}</div> : !syncing ? <p className="text-xs text-muted-foreground">GitHub did not return public repositories. Private repositories are never requested.</p> : null}
    </section>
  );
}
