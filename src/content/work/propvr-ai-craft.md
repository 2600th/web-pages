---
title: PropVR AI → Craft
slug: propvr-ai-craft
summary: I built the initial 22-tool AI MVP across five workflow studios. PropVR’s team used that product and technical foundation to develop Craft, a public creative platform for AEC workflows.
yearStart: 2026
status: Initial MVP delivered to PropVR’s team
role: Product architecture, interaction model, technical foundation and initial implementation
disciplines: [Generative AI products, Product architecture, AEC workflows]
visibility: approval-enhanced
featuredOrder: 3
recordType: narrative
era: operator
domains: [design-tech, applied-ai]
careerOrder: 162
relationships: [blocks, designesto]
relatedWork: [blocks, designesto]
evidenceStatus: approval-enhanced
publicClaims:
  - I built the initial internal PropVR AI MVP and handed the product and technical foundation to PropVR’s team to extend.
  - The current Craft platform is the work of the PropVR Technology team.
engagementPath: product-collaboration
heroMedia:
  src: /media/work/propvr-ai-craft/craft-public-home-20260902.webp
  label: Craft, accessed September 2026. Public homepage capture. Current platform by the PropVR Technology team, not the initial MVP.
  alt: Craft public homepage presenting its AEC creative workflow and a waterfront development shown as massing and a finished render
  width: 1600
  height: 1000
sources:
  - label: Visit Craft (external site)
    url: https://craft.propvr.ai/
    type: live-demo
seo:
  title: PropVR AI → Craft | 2600th
  description: How an initial 22-tool AI MVP across five AEC workflow studios established a product foundation that PropVR’s team evolved into Craft.
  socialImage: /media/social/propvr-ai-craft.webp
---

## The problem

Architects, interior designers, developers and property marketers were already using AI, but the workflow was fragmented. A general prompt box could produce a useful image. It could not guide someone through concept development, material edits, staging, panoramic media, animation and delivery on its own.

The product question was not which model to expose. It was how AI should fit the way AEC teams already move work through a project.

## The foundation

I built an internal MVP with **22 specialist tools organised across five workflow studios**. Each tool owned a clear job, input contract and output. The product routed tasks to suitable models rather than treating one model as the whole product.

The initial stack used Next.js 15, Tailwind CSS 4, AI SDK integrations, fal.ai, OpenAI and Gemini-family image and vision models. Production persistence, real billing and account infrastructure were deliberately outside the MVP scope. State was client-side. The job was to establish the workflow structure, tool boundaries, model routing and user experience for a team to extend.

## Why specialist tools came first

A blank prompt box gives the model freedom and leaves the user responsible for the rest. Many professional tasks need constrained inputs, useful defaults, predictable output formats and a clear next action.

The studio structure made the lifecycle visible. A user could choose a stage, run a focused capability, inspect the result and carry it forward. The design intent was to make prompt construction an implementation detail rather than a prerequisite for using the product.

## The trade-offs

| Choice | What it made possible | What it did not solve |
|---|---|---|
| Specialist tools | Clearer input and output contracts for each task | End-to-end coordination across a whole project |
| Model routing | Choose a capability suited to the job | A guarantee that every generated result is correct |
| Client-side state | A small, quickly extensible MVP scope | Durable projects, production accounts or real billing |
| Five workflow studios | A recognisable way into the tool set | Proof of production adoption or measured business impact |

## The handoff

The MVP was handed to PropVR’s team as a foundation to extend. My contribution was the initial product system and implementation. The wider team developed, productionized and expanded that foundation into the current platform.

**Initial PropVR AI MVP: Pranshul Chandhok. Current Craft platform: PropVR Technology team.**

## The product lesson

> A model can generate an output. A product has to decide what the output means, what must remain fixed, who approves it, and what happens next.

The MVP established a way to arrange specialist capabilities around AEC work. Its central lesson was to define the task, the input contract and the next decision before choosing the model.
