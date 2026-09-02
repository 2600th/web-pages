/** Public-site snapshot, not independently tested production capability. */
export const craft = {
  checkedAt: '2026-09-02',
  accessedLabel: 'September 2026',
  url: 'https://craft.propvr.ai/',
  tools: '30+',
  studios: ['Concept', 'Immersive', 'Refine'],
  directToolsStatus: 'Listed as available',
  earlyAccess: ['Agentic 1.0', 'Arc 1.0'],
  earlyAccessStatus: 'Early access',
  roadmap: ['Forge on-demand tool creation', 'Native AEC plugins'],
  roadmapStatus: 'Roadmap',
  statusNote: 'The homepage groups available tools under Concept, Immersive and Refine. The tools index lists six studios, so a single current studio count is not asserted here.',
  direction: 'Outcome planning and shared project context, with human approval before execution.',
  sources: [
    { label: 'Homepage availability FAQ', url: 'https://craft.propvr.ai/' },
    { label: 'Tools index', url: 'https://craft.propvr.ai/tools' },
    { label: 'Platform boundaries', url: 'https://craft.propvr.ai/platform' },
    { label: 'Arc availability and roadmap', url: 'https://craft.propvr.ai/arc' },
    { label: 'About Craft', url: 'https://craft.propvr.ai/about' },
  ],
} as const;
