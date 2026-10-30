---
title: "Halving course turnaround with governed AI pipelines"
summary: "I turned a slow, manual content process into AI pipelines with a human approval at every stage — and made our style rules testable. Course turnaround dropped from six or more weeks to three or fewer, with up to four contributors producing at once."
tags: ["AI Systems", "Content Engineering", "Curriculum Development", "Quality Assurance"]
role: "Senior Content Designer — designer and builder"
platform: "Claude, Skilljar, Appcues, Figma, Google Drive"
timeline: "2026"
order: 6
featured: true
results:
  - value: "6+ → ≤3 wks"
    label: "course turnaround, about twice as fast"
  - value: "4"
    label: "contributors producing courses at peak"
  - value: "120+"
    label: "in-app guide drafts since April 2026"
---

![Course builder pipeline with eight stages, each with a human approval gate](/portfolio/images/ai-content-pipelines/ai-pipeline.svg)

## My role

I designed and built these systems myself, with a human approval at every stage, and packaged them so teammates could install and run them.

## The problem

A small team supported courses, in-app guides, and videos for a growing product. Courses took six weeks or more, with a lot of hand-holding to build each resource's HTML. Reviewers kept catching the same mechanical errors instead of judging substance.

## What I did

- **Found the pattern first.** I analyzed nine revision reports and found the same handful of defects on almost every course. Style rules written as prose weren't surviving fast drafting.
- **Turned rules into checks.** Style and format rules became deterministic lint checks that run before any human review.
- **Built pipelines with approval gates:**
  - A **course builder** covering intake, research, outline with a rigor check, drafting, shared review, automated QA, LMS formatting, and lessons learned.
  - An **enablement version** for internal training and sales enablement.
  - An **in-app pipeline** that turns Slack and ClickUp signals into ranked opportunities, drafted guides, and Figma frames.
- **Kept people in charge.** None of the pipelines publishes or sends anything on its own.

## Results

- Course turnaround dropped from **six or more weeks to three weeks or less** — about twice as fast.
- At peak, **four contributors** were producing courses through the pipeline.
- **120+ in-app guide drafts** since April 2026.
- Review shifted from formatting to accuracy, voice, and instructional quality.

Turnaround times come from project records, not a controlled comparison, and earlier timelines varied widely.

<!-- VISUAL: a lint report before and after; the course builder's step-by-step approval screen. -->

## What I learned

AI drafting is only as reliable as the standards it's held to. Making those standards explicit and testable did more for quality than better prompts — the same discipline it takes to prepare knowledge for AI agents.
