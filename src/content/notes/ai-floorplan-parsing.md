---
title: The hard part of AI floorplan parsing isn’t the model
slug: ai-floorplan-parsing
type: technical-teardown
summary: "A source-grounded look at a floorplan pipeline: where structured output helps, how file-based resume can fail, and which validation mechanisms still belong in the next version."
publishedAt: 2026-09-02
updatedAt: 2026-09-03
topics: [Applied AI, Spatial systems, Pipeline reliability]
relatedWork: [blocks]
ogImage: /media/social/ai-floorplan-parsing.webp
sourceAttribution: Original architecture note based on implementation review. Private prompts, customer inputs and business schemas are intentionally omitted.
draft: false
---

Extracting a plausible room list from a floorplan is easy to demo. Producing structured geometry that can be resumed, validated, costed and trusted downstream is the actual system problem.

The floorplan pipeline I have worked with has staged processing, structured model responses, bounded retries and resumable files. Its next-version plan goes further, with hash-addressed outputs, spend limits and repeatable geometry evaluation. The useful engineering question is what each mechanism would let the next stage trust.

This is an architecture review, not an accuracy benchmark. I did not run new model requests or measure latency, cost or geometry accuracy for this article. I am describing mechanisms visible in the implementation without publishing customer drawings, prompts or proprietary field definitions.

## A drawing is not a clean scene description

A floorplan mixes geometry with symbols, dimensions and text. A number near a wall may describe one segment, a total span or something outside the room being examined. Door arcs cross useful boundaries. Furniture marks can look like room partitions. A faint line may matter more than a visually prominent annotation.

The model can return a confident interpretation even when the input does not determine a unique answer. I therefore separate three questions. Did the response parse? Does it satisfy the expected shape? Is the interpretation supported by the drawing? The first two are necessary for software integration. Neither answers the third.

That distinction matters for a system such as Blocks, where geometry eventually constrains catalogue choices and production information. A valid JSON object is not permission to use a guessed dimension as a manufacturing fact. I am connecting the product problem here, not describing an integration with Blocks.

## The implemented stage dependency

Processing begins with an isometric image stage, then proceeds through analysis, room detection and overlays, with optional room renders. Critical stage failures stop the relevant path. Failures in individual room work are accumulated so the result can retain partial progress and errors.

The following is a simplified dependency diagram, not a reproduction of the private workflow or its field schema:

<figure class="stage-flow" data-stage-flow aria-label="Floorplan processing stage dependency">
  <ol>
    <li>Floorplan input</li>
    <li>Isometric image stage</li>
    <li>Structured analysis</li>
    <li>Room detection</li>
    <li>Overlays for inspection</li>
    <li>Optional room renders</li>
    <li>Results and recorded errors</li>
  </ol>
  <figcaption>Simplified stage dependency. It omits private prompts, customer inputs, and proprietary field definitions.</figcaption>
</figure>

The order is consequential. An attractive generated image is not independent confirmation of the analysis that follows it. If an early stage changes the apparent geometry, downstream stages can reinforce that interpretation. For validation I would want the source drawing and intermediate artifacts available together, rather than showing the final image as though it were ground truth.

The implementation keeps result data, output paths and errors. That gives the caller something more useful than a single success flag. It also creates a responsibility: downstream consumers need to know whether an artifact is absent, incomplete, rejected or merely not requested. Those states should not collapse into one empty value.

## What exists, and what is still proposed

| Concern | Implemented | Proposed next |
|---|---|---|
| Response handling | Structured JSON response configuration, extraction and defensive normalisation | A versioned canonical result with explicit provenance and validation status |
| Recovery | Bounded retries for transient failures and one fallback model path | A scheduler that adapts concurrency to observed pressure |
| Batch entry | Sorted folder inputs processed sequentially | Spreadsheet-driven intake with row-level reconciliation |
| Resume | Existing output files reused, unreadable cached JSON regenerated | Source and configuration fingerprints with a durable completion log |
| Evaluation | Artifact and workflow checks, with overlays available to inspect | A repeatable golden-set geometry evaluation |
| Spend control | No strict run-level cost ceiling established in this review | Per-stage telemetry and an enforced budget ceiling |

These distinctions change how I would operate the pipeline. Retrying a rate-limited request does not establish adaptive batch concurrency. Finding a JSON file does not establish that it belongs to the current source. A workflow that passes a graph-shape check has not passed a spatial-accuracy test.

## Retry helps availability, not interpretation

The retry loop handles retryable timeouts, rate limits and server failures with bounded exponential delays and jitter. There is a fallback model route. Those mechanisms can recover an interrupted attempt. They cannot make an ambiguous wall length correct.

I would keep interpretation failures out of a blind retry loop. If the problem is an unreadable annotation or an unresolved boundary, another identical request may spend more without resolving the ambiguity. A useful result would identify what needs human review and preserve the questionable region.

The later concurrency proposal should be judged separately. I would want to test how it responds to rate limits, how much work remains in flight after a budget stop, and whether a partial failure is reported against the correct input. The current folder runner is sequential. There is no reason to describe it as an adaptive scheduler.

## Resume needs identity, not just a file

The implemented resume path reuses outputs when files exist. It reloads cached JSON and regenerates it if it cannot be read. That is helpful after an interruption, but it leaves a quieter failure mode: a readable file can be stale.

Suppose I replace the source drawing while keeping its project location, or change the processing configuration. The old output can still look complete. Without binding that output to the source and configuration, existence alone cannot justify reuse. The existing hash mechanism supplies a seed, not a resume fingerprint.

This is the conceptual contract I would want next. It is illustrative pseudocode, not copied production code or a claim of completed behaviour:

```text
identity = fingerprint(source + relevant configuration)
if completed artifact matches identity and validates:
    reuse artifact
else:
    process the required stage
    validate and record its outcome
```

A durable completion record would still need careful semantics. “The request finished” and “the output passed validation” are different events. A cancelled stage should not inherit a success marker just because an earlier file exists. I would design the log around those distinctions before using it to skip expensive work.

## Validating the right thing

There are several useful layers of checks. Parsing can reject malformed responses. Normalisation can make dimensions consistent enough for callers to handle. Workflow validation can catch missing nodes or invalid graph structure before a generation request. Overlay inspection can help a person compare the inferred regions with the drawing.

Geometry evaluation needs a separate reference. Are rooms missing or duplicated? Are their boundaries plausible? Which dimensions came from explicit annotations, which were inferred, and which remain unknown? A single pass rate would conceal important differences between these failure classes.

For a proposed golden set, I would start by investigating a public annotated source such as [CubiCasa5k](https://github.com/CubiCasa/CubiCasa5k), checking its licence and annotations against the intended task. I would not treat a room-segmentation dataset as automatic ground truth for every dimension or production requirement. No CubiCasa evaluation has been run for this article.

The useful test set would include difficult drawings as well as tidy ones: small labels, conflicting dimensions, faint partitions and unusual room shapes. I would keep a held-out subset, record the exact processing configuration, and inspect regressions by failure category.

## Cost is another result the caller needs

A batch can be structurally valid and operationally unacceptable if retries or optional renders consume unbounded spend. Before calling the next version budget-governed, I would require per-stage usage records, explicit treatment of retries, and a stop policy that accounts for requests already in flight.

The same applies to elapsed time. A timer around a successful request does not explain a batch that waited, retried and resumed. The caller needs enough history to decide whether to continue, inspect or stop.

The hard part is preserving the difference between an interpretation and a fact as work moves forward. A useful pipeline makes uncertainty inspectable, keeps partial progress recoverable and gives downstream systems a reason to trust each artifact. Choosing the model is one decision inside that system, not the system itself.
