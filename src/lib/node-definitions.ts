export interface NodeDefinition {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
}

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  text: { defaultWidth: 280, defaultHeight: 120, minWidth: 200, minHeight: 80 },
  sticky: { defaultWidth: 220, defaultHeight: 180, minWidth: 180, minHeight: 140 },
  todo: { defaultWidth: 300, defaultHeight: 160, minWidth: 240, minHeight: 120 },
  image: { defaultWidth: 280, defaultHeight: 220, minWidth: 200, minHeight: 160 },
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
