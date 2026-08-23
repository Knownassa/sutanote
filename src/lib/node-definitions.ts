export interface NodeDefinition {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
}

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  text: { defaultWidth: 200, defaultHeight: 80, minWidth: 140, minHeight: 50 },
  sticky: { defaultWidth: 180, defaultHeight: 120, minWidth: 140, minHeight: 90 },
  todo: { defaultWidth: 220, defaultHeight: 120, minWidth: 180, minHeight: 90 },
};

const FALLBACK: NodeDefinition = {
  defaultWidth: 180,
  defaultHeight: 120,
  minWidth: 140,
  minHeight: 90,
};

export function getNodeDef(type: string): NodeDefinition {
  return NODE_DEFINITIONS[type] ?? FALLBACK;
}
