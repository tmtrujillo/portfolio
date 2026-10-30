---
title: "Writing for developers: webhooks, the API, and payments"
summary: "I write the technical documentation that developers and integration partners use to connect to GoFundMe Pro, including the webhooks guide, developer docs, and payments docs for GoFundMe Pay, which runs on Stripe."
tags: ["Developer Documentation", "API", "Webhooks", "Payments"]
role: "Technical writer"
platform: "Help Center, developer portal"
timeline: "Second half of 2025"
order: 7
featured: false
links:
  - label: "Using webhooks"
    url: "https://prosupport.gofundme.com/hc/en-us/articles/41221411214619-Using-webhooks"
    source: "Help Center"
  - label: "GoFundMe Pro API docs"
    url: "https://developers.gofundme.com/pro/docs"
    source: "Developer docs"
---

## My role

I wrote and maintain developer-facing documentation for GoFundMe Pro: the [webhooks guide](https://prosupport.gofundme.com/hc/en-us/articles/41221411214619-Using-webhooks), pages in the [developer docs](https://developers.gofundme.com/pro/docs), and the payments documentation for GoFundMe Pay, which runs on Stripe.

## The problem

Integration partners and nonprofit developers needed to keep their own systems, such as CRMs and reporting tools, in sync with donations as they happened. Polling the API for changes was slow and wasteful, and a webhook integration has failure modes that a first-time integrator doesn't see coming.

## What I did

- **Wrote the webhooks guide as a full integration path:** prerequisites, setting up an endpoint, the events available and what each is useful for, testing with sample events, troubleshooting, and security.
- **Covered what goes wrong in production, not just setup.** The guide covers retries, failed deliveries, events that arrive out of order or more than once, and an unexpected event type that confused integrators. It recommends idempotent processing and occasional checks against the API.
- **Organized events by use case.** A single table groups supporter, transaction, and recurring donation events with the job each one is commonly used for, so developers can find the event they need without reading the whole catalog.
- **Pointed developers to real payloads.** The guide links to the event catalog and the built-in testing tool rather than repeating example payloads that could go out of date.

- **Wrote the Transactions and Supporters sections of the developer docs** to match the webhooks guide, so developers see the same objects described the same way in both places.
- **Took each section from interviews to publish.** I interviewed engineers and other subject-matter experts, drafted, collected their feedback, revised, and published.

## What I learned

Developer documentation earns trust in the troubleshooting section. Setup steps get someone started; explaining retries, duplicates, and ordering is what keeps their integration running.
