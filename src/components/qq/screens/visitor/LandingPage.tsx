"use client";

import Image from "next/image";
import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import type { GuestReadinessDraft } from "@/lib/qq/types";
import { assetPath } from "@/lib/asset-path";
import styles from "./LandingPage.module.css";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CaretLeft,
  CaretRight,
  Check,
  CheckCircle,
  ClockCountdown,
  Lightning,
  ListChecks,
  PaperPlaneTilt,
  SealCheck,
  ShieldCheck,
  Sparkle,
  Target,
  UsersThree,
} from "@phosphor-icons/react";

const cx = (...names: Array<string | false | null | undefined>) =>
  names
    .filter(Boolean)
    .flatMap((name) => String(name).split(" "))
    .map((name) => styles[name] ?? name)
    .join(" ");

const promptIdeas = [
  "Design a product launch page",
  "Build a mobile onboarding flow",
  "Automate a back-office workflow",
];

const tracks = [
  {
    id: "beta",
    tone: "coral",
    kicker: "FOUNDING BETA",
    title: "₹0 QuickQuid fee during beta",
    body: "Selected digital projects only. Payment-provider charges and taxes may still apply.",
    meta: ["Buyers ₹0", "Pros ₹0"],
  },
  {
    id: "design",
    image: assetPath("/assets/beta-track-product-design.png"),
    kicker: "PRODUCT DESIGN",
    title: "Turn a rough idea into a shippable product flow.",
    body: "UX strategy · UI systems · Prototypes",
    meta: ["Proof-matched", "Capacity-checked"],
  },
  {
    id: "frontend",
    image: assetPath("/assets/beta-track-frontend.png"),
    kicker: "FRONTEND BUILD",
    title: "Move from approved design to a working interface.",
    body: "React · Web apps · Responsive builds",
    meta: ["Scope locked", "Handoff included"],
  },
  {
    id: "ai",
    image: assetPath("/assets/beta-track-ai-ops.png"),
    kicker: "AI + AUTOMATION",
    title: "Build a workflow your team can actually operate.",
    body: "Internal tools · AI workflows · Integrations",
    meta: ["Human reviewed", "Evidence-backed"],
  },
];

const workflow = [
  {
    number: "01",
    short: "Make it Ready",
    title: "Turn the rough request into a project people can price.",
    body: "QuickQuid checks the outcome, inputs, budget, timeline, decision-maker and definition of done before matching begins.",
    result: "You stop paying for ambiguity.",
    icon: ListChecks,
  },
  {
    number: "02",
    short: "Match the proof",
    title: "See evidence from comparable work—not keyword soup.",
    body: "The match is explained through relevant proof and current capacity, so a polished profile cannot hide a weak fit.",
    result: "You compare fit, not theatre.",
    icon: Target,
  },
  {
    number: "03",
    short: "Lock the Pact",
    title: "Put scope, responsibilities and response windows in one record.",
    body: "Buyer and Pro agree on deliverables, inputs, checkpoints, revision limits, AI-use rules and acceptance criteria.",
    result: "Everyone works from the same deal.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    short: "Control delivery",
    title: "Catch drift while it is still cheap to fix.",
    body: "Early proof confirms direction. Material blockers and scope changes are recorded before they reshape the work.",
    result: "No invisible scope creep.",
    icon: ClockCountdown,
  },
  {
    number: "05",
    short: "Accept the work",
    title: "Close against the agreed definition of done.",
    body: "Final files, evidence, approved changes and handoff items live together, ready for a human acceptance decision.",
    result: "Finished means accepted—not uploaded.",
    icon: SealCheck,
  },
];



function Logo() {
  return (
    <a className={cx("logo")} href="#top" aria-label="QuickQuid home">
      <span className={cx("logo-mark")}>
        <Image src={assetPath("/quickquid-logo.svg")} alt="" width={28} height={28} priority />
      </span>
      <span>QuickQuid</span>
    </a>
  );
}

function Pill({ children, onClick, selected = false }: { children: React.ReactNode; onClick: () => void; selected?: boolean }) {
  return (
    <button className={cx("idea-pill", selected && "selected")} onClick={onClick} type="button">
      <Sparkle size={15} weight="fill" aria-hidden="true" />
      {children}
    </button>
  );
}

function TrackCard({ track, onChoose }: { track: (typeof tracks)[number]; onChoose: (track: (typeof tracks)[number]) => void }) {
  return (
    <article className={cx("track-card", track.tone ?? "image-card")}>
      {track.image && (
        <>
          <Image
            src={track.image}
            alt=""
            fill
            sizes="(max-width: 760px) 82vw, (max-width: 1000px) 46vw, 30vw"
            className={cx("track-card-image")}
          />
          <div className={cx("image-shade")} aria-hidden="true" />
        </>
      )}
      <div className={cx("track-card-content")}>
        <div className={cx("track-topline")}>
          <span>{track.kicker}</span>
          <button onClick={() => onChoose(track)} aria-label={`Use ${track.kicker} as project starting point`} type="button">
            <ArrowUpRight size={19} />
          </button>
        </div>
        <h3>{track.title}</h3>
        <p>{track.body}</p>
        <div className={cx("track-meta")}>
          {track.meta.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
    </article>
  );
}

export function LandingPage() {
  const { navigate, setGuestDraft } = useQQ();
  const promptRef = React.useRef<HTMLTextAreaElement | null>(null);
  const carouselRef = React.useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = React.useState(() => {
    if (typeof window === "undefined") return "";
    try { return sessionStorage.getItem("qq_guest_project_prompt") ?? ""; } catch { return ""; }
  });
  const [emptyError, setEmptyError] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    try {
      if (prompt.trim()) sessionStorage.setItem("qq_guest_project_prompt", prompt);
      else sessionStorage.removeItem("qq_guest_project_prompt");
    } catch {
      // Session storage is optional in private browsing.
    }
  }, [prompt]);

  const focusComposer = React.useCallback(() => {
    promptRef.current?.focus();
  }, []);

  const openAuth = React.useCallback((authMode: "signin" | "create", roleIntent?: "buyer" | "pro") => {
    navigate("auth", { authMode, roleIntent });
  }, [navigate]);

  const startReadiness = React.useCallback((request = prompt) => {
    const originalRequest = request.trim();
    if (!originalRequest) {
      setEmptyError(true);
      focusComposer();
      return;
    }

    const draft: GuestReadinessDraft = {
      originalRequest,
      workingTitle: "",
      category: "OTHER",
      outcome: "",
      deliverables: [],
      exclusions: [],
      inputs: [],
      budgetBand: "",
      targetDate: "",
      deadlineReason: "",
      decisionMaker: "",
      feedbackWindow: "",
      acceptanceCriteria: [],
      completedAreas: [],
      conversationStep: 0,
      status: "IN_PROGRESS",
    };

    setEmptyError(false);
    try {
      sessionStorage.setItem("qq_guest_readiness_draft", JSON.stringify(draft));
      sessionStorage.setItem("qq_guest_project_prompt", originalRequest);
    } catch {
      // The Zustand state still carries the draft if storage is unavailable.
    }
    setGuestDraft(draft);
    navigate("guest_readiness_chat");
  }, [focusComposer, navigate, prompt, setGuestDraft]);

  const fillPrompt = (value: string) => {
    setPrompt(value);
    setEmptyError(false);
    window.requestAnimationFrame(focusComposer);
  };

  const chooseTrack = (track: (typeof tracks)[number]) => {
    if (track.id === "beta") {
      focusComposer();
      return;
    }

    const starter = {
      design: "Design a clear, conversion-ready product experience for our next launch.",
      frontend: "Build a responsive frontend from our approved product designs.",
      ai: "Automate a repeatable internal workflow with a usable handoff for our team.",
    }[track.id];

    if (starter) fillPrompt(starter);
    window.scrollTo({ top: 70, behavior: "smooth" });
  };

  const scrollTracks = (direction: number) => {
    carouselRef.current?.scrollBy({ left: direction * 380, behavior: "smooth" });
  };

  const ActiveIcon = workflow[activeStep].icon;

  return (
    <main id="top" className={cx("root")}>
      <div className={cx("announcement")}>
        <div>
          <span className={cx("announcement-pulse")} aria-hidden="true" />
          <span>Founding beta in Kochi</span>
          <span className={cx("announcement-separator")} />
          <span className={cx("announcement-copy-secondary")}>QuickQuid fee ₹0 during beta</span>
        </div>
        <button onClick={() => openAuth("create", "pro")} type="button">Join the founding cohort <ArrowRight size={14} /></button>
      </div>

      <header className={cx("site-header")}>
        <Logo />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#buyers">For Buyers</a>
          <a href="#pros">For Pros</a>
          <a href="#beta-tracks">Explore work</a>
        </nav>
        <div className={cx("header-actions")}>
          <button className={cx("login-button")} type="button" onClick={() => openAuth("create")}>Sign in</button>
          <button className={cx("nav-cta")} type="button" onClick={focusComposer}>
            Submit a project
          </button>
        </div>
      </header>

      <section className={cx("hero")} aria-labelledby="hero-title">
        <div className={cx("hero-kicker")}><Lightning size={16} weight="fill" /> THE EXECUTION MARKETPLACE</div>
        <h1 id="hero-title">Most marketplaces help you hire.<br /><span>QuickQuid helps the work get finished.</span></h1>
        <p className={cx("hero-copy")}>
          QuickQuid prepares the project, matches comparable proof and keeps scope, delivery and acceptance inside one accountable record.
        </p>

        <div className={cx("prompt-shell")}>
          <label htmlFor="project-prompt">What needs to get finished?</label>
          <textarea
            ref={promptRef}
            id="project-prompt"
            value={prompt}
            onChange={(event) => { setPrompt(event.target.value); setEmptyError(false); }}
            placeholder="Example: Design and build a responsive landing page for our product launch."
            rows={2}
            aria-invalid={emptyError}
            aria-describedby={emptyError ? "project-prompt-error" : undefined}
          />
          <div className={cx("prompt-footer")}>
            <span><ShieldCheck size={16} weight="fill" /> Selected digital projects · private beta</span>
            <button onClick={() => startReadiness()} type="button" className={cx("prompt-submit")}>
              Make my project Ready <ArrowRight size={18} weight="bold" />
            </button>
          </div>
          {emptyError && <p id="project-prompt-error" className={cx("prompt-error")} role="alert">Describe the outcome you need before we make the project Ready.</p>}
        </div>

        <div className={cx("prompt-ideas")} aria-label="Project examples">
          {promptIdeas.map((idea) => <Pill key={idea} onClick={() => fillPrompt(idea)} selected={prompt === idea}>{idea}</Pill>)}
        </div>
      </section>

      <section className={cx("tracks-section")} id="beta-tracks" aria-labelledby="tracks-title">
        <div className={cx("section-heading", "compact")}>
          <div>
            <span className={cx("eyebrow")}>FOUNDING BETA TRACKS</span>
            <h2 id="tracks-title">Start where the demand is clearest.</h2>
          </div>
          <div className={cx("carousel-actions")}>
            <button onClick={() => scrollTracks(-1)} aria-label="View previous beta tracks" type="button"><CaretLeft size={20} /></button>
            <button onClick={() => scrollTracks(1)} aria-label="View next beta tracks" type="button"><CaretRight size={20} /></button>
          </div>
        </div>
        <div className={cx("tracks-carousel")} ref={carouselRef}>
          {tracks.map((track) => <TrackCard track={track} key={track.id} onChoose={chooseTrack} />)}
        </div>
        <p className={cx("tracks-note")}><CheckCircle size={16} weight="fill" /> Categories shown are beta focus areas—not invented live jobs or customer claims.</p>
      </section>

      <section className={cx("execution-strip")} aria-label="QuickQuid execution path">
        <span>YOUR REQUEST</span>
        {workflow.map((step, index) => (
          <div key={step.number}>
            <ArrowRight size={15} />
            <button type="button" onClick={() => { setActiveStep(index); document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" }); }}>
              {step.short}
            </button>
          </div>
        ))}
      </section>

      <section className={cx("difference-section")} aria-labelledby="difference-title">
        <div className={cx("difference-copy")}>
          <span className={cx("eyebrow", "light")}>WHY QUICKQUID</span>
          <h2 id="difference-title">Hiring is one click.<br />Execution is the product.</h2>
          <p>A great professional can still fail inside a badly prepared project. QuickQuid builds the operating rails around the work—not another infinite profile directory.</p>
          <button className={cx("inverse-button")} onClick={focusComposer} type="button">
            Start with a Ready project <ArrowUpRight size={18} />
          </button>
        </div>
        <div className={cx("difference-grid")}>
          <article>
            <span className={cx("difference-icon", "coral")}><Target size={21} weight="fill" /></span>
            <h3>Proof over profile polish</h3>
            <p>Understand why the evidence fits this exact outcome.</p>
          </article>
          <article>
            <span className={cx("difference-icon", "blue")}><ClockCountdown size={21} weight="fill" /></span>
            <h3>Capacity over optimism</h3>
            <p>Commit against real availability and dependencies.</p>
          </article>
          <article>
            <span className={cx("difference-icon", "mint")}><ShieldCheck size={21} weight="fill" /></span>
            <h3>One Pact over scattered chat</h3>
            <p>Scope, roles, response windows and changes stay visible.</p>
          </article>
          <article>
            <span className={cx("difference-icon", "gold")}><SealCheck size={21} weight="fill" /></span>
            <h3>Acceptance over upload</h3>
            <p>Close the project against the definition of done.</p>
          </article>
        </div>
      </section>

      <section className={cx("workflow-section")} id="how-it-works" aria-labelledby="workflow-title">
        <div className={cx("section-heading")}>
          <div>
            <span className={cx("eyebrow")}>HOW QUICKQUID WORKS</span>
            <h2 id="workflow-title">The match is one step.<br />The finish is five.</h2>
          </div>
          <p>Tap each stage. The workflow is designed to keep uncertainty expensive for the system—not for the buyer or Pro.</p>
        </div>

        <div className={cx("workflow-layout")}>
          <div className={cx("workflow-tabs")} role="tablist" aria-label="Execution workflow stages">
            {workflow.map((step, index) => (
              <button
                key={step.number}
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                className={cx(activeStep === index && "active")}
                onClick={() => setActiveStep(index)}
              >
                <span>{step.number}</span>
                {step.short}
                {activeStep === index && <ArrowRight size={17} />}
              </button>
            ))}
          </div>
          <article className={cx("workflow-detail")} role="tabpanel">
            <div className={cx("workflow-icon")}><ActiveIcon size={28} weight="fill" /></div>
            <span className={cx("step-label")}>STAGE {workflow[activeStep].number}</span>
            <h3>{workflow[activeStep].title}</h3>
            <p>{workflow[activeStep].body}</p>
            <div className={cx("workflow-result")}><CheckCircle size={20} weight="fill" />{workflow[activeStep].result}</div>
          </article>
        </div>
      </section>

      <section className={cx("audience-section")}>
        <article className={cx("audience-card", "buyer")} id="buyers">
          <div className={cx("audience-number")}>01</div>
          <Briefcase size={28} weight="fill" />
          <span className={cx("eyebrow")}>FOR BUYERS</span>
          <h2>Stop buying a profile and hoping for an outcome.</h2>
          <ul>
            <li><Check size={17} weight="bold" /> Clearer brief before hiring</li>
            <li><Check size={17} weight="bold" /> Evidence behind the match</li>
            <li><Check size={17} weight="bold" /> Visible scope changes and delays</li>
          </ul>
          <button className={cx("primary-button")} onClick={focusComposer} type="button">
            Submit a project <ArrowRight size={17} />
          </button>
        </article>
        <article className={cx("audience-card", "pro")} id="pros">
          <div className={cx("audience-number")}>02</div>
          <UsersThree size={28} weight="fill" />
          <span className={cx("eyebrow", "light")}>FOR PROFESSIONALS</span>
          <h2>Good professionals deserve good projects.</h2>
          <ul>
            <li><Check size={17} weight="bold" /> Know what is expected before accepting</li>
            <li><Check size={17} weight="bold" /> Commit against real capacity</li>
            <li><Check size={17} weight="bold" /> Keep new requests out until approved</li>
          </ul>
          <button className={cx("inverse-button")} onClick={() => openAuth("create", "pro")} type="button">
            Join as a founding Pro <ArrowRight size={17} />
          </button>
        </article>
      </section>

      <section className={cx("beta-cta")} aria-labelledby="cta-title">
        <div className={cx("cta-stamp")}><Lightning size={25} weight="fill" /> ₹0</div>
        <div>
          <span className={cx("eyebrow")}>FOUNDING BETA</span>
          <h2 id="cta-title">Your next project should not begin with a gamble.</h2>
          <p>Make it Ready. Match the proof. Run the work against one shared record.</p>
        </div>
        <div className={cx("cta-actions")}>
          <button className={cx("primary-button", "large")} onClick={focusComposer} type="button">
            Make my project Ready <PaperPlaneTilt size={18} weight="fill" />
          </button>
          <button className={cx("text-button")} onClick={() => openAuth("create", "pro")} type="button">Join as a founding Pro</button>
        </div>
      </section>

      <footer>
        <Logo />
        <p>Built for the work after the match.<br /><span>Private-beta prototype · India</span></p>
        <div>
          <a href="#how-it-works">How it works</a>
          <button type="button" onClick={() => openAuth("create", "pro")}>For Pros</button>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </main>
  );
}
