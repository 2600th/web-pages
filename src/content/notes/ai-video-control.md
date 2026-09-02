---
title: AI video got good. Directing a sequence is still hard.
slug: ai-video-control
type: technical-teardown
relatedWork: [safed-sagar]
ogImage: /media/social/ai-video-control.webp
summary: A thirty-second experiment, two saved local H3 control graphs, and a proposed six-beat sequence show why shot quality and editorial continuity are different problems.
publishedAt: 2026-08-24
updatedAt: 2026-09-03
topics:
  - AI video
  - Creative direction
  - Local generation
canonicalUrl: https://x.com/2600th/status/2091937799310393656
sourceAttribution: Adapted from my original post, with further notes from the experiment.
draft: false
---

I made a thirty-second science-fiction fight with MiniMax H3 running locally on an RTX 5090 and Seedance 2.5. The original post describes the experiment, without a benchmark or a repeatable success rate.

This is a production reflection rather than a benchmark. I did not preserve a shot-by-shot log linking every final moment to one model or setting. The saved H3 graphs described below show the local workflow structure, while the six-beat example is the method I would use for the next sequence.

The result was imperfect. I could see where continuity slipped, but I could also steer more of the sequence than I had expected. The interesting improvement was not simply a more convincing isolated frame. It was the possibility of carrying enough intent into a shot to make editing feel like a series of decisions.

Separate shots still had to feel like the same fight. A character can remain recognisable while their wardrobe changes. A movement can look convincing while placing them on the wrong side of the space. A beautiful camera move can make the next cut harder to understand. Those are sequence problems, not defects that a higher-resolution frame automatically repairs.

## What the saved local graphs actually establish

I now have two separate saved ComfyUI graphs for local H3 work: a reference-to-video route and a first/last-frame route. Keeping those contracts separate is useful because a reference describes what should be recognisable, while a boundary frame constrains a particular moment.

The reference graph contains image loading, `MiniMaxH3ReferenceToVideo`, sampling and scheduling, video and audio decoding, a super-resolution stage, and video assembly and saving. The paired graph uses `MiniMaxH3ImageToVideo` with image scaling and first/last-frame inputs before the shared output stages.

This is a simplified view of the saved graph structure:

```text
Reference images                 First / last frames
        ↓                                ↓
Reference-to-video control        Image-to-video control
        └──────────────┬─────────────────┘
                 Sample / schedule
                        ↓
             Decode image and audio
                        ↓
             Upscale / assemble / save
```

Inspecting nodes and wiring verifies that those stages exist in a saved workflow. It does **not** verify a successful render, adherence to the first and last frame, temporal quality or throughput. These saved graphs postdate the original post.

My public [ComfyUI Workflows repository](https://github.com/2600th/ComfyUI-Workflows) currently provides a Qwen example. It is not a download of these local H3 graphs, and it will not reproduce this sequence. I am keeping the local source references and generation prompts out of this article.

## The graph ends before the directing problem does

The generator needs inputs. The sequence needs a plan. Before I ask for a shot, I want to know what the viewer learns, where the subject begins and ends, and what must survive the cut. Those decisions become a continuity contract that I can inspect after generation.

For a new sequence, I would put character references and a shot plan before the local graph, reserve hosted passes for a specific unresolved shot, then edit and review the assembled sequence before delivery.

| Choice | Why I would use it | What I still need to inspect |
|---|---|---|
| Reference-led generation | Carry an identity or visual direction into a shot | Wardrobe, silhouette and unwanted reference details |
| First/last-frame control | Specify the intended boundary states | Whether the motion between them is coherent |
| A selective hosted pass | Try another route for one unresolved shot | Compatibility with neighbouring shots, not just standalone quality |
| Editing | Decide timing, cut points and what to discard | Spatial logic and motion across the actual cuts |
| Upscaling | Prepare a chosen output for delivery | Whether it preserves defects rather than fixing them |

Local generation gives me a saved graph I can inspect and revise. A hosted route offers another creative option. I am not claiming a measured quality, speed or cost advantage for either from this experiment. The right comparison is the specific shot and the decision it needs to carry.

## A proposed six-beat example

This is a newly authored shot plan for a **12-second original sequence**, not six shots I have rendered. A courier in a plain ochre jacket crosses an empty service corridor, notices a loose object, catches it and exits. No film or comic character reference is needed.

The time allocations are editorial targets, not measured generation durations. The failure column names checks I would perform, not failures observed in completed outputs.

| Beat / target | Input and action | Continuity check |
|---|---|---|
| 1 / 0–2 s | Clean wide-frame reference: courier enters from screen left | Establish the door, jacket and direction of travel |
| 2 / 2–4 s | Medium view on the same side of the action axis | Keep travel left-to-right and preserve the doorway position |
| 3 / 4–5.5 s | Close view of a small metal object beginning to fall | Object shape and fall direction must support the next shot |
| 4 / 5.5–8 s | Boundary frames for the reach and the completed catch | Inspect hand contact, object identity and the motion seam |
| 5 / 8–10 s | Medium reaction after the catch | Do not reset the hand, object or jacket between cuts |
| 6 / 10–12 s | Wide exit that returns to the established corridor | Finish the same action in the same space |

I would first assemble rough outputs at those cut points. If beat four fails, it should not force a redesign of the whole corridor. That is the practical reason for separating shot intent, references and editorial decisions: I want to revise the smallest useful unit without losing everything I already chose.

## Keep instruction separate from picture content

A storyboard page can contain useful annotations for a human and harmful ambiguity for a model. Arrows, panel borders and shot labels may be interpreted as visual content. I treat that as a risk to test, not a failure I can claim to have measured here.

For this proposed sequence, I would keep a clean reference image separate from the written camera and action instructions. I would also keep prompts focused on the current shot. Adding every idea for the entire film can make it harder to see which instruction caused a change. No universal prompt-length threshold follows from this experiment.

The same discipline applies to first/last-frame inputs. A final frame that contradicts the initial geography asks the model to invent the missing explanation. I would inspect the pair before generation, then inspect the transition afterward. A graph accepting both images is only the start of that test.

## My checklist for a short coherent sequence

- Establish the subject, wardrobe and spatial axis before close-ups.
- Give each shot one action and a clear relationship to the next cut.
- Use clean references and keep arrows and labels in the planning document.
- Review contact points and object identity where action crosses a cut.
- Watch the rough edit at its intended speed, not only individual clips on loop.
- Reject a spectacular shot when it breaks the sequence’s geography.
- Check sound, timing and delivery separately from the image-generation graph.

What I want from these tools is the ability to return to a particular moment and change it without starting the sequence again. More control makes that possible. Directing still means deciding what should remain fixed, what may change and whether the cut communicates the action I intended.
