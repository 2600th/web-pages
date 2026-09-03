---
title: AI-native game development, three years later
slug: ai-native-game-development-three-years-later
type: essay
relatedWork: [ai-native-game-thesis, kinema, safed-sagar, web-ocean-3d]
ogImage: /media/social/ai-native-game-development-three-years-later.webp
summary: Three years after my first AI-and-games essay, the biggest change is not what models can generate. It is how much control a developer can keep through revision, integration and runtime behaviour.
publishedAt: 2026-09-03
updatedAt: 2026-09-03
topics:
  - Game development
  - Applied AI
  - Editing and runtime systems
canonicalUrl: https://www.2600th.com/notes/ai-native-game-development-three-years-later/
sourceAttribution: A new September 2026 reassessment of my March 2023 essay, informed by my browser projects and the primary sources linked throughout.
draft: false
---

Ask a model for a room, then ask it to move one door. The second request is the more useful test. Did the furniture stay put? Does the doorway still connect to the corridor? Can the player walk through it? Can I undo the change?

That is where my interest in AI-assisted game development has settled. My browser projects have made it easier to try ambitious things, but they have also made the unfinished work harder to ignore. An editor needs dependable changes. A flight needs understandable controls. An ocean has to load on someone else's machine.

The research has moved too. Generated environments can respond to input, and models can preserve some edits across a sequence. AI teammates have reached public game betas. Those are substantial developments. They still leave a developer responsible for what the game accepts, remembers and does when something fails.

## What I argued in March 2023

My [original essay, published on 21 March 2023](https://2600th.substack.com/p/revolutionizing-realms-how-ai-is), grouped language-model dialogue, generated assets, NeRFs, animation, editor assistance and adaptive music into an optimistic account of game development. I was interested in how much more a small team might attempt.

Some distinctions were too loose. In the music section, I treated procedural sound as an example of generative AI. [Hello Games' account of the No Man's Sky soundtrack](https://www.nomanssky.com/2016/04/no-mans-sky-music-for-an-infinite-universe/) describes procedural sound and credits 65daysofstatic. That does not establish learned generation of the kind I was discussing elsewhere.

I also moved too easily between scene capture and playable geometry. The [original NeRF research](https://arxiv.org/abs/2003.08934) represents a scene for novel-view synthesis. A convincing rendered view does not by itself supply collision rules, editable objects or gameplay meaning. My own caption identified the accompanying video as photogrammetry; the surrounding argument should have been equally careful.

The 2023 article stays where it was published. It records my thinking then, including those loose connections. This is a new assessment, not a corrected copy wearing its old date.

## A three-year scorecard

These are my judgments about the argument, not benchmark results. The sources establish narrower capabilities than a claim that AI has solved game production.

<table>
  <caption>My September 2026 assessment of the 2023 thesis</caption>
  <colgroup><col style="width:24%" /><col /></colgroup>
  <thead><tr><th scope="col">Verdict</th><th scope="col">What I would say now</th></tr></thead>
  <tbody>
    <tr><th scope="row">Held up</th><td>Assistance belongs inside the tools people use. Roblox's <a href="https://devforum.roblox.com/t/code-assist-beta-ai-powered-code-completion/2224387">20 March 2023 Code Assist beta</a> already put code suggestions in Studio. That was an existing direction, not a prediction I can claim as a later success.</td></tr>
    <tr><th scope="row">Partly right</th><td>Generated worlds and responsive characters became more concrete. Genie and the PUBG Ally beta below demonstrate parts of that direction. They do not establish a reliable, economical pipeline for a complete game.</td></tr>
    <tr><th scope="row">Too early</th><td>I placed too much weight on reduced effort and richer experiences. A good sample does not measure integration cost or player engagement. My own experiments do not provide a controlled productivity comparison either.</td></tr>
    <tr><th scope="row">What I missed</th><td>I gave revision, provenance and the people maintaining the result too little attention. The Steam rules and copyright guidance discussed below make some of those obligations explicit. The importance I assign them is my judgment.</td></tr>
  </tbody>
</table>

## Generation improved; the production questions stayed

A generated prop must eventually become something the project can identify. It needs units, materials, an origin, a place in the asset library and a decision about collision. If it changes, somebody needs to know which scenes depend on it. None of that disappears because its first appearance arrived quickly.

My first two constraints are revision and state. Revision means changing the requested element without casually replacing everything around it. State means deciding which facts are authoritative: this object has this identity, this door is locked, this character has already learned something. Visual similarity is not enough to establish any of those facts.

I would separate a proposed change from an accepted one. A generator could suggest a new doorway; the editor would show the difference, check constraints and let the developer accept or discard it. Until acceptance, the saved level should remain unchanged. This is the interaction I would test, not a feature I am claiming to have completed in all my projects.

Integration is the third constraint. An output needs to survive import, version control, a clean build and another person's checkout. If a generated script works only beside an unrecorded local dependency, it is not ready to share. If a texture looks correct only with the wrong colour-space setting, approving the screenshot has hidden a defect.

Coding assistance changed more than autocomplete. Current coding agents can [inspect a repository, edit several files, run tests and work through failures](https://www.anthropic.com/news/claude-3-7-sonnet). That makes integration part of the generation loop instead of something that always happens afterwards. It also increases the cost of weak verification. A plausible change can affect controls, rendering, asset loading and build configuration at the same time.

My useful measure is not how much code an agent produced. It is whether the change survived the project’s tests, another machine and the next revision. That is the same second-edit test applied to software rather than an image.

These requirements suggest a different way to assess an AI tool. Start with a working scene, ask for a bounded edit, then inspect both what changed and what should not have changed. Measure the repair work as well as the generation. The attractive first sample remains useful; it just cannot answer the whole question.

## World models are a research path, not a general engine replacement

DeepMind's [5 August 2025 Genie 3 announcement](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) reported interactive generated environments at 720p and 24 frames per second, with consistency over a few minutes. It launched as a limited research preview. That is a meaningful step beyond watching a fixed video.

Access subsequently broadened through Project Genie. Google’s [January 2026 recap](https://blog.google/innovation-and-ai/products/google-ai-updates-january-2026/) described access for adult US Google AI Ultra subscribers. On [19 May 2026](https://deepmind.google/blog/simulate-real-world-places-with-project-genie-and-street-view/), Google said Project Genie was gradually rolling out to eligible adult Google AI Ultra subscribers globally, while remaining an experimental research prototype. The [model page checked on 3 September](https://deepmind.google/models/genie/) still lists limited action space and interaction duration.

Microsoft's [February 2025 Muse research](https://www.microsoft.com/en-us/research/blog/introducing-muse-our-first-generative-ai-model-designed-for-gameplay-ideation/) approached gameplay ideation through a model trained on Bleeding Edge. The published work used 300×180 visuals and explored generated images and controller actions. Open weights and a concept demonstrator made the research available for experimentation.

The [WHAM publication](https://www.microsoft.com/en-us/research/publication/world-and-human-action-models-towards-gameplay-ideation/) is especially relevant to revision: it evaluates consistency, diversity and persistence of user modifications. Preserving an inserted element across generated frames is useful progress. It is not the same contract as saving a scene object and recovering it exactly after reopening a project.

I would not rank these systems by resolution alone. They address different research settings. Nor do these results show that either can replace Unity, Unreal or a browser engine's entire production workflow. A generated world might help explore a situation before a team commits to it. That can be valuable without pretending the exploration already includes source assets, deterministic rules, build tooling and a supportable release.

## AI characters became executable systems

The [PUBG Ally announcement from June 2026](https://www.nvidia.com/en-us/geforce/news/pubg-ally-ai-teammate-beta-available-now/) describes a limited-time player beta, not just a conversation demo. NVIDIA says a traditional behaviour tree handles immediate tactical actions while ACE models support the cognitive layer. The described setup runs locally on RTX GPUs with at least 8 GB of VRAM. I am citing that June beta, not asserting it remains available in September.

That division is more instructive than a fluent reply. Perception must provide usable facts; planning must choose allowed actions; the game must execute them at the right time. [KRAFTON's patch notes](https://www.pubg.com/en/news/10179?category=patch_notes) also document practical limits, including stale game knowledge and no reconnection support in that mode. Those are part of the feature, not details to omit from its description.

Runtime economics and safety are my fourth constraint. Local inference shares memory and compute with rendering. Hosted inference adds network delay, service failure and an ongoing cost. Neither route wins by definition. I would measure response delay during demanding play, the effect on frame time, and the cost of a completed session before choosing one.

The fallback matters just as much. If a model is late, the character still needs a safe next action. If it suggests something impossible, deterministic game rules should reject it. The developer needs to decide which facts the model may read, which actions it may request and which decisions stay outside its authority.

Valve's [Steamworks Content Survey, checked on 3 September 2026](https://partner.steamgames.com/doc/gettingstarted/contentsurvey), distinguishes pre-generated AI content that ships with the game and is consumed by players from content generated while it runs. It does not require disclosure of every internal efficiency tool. Live generation adds a requirement to describe guardrails against illegal content. Disclosure is not a promise that the game will pass review. Runtime generation therefore changes both the technical system and the work needed to publish it.

## What my own builds changed for me

In [Kinema](/work/kinema/), I want level editing and play-testing to stay close together. The browser editor has transform tools, object inspection, undo and a route into play-testing. Its [public repository](https://github.com/2600th/Kinema) describes the gameplay and rendering systems. It remains an active experiment, not a finished AI game-development platform.

That editor gives me a concrete place to ask what an AI edit should mean. If I accept a change and then undo it, the project should return to the previous state. If I enter play mode, the level should behave like the one I was editing. A generated suggestion has to respect those expectations before it earns a place in the workflow.

[Safed Sagar](/work/safed-sagar/) tested a different part of the argument. AI-assisted development helped me get a browser flight experiment running quickly. I still had to shape the controls, make the reconnaissance task understandable and adjust graphics to the device. Sectors and range bands guide the search; the player has to look for the target rather than follow an exact marker.

Those are decisions about play, not just implementation tasks. A visually convincing mountain range does not tell a player what to do. The [repository](https://github.com/2600th/oss-web-3d) records controls, quality settings and testing. It is a fictional reconnaissance experience, not a military training system or an official reconstruction.

[Web Ocean](/notes/ocean-reliability/) made the gap between a scene and a release particularly visible. The demo looked right on my machine; sharing it exposed loading and resource problems. The recorded dressing-texture allocation fell from 762.3 to 79.9 MiB, while download weight rose from 33.7 to 40.7 MiB. The [pinned performance record](https://github.com/2600th/web-ocean-3d/blob/6496c77/docs/PERFORMANCE.md) treats those as different budgets, not a single measure of speed.

The compressed version also exposed a bad visual baseline. Passing a comparison against an already-wrong image did not prove the materials were correct. That lesson applies directly to generated work: approving a result makes it a reference, but does not make it right.

These projects support a modest claim. AI helped me attempt and iterate on the work; direct engineering, judgment and testing remained necessary. I do not have a controlled comparison of hours saved. I also cannot infer that a particular asset was generated merely because its project used AI-assisted development.

## Authorship belongs in the production record

My fifth constraint is provenance: where material came from, what permission covers it and what the team changed. A prompt history alone is a poor production record. I would retain the source reference, tool and version, permission basis, accepted output and subsequent human edits alongside an asset's identity.

The [US Copyright Office's January 2025 Part 2 report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf) distinguishes human expression from purely generated material. It recognises that human selection, arrangement or modification may be protectable, with authorship assessed case by case. Its analysis does not treat prompts alone as sufficient control over then-current systems. This is a US publishing consideration, not legal advice or a rule for every jurisdiction.

Team acceptance needs attention too. [GDC's 2026 survey summary](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/) reports that 36% of surveyed industry professionals used generative AI at work, while 52% considered its industry impact negative. Those totals do not show whether the same respondents belonged to both groups, and they are not universal sentiment or proof of a causal effect. Separately, I would not treat a team's use of a tool as agreement about every way it is deployed.

I would want a team to agree on acceptable sources, review responsibilities and disclosure before generated material accumulates. Otherwise the release inherits questions that nobody can answer confidently.

## The updated thesis

For me, AI-native game development should mean a workflow in which generated outputs remain revisable, inspectable and connected to deterministic game systems. It should be possible to point at a change, understand its consequences, reject it and keep working.

That definition leaves room for generation at different stages. A concept image may never ship. An accepted asset may become ordinary project data. A runtime character may propose actions within a fixed set of permissions. The useful boundary depends on what the player and developer need to trust.

It also changes what I would show in a demonstration. Alongside the first result, I would show the requested revision, the checks it triggered and the return to a known state. If those steps remain cumbersome, the production problem is still open even when the sample looks excellent.

## What I would test next

I would start with one room and one objective, not a generated game. Keep the exit reachable, the objective identifiable and the saved state recoverable. Then test:

- **A local edit:** move one doorway while preserving object identities, collision constraints and the rest of the room.
- **A reversible generation:** accept the edit, undo it, reopen the project and compare the resulting state with the saved version.
- **A constrained character:** allow only a small set of game actions; inject invalid plans and delayed responses to inspect the fallback.
- **A runtime budget:** compare local and hosted inference under the same play conditions, recording latency, frame-time impact and session cost.
- **A traceable asset:** follow one generated output through permission review, human revision, import and the final build.

These are proposed experiments, not completed results. They would tell me more than another broad forecast. I still want to see what a model can make. I want the second edit, and the game that has to live with it, to receive just as much attention.
