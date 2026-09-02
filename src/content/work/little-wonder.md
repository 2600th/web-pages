---
title: Little Wonder
slug: little-wonder
summary: I built Little Wonder to help a child turn ideas and drawings into an illustrated storybook, with a cover and a printable PDF.
yearStart: 2025
yearEnd: 2026
status: Public personal product
role: Creator and engineer
disciplines:
  - Generative AI
  - Product design
  - Creative tools
  - Family technology
visibility: public
featuredOrder: 0
recordType: evidence-note
era: operator
domains: [applied-ai, games]
careerOrder: 190
relationships: [blocks-inco-ai, kinema]
evidenceStatus: public-approved
publicClaims:
  - The public product, authored launch post, and authored technical article support this description.
engagementPath: product-collaboration
storyLabel: PERSONAL PRODUCT
storyHeading: Make the child the hero, not the prompt engineer.
heroLabel: Live first-party product
heroMedia:
  src: /media/generated/editorial/enhanced/little-wonder-hero-v2.webp
  avif: /media/generated/editorial/enhanced/little-wonder-hero-v2.avif
  label: Little Wonder · A storybook workspace for a child’s ideas and drawings.
  alt: Little Wonder storybook generator landing screen with a child character and floating creative tools
  width: 1600
  height: 900
sources:
  - label: Live Little Wonder product
    url: https://little-wonder.vercel.app/
    type: live-demo
  - label: Product launch post
    url: https://www.linkedin.com/posts/pranshulchandhok_googlegemini-gemini3-generativeai-activity-7406279362842607616-h8wK
    type: authored-post
  - label: Build article on DEV Community
    url: https://dev.to/2600th/little-wonder-is-an-ai-powered-kids-storybook-generator-5530
    type: authored-post
seo:
  title: Little Wonder — AI storybook generator by Pranshul Chandhok
  description: Little Wonder is Pranshul Chandhok’s playful AI product for turning a child’s ideas and drawings into a personal illustrated storybook.
  socialImage: /media/work/little-wonder/hero.webp
---

I built Little Wonder around a child’s wish to make stories. It turns classic public-domain tales into personalised illustrated books with the child as the hero. The book includes a custom cover and comic-style pages, and can be downloaded as a print-ready PDF from the browser.

I wanted the choices to feel familiar to a child. Behind those choices, the software has to coordinate the text and illustrations while keeping the character recognisable from page to page. That consistency is a much more useful test than the quality of any single image.

## The workflow behind the book

The visible interaction is deliberately small. A child chooses a story direction and supplies the details that make the book theirs. The application then has to coordinate several stages without turning the child into a prompt engineer.

<figure class="stage-flow" aria-label="Storybook production stages">
  <ol>
    <li>Story choice and child details</li>
    <li>Page-level story structure</li>
    <li>Character and scene illustrations</li>
    <li>Consistency review across pages</li>
    <li>Cover, layout, and printable PDF</li>
  </ol>
  <figcaption>The book workflow, from a story choice to a printable sequence.</figcaption>
</figure>

Each stage has a different failure mode. A coherent story can still produce a different-looking hero on every page. Good illustrations can still fail when text and image compete in the layout. A browser preview can look correct while a printable PDF clips content or changes pagination.

## The hard part was continuity

The test was not whether the system could generate one attractive image. The child needed to recognise themselves as the same hero throughout the book. That meant carrying identity, clothing, visual style, and page context across several independent generations.

I treated the book as a sequence rather than a gallery. Every page had to contribute to the same story, and the cover and PDF needed to feel like the output of that sequence rather than separate exports.

## Keeping the interface child-sized

The application hides most generation detail. The useful choices are story choices: who the hero is, what kind of adventure they want, and which drawings or ideas they want to include. Model settings and production stages belong behind the interaction unless something needs the parent’s attention.

That constraint made Little Wonder a useful product exercise. The system does several technical things, but the person using it should feel that they are making a book.
