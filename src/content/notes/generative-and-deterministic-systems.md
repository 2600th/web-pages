---
title: The boundary between generative and deterministic systems
slug: generative-and-deterministic-systems
type: essay
summary: Designesto, Blocks and the PropVR AI foundation show three different places to draw the boundary between open-ended generation and decisions a product must preserve.
publishedAt: 2026-09-02
updatedAt: 2026-09-02
topics: [Product architecture, Applied AI, Design technology]
relatedWork: [designesto, blocks, propvr-ai-craft]
ogImage: /media/social/generative-and-deterministic-systems.webp
sourceAttribution: Original essay grounded in the linked project cases and their stated delivery boundaries.
draft: false
---

An image of a room can be compelling while leaving almost every important production question unanswered. What are the dimensions? Which materials are available? What did the client approve? What changes if the cabinet gets wider?

I work across products that encounter those questions at different points. Designesto develops visual exploration and revision. Blocks connects structured spatial and product decisions to operational work. The initial PropVR AI MVP organised specialist creative capabilities into a product foundation that PropVR’s team developed into Craft.

The tempting conclusion is that generative tools handle creativity and deterministic tools handle everything serious. I do not think that division is useful. Exploration is serious work, and structured systems still require judgment. The better question is: **which parts of the current decision should remain open, and which parts has the user already earned the right to keep?**

## Designesto: revision moves the boundary

At the beginning of a design conversation, openness is useful. A homeowner may not yet know how to describe an atmosphere. A designer may want to compare different directions before committing to one. Generated images can give that discussion something concrete to react to.

The second request is different. “Keep the layout, but change the material” is not another invitation to invent the entire room. It identifies one variable to explore and a set of decisions to preserve. If a system delivers a prettier room while moving the opening or replacing the furniture arrangement, it may have failed the task.

That is why Designesto’s product work is not just a collection of model inputs. Restyling a room, developing a sketch and communicating a proposal begin with different source information. The workflow needs to make the requested change legible, so the result can be judged against it.

I treat preservation as a requirement to design for, not a claim that any model follows every instruction perfectly. When a revision cannot reliably hold an important feature fixed, the interface should not conceal that uncertainty. The user needs to inspect the output and decide whether to accept it.

Designesto’s case covers concept exploration, revision and communication. Deeper costing and execution integration remain roadmap work unless separately confirmed. A generated panorama can communicate a direction. It cannot make that direction execution-ready merely by being immersive. Moving from a concept to a priced specification requires a different kind of information.

## Blocks: an attractive answer is not an allowed answer

In Blocks, a cabinet is not only something to render. Its dimensions affect whether it fits. Its configuration affects materials, hardware, price and the information needed for production. A visually small change can propagate through several operational decisions.

Here I prefer explicit, inspectable rules wherever the question has a definite answer. An allowed configuration should not depend on whether the model happens to find it plausible. A price should not be improvised from the appearance of a room. A missing dimension should remain missing until the system has a justified value.

That does not mean the visual interaction becomes secondary. The designer still needs to explore a space and understand the consequence of a change. The challenge is to connect the viewport to structured project information so that interaction and downstream handoffs refer to the same decision.

The published InCo AI integration introduced a path from exploration into Blocks for pricing and specifications. It does not establish that every later visual product inherits those capabilities. Keeping that distinction clear is important both technically and in how I describe the work.

My role is product and technology leadership alongside the teams building and delivering these systems. The point is not individual ownership of every rule. It is the shared architectural obligation to keep the visual design and its operational meaning from drifting apart.

## PropVR AI to Craft: the boundary around a tool

The initial internal PropVR AI MVP posed another version of the problem. Architects, designers and property marketers needed different creative operations, not one blank prompt box for every stage of work.

I built 22 specialist tools across five workflow studios. Each tool established a task, an input contract and an output. Routing to a suitable model was part of that system, but it was not the whole interaction. The user also needed to know what to provide, what they were asking to change and what to do with the result.

The scope boundary matters here too. The MVP used client-side state. Durable projects, production accounts and real billing were outside that implementation. The PropVR Technology team developed, productionized and expanded the foundation into the current Craft platform. I do not treat current platform capabilities as features I personally shipped in the MVP.

The lesson I carry forward is about the controls around generation. A professional creative workflow needs project context, a plan for the work and a clear moment of approval before an output acquires downstream authority. That is an architectural principle, not a claim that a particular approval engine existed in the initial build.

Once a result becomes a selected project artifact, the next operation should know that it is selected rather than merely the latest output. Otherwise a new generation can silently replace a decision that a person thought was settled. The model may be free to propose. The product should decide how a proposal becomes part of the project.

## Three different contracts

| Product context | Keep open | Keep explicit |
|---|---|---|
| Designesto | Visual direction and the requested revision | What the user intends to preserve and what is still a concept |
| Blocks | Design choices within the working system | Dimensions, catalogue constraints, pricing dependencies and production information |
| PropVR AI foundation | A specialist tool’s generated output | The task, input/output contract and limits of the MVP |

These are not interchangeable implementations. They are three places where the same product question appears. The boundary should follow the consequence of a decision, not the novelty of the model producing it.

There is also a cost to making the boundary too rigid too early. Requiring every construction detail before a first visual exploration can prevent someone from learning what they want. I want room for early exploration without passing its output downstream as if production certainty had already been earned.

## Approval is a state change

I find it useful to ask what changes when someone says “use this.” Does the system preserve the chosen artifact? Can the person compare it with a later revision? Is the approval attached to this version or to a filename that may be overwritten? Which subsequent operation is allowed to alter it?

Those questions are ordinary product architecture. Generative systems make them more visible because output can vary even when an input looks familiar. A history panel, an explicit selection or a clear handoff may matter more to completing the work than another impressive generation option.

I would apply the same reasoning to a floorplan interpretation or a video sequence. A parsed dimension needs validation against the drawing before it becomes a geometric constraint. A character reference needs inspection before it becomes a continuity anchor. In both cases, the system should preserve why the user trusted the artifact, not merely the artifact itself.

## The design task is to make the boundary visible

When I evaluate a new AI capability, I now ask where uncertainty is useful, what must stay fixed during revision, and who decides that an output is ready for the next stage. I also ask what happens when that decision turns out to be wrong.

Those questions prevent two mistakes. One is asking generation to invent facts a system should already know. The other is using rigid rules to close a search space before the user has had a chance to explore it.

The useful boundary moves during the workflow. Early on, I want possibilities. Later, I want commitments I can inspect, revise deliberately and carry forward. A good product lets a person move between those modes without losing track of what they chose or what remains uncertain.
