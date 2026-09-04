import { Handle, Position } from "reactflow";
import { useInteractionStore } from "@/lib/interaction-store";

const ports = [
  { position: Position.Top, type: "target" as const, label: "top" },
  { position: Position.Right, type: "source" as const, label: "right" },
  { position: Position.Bottom, type: "source" as const, label: "bottom" },
  { position: Position.Left, type: "source" as const, label: "left" },
];

/** Shared ports: invisible in normal mode, discoverable and easy to hit while connecting. */
export function ConnectorPorts() {
  const active = useInteractionStore((state) => state.activeTool === "connector");
  return (
    <>
      {ports.map(({ position, type, label }) => (
        <Handle
          key={label}
          type={type}
          position={position}
          aria-label={`${label} connector port`}
          className={
            active
              ? "!z-20 !h-5 !w-5 !border-0 !bg-transparent !pointer-events-auto"
              : "!h-0 !w-0 !border-0 !bg-transparent !opacity-0 !pointer-events-none"
          }
        >
          <span
            className={
              active
                ? "pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-primary/20"
                : "hidden"
            }
          />
        </Handle>
      ))}
    </>
  );
}
