---
title: "Scaling course and guide production with AI content pipelines"
summary: "I turned a manual, error-prone content process into governed AI pipelines that my teammates install and use — cutting recurring defects and freeing review time for judgment calls."
tags: ["AI Systems", "Curriculum Development", "Process Design", "Quality Assurance"]
role: "Senior Content Designer"
platform: "Skilljar, Appcues, Google Drive"
timeline: "2026"
order: 1
featured: true
---

Our product education team produces Academy courses, in-app guides, and video tutorials for over 10,000 nonprofit organizations. As the product surface grew — recurring giving, embeddable forms, campaign migrations, reporting — the manual content process couldn't keep up. Courses took too long to produce, and the same mechanical errors kept recurring in review.

## Challenge

The content production process had three compounding problems:

- **Slow cycle time:** Each Academy course required manual research, outlining, drafting, review, and LMS formatting. The end-to-end process took days per course, limiting how quickly we could support new feature launches.
- **Recurring defects:** After synthesizing 9 revision reports, I found the same mechanical issues appearing on nearly every course — formatting inconsistencies, missing context, structural problems. Reviewers spent time catching predictable errors instead of evaluating substance.
- **Scaling bottleneck:** In-app guide requests came through ClickUp, and each one required manual drafting, brand voice checking, and Figma mockup creation. With growing demand, the queue backed up.

## Solution

I designed three interconnected systems, each with human approval gates to maintain quality while reducing production time.

### Academy course builder

A multi-stage pipeline packaged as an installable plugin that teammates can run themselves:

1. **Intake and research** — pulls product context and existing documentation
2. **Outline with rigor check** — generates a structured outline and validates it against learning objectives
3. **Draft** — produces lesson content following our style standards
4. **Review** — outputs to Google Drive for collaborative review
5. **Lint and QA** — runs deterministic checks against the style rules extracted from those 9 revision reports
6. **LMS formatting** — structures content for Skilljar publishing
7. **Lessons learned** — captures what worked and what to adjust for the next course

The pipeline stops for human approval at each stage. Nothing publishes without a person signing off.

### Appcues guide drafter

A pipeline that pulls guide requests from ClickUp, drafts briefs and copy in our brand voice, and generates Figma mockups for review. It's deliberately conservative — it never edits the source request or publishes directly.

### Deterministic lint checks

The insight from the revision reports was that most recurring defects were mechanical, not editorial. I converted our prose style rules into automated checks that run before human review, so reviewers can focus on judgment calls — tone, accuracy, pedagogical flow — rather than catching formatting issues.

## Results

- **117+ logged pipeline runs** and **121 guide drafts** produced through the Appcues pipeline since launch
- Teammates install and run the course builder independently, reducing dependency on a single producer
- Review cycles shifted from catching mechanical errors to evaluating content quality and instructional effectiveness

## What I'd do differently

The first version of the course builder treated style rules as prose instructions for the AI to interpret. That produced inconsistent results. The deterministic lint checks were a better approach — explicit, testable, and transparent. I'd build that layer first next time.
