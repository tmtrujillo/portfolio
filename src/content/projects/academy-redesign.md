---
title: "Redesigning the Academy and scaling product education video"
summary: "I restructured the Academy's information architecture around customer goals instead of product menus, built the front-end components myself, and created a system that turned video production from a one-person bottleneck into a team capability."
tags: ["Information Architecture", "Front-End Development", "Video Production", "Skilljar"]
role: "Senior Content Designer"
platform: "Skilljar, Wistia, Figma"
timeline: "2026"
order: 3
featured: true
---

The GoFundMe Pro Academy is the primary learning platform for nonprofit organizations using our fundraising tools. Over time, the Academy had grown organically — organized by product area rather than customer need, with limited navigation and no system for producing video at scale.

## Challenge

The Academy faced two related problems:

- **Navigation reflected internal product structure, not customer goals.** A nonprofit preparing for their first campaign had to know which product area to look in. There was no path organized around what they were trying to accomplish.
- **Video production didn't scale.** I was the sole producer for product education video, creating tutorials, walkthroughs, and feature demonstrations. As the product surface expanded — recurring giving, embeddable forms, live events, reporting — I couldn't produce everything alone.

## Solution

### Information architecture redesign

I restructured the Academy around use cases rather than product menus:

- **Use-case-first home page** organized by customer goals: "Launch your first campaign," "Set up recurring giving," "Prepare for giving season"
- **Library header with JavaScript filter injection** — I built a filtering system that lets learners narrow content by topic, format, or feature area without relying on Skilljar's default navigation
- **Component system** tied to Figma design tokens for consistent styling across the Academy
- **What's New page** with anchor modals so returning learners can quickly find recent additions

I also built practical tools directly into the Academy, including a Salesforce NPSP to Nonprofit Cloud migration guide and a legacy-to-Studio checklist, so the platform served as both a learning environment and a working reference.

### Scalable video production

To move video from a bottleneck to a team capability, I built the infrastructure for others to contribute:

- **21+ production folders** indexed and organized by feature area: Giving Cart, recurring features, Studio images, program designations, group registration, Live Events, and more
- **Care team recording guidelines** (published October 2026) establishing standards for lighting, framing, audio, and screen capture so the Care team can contribute raw footage that I edit into polished tutorials
- **YouTube channel strategy** mapped against 73 target keywords from our Wistia library, identifying gaps and prioritizing new production

This approach separated the creative work (scripting, editing, pacing) from the capture work (recording product walkthroughs), making it possible to produce more video without adding headcount.

## Results

- Academy reorganized from product-area navigation to use-case-first structure
- Custom front-end components built and deployed without engineering dependency
- Video production system expanded from sole producer to multi-contributor model

## What's next

The Academy redesign created the structure; the next step is proving it works. I'm building a cross-platform reporting framework to unify Skilljar course data, Wistia video engagement, and Appcues interaction metrics into a single view of how learners move through education content and whether it leads to product adoption.
