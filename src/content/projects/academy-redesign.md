---
title: "Designing an Academy people finish"
summary: "I reorganized the GoFundMe Pro Academy around customer tasks, kept courses and videos short, and changed how we measured success. Short courses now finish about twice as often as long ones, and task videos hold viewers for half or more of their runtime."
tags: ["Curriculum Design", "Information Architecture", "Video Production", "Learning Measurement"]
role: "Senior Content Designer — Academy editor, publisher, and video producer"
platform: "Skilljar, Wistia, Figma"
timeline: "2026"
order: 5
featured: true
results:
  - value: "~2x"
    label: "completion for 2–3 lesson courses vs. 7+ lessons"
  - value: "50–80%"
    label: "of each task how-to video watched, on average"
  - value: "+~33%"
    label: "Academy sessions in 2026 vs. the prior period"
links:
  - label: "Academy home"
    url: "https://proacademy.gofundme.com/"
    source: "Academy"
  - label: "Video library"
    url: "https://proacademy.gofundme.com/page/videos"
    source: "Academy"
  - label: "Campaign URL builder"
    url: "https://proacademy.gofundme.com/campaign-url-builder/2366815"
    source: "Academy"
  - label: "Saved templates video"
    url: "https://classy.wistia.com/s/s0y74y53iuc6mck"
    source: "Wistia"
---

<figure class="case-figure">
  <img src="/portfolio/images/academy-redesign/academy-home.webp" alt="Academy home page showing courses grouped by customer task: giving season, get started, donation forms, marketing, integrations, peer-to-peer, and events">
  <figcaption>Admins start from the job they need to do, not the product they'd have to know to look under.</figcaption>
</figure>

## My role

I run the Academy's front end, and I edited and published every course released in 2026, including those drafted by coaches. I was involved in scripting, filming, and editing every product video except the long live trainings.

## The problem

The Academy was organized by internal product area, so nonprofits had to know which product to look under before they could find help. Courses ran long, and success was measured by enrollments — a number that, it turned out, missed much of the Academy's real use.

## What I did

- **Reorganized the Academy around customer tasks:** a use-case-first home page, a filterable library, and reusable components I built myself, without engineering help.
- **Kept learning short and task-sized.** For giving season, I shipped five courses before the busy window, plus a campaign URL builder with print-ready QR codes that became the Academy's third most-visited page in 2026.
- **Made video a system, not a solo act:** short, task-first how-tos, recording guidelines so the Care team can contribute footage, and the library mapped to the SEO team's target keywords for a YouTube launch.
- **Audited the data and changed how we read it.** Open-access courses don't create enrollments, so I combined LMS data with page views to see real use.

### Inside one course

*Track where your donations come from* teaches admins to tag campaign links with UTM parameters and trace each donation back to where it came from. It was written for the feature's August 2026 release, and I oversaw it from intake through review.

**Start from what learners will do.** The outline set four measurable outcomes before any drafting. Learners will be able to:

1. Match each UTM parameter to the question it answers, and name the three to start with.
2. Build a tagged link with the URL builder, following naming rules they can reuse.
3. Add the UTM columns to their Transaction History report and trace a donation to its source.
4. Name the two reasons a UTM column can be blank, and use the Referrer column instead.

**Check the plan before writing it.** A rigor check between outline and draft caught three problems while they were still cheap to fix:

- A product claim sourced to a marketing blog instead of the product
- Examples that used dropdown values nobody had confirmed exist
- The report's name, written four different ways

**Cut to the size of the task.** The first draft had three lessons and about 3,100 words. The task itself is one sitting: expand a section, pick a source, fill in three fields, and copy the link. We cut it to a single lesson of about 1,400 words.

**Decide the words before the learner meets them.** "Campaign" means two things here: the fundraising page an organization builds, and the marketing effort that `utm_campaign` names. The lesson keeps "campaign" for the page and says "appeal" for the effort, with a callout where the two meet.

**Measure in the product.** Our Academy doesn't run quizzes. We judge courses by whether admins complete the task in the product afterward, because that's the outcome the business needs.

### Inside one video

My newest how-to, on saved templates and linked campaigns, shows the process. The presenter's script ran about seven minutes. Instead of asking her to re-record, I built a paper edit from lines she had already recorded, planned 29 screen shots across three sessions, and cut it to 3:40.

<figure class="case-figure">
  <img src="/portfolio/images/academy-redesign/video-process.svg" alt="Process strip: a 7-minute script, proposed trims, a paper edit with no re-record, a 29-shot list, and a 3:40 final cut">
  <figcaption>A paper edit built from lines already recorded avoided a re-shoot and cut the runtime about in half.</figcaption>
</figure>

<figure class="case-figure">
  <video src="/portfolio/videos/academy-redesign/saved-templates-hook.mp4" poster="/portfolio/videos/academy-redesign/poster-hook.webp" autoplay muted loop playsinline aria-label="Opening of the saved templates video: the presenter introduces saved templates, a change is made to the template, and it syncs to every linked campaign"></video>
  <figcaption>The first 15 seconds of the finished 3:40 how-to. <a href="https://classy.wistia.com/s/s0y74y53iuc6mck" target="_blank" rel="noopener">Watch the full video</a>.</figcaption>
</figure>

<!-- Screen-only alternative (no presenter on camera): swap the src and poster above for
/portfolio/videos/academy-redesign/saved-templates-screen-only.mp4 and
/portfolio/videos/academy-redesign/poster-screen.webp -->

## Results

| Evidence | What it shows |
| --- | --- |
| Courses with 2–3 lessons complete at about 56%; 7+ lessons at about 28% | Short courses finish about twice as often |
| A summer 2026 series of short Live Events courses completes at about 63–100% | The short format works in practice |
| Task how-to videos are watched about 50–80% through on average; the best match Wistia's instructional-video benchmark (about 74%) | Task-first video holds attention |
| How-tos made since spring trend higher than earlier ones | The craft improved over the year |
| Twelve open-access courses drew about 12K views but almost no enrollments | Our old metric was hiding real use |

<figure class="case-figure">
  <img src="/portfolio/images/academy-redesign/academy-completion-by-length.svg" alt="Bar chart: completion by course length, highest for 2 to 3 lesson courses at about 56%">
  <figcaption>Completion drops as courses get longer, which is why new courses are cut to the size of the task.</figcaption>
</figure>

<figure class="case-figure">
  <img src="/portfolio/images/academy-redesign/academy-video-watch.svg" alt="Typical share watched by video type: task how-tos 50 to 80%, feature announcements 25 to 35%, webinar recordings 10 to 15%">
  <figcaption>Task how-tos hold viewers best; feature announcements have the most room to grow.</figcaption>
</figure>

Short courses are newer and smaller, so the comparison is directional. Feature-announcement videos are a newer format we're still developing, at about 25–35% watched — the clearest room to grow.

## What I learned

The best learning experience is usually the smallest one that gets someone through their task. And the right metric is the one that can see all of your learners.
