import React from "react";
import { createPortal } from "react-dom";

export function usePopoverPosition(anchor: HTMLElement | null, w = 300, h = 320) {
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  React.useLayoutEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const vh = window.innerHeight;
    let top = rect.bottom + 8, left = rect.right - w; // align to right edge by default
    if (left < 8) left = 8;
    if (top + h > vh - 8) top = Math.max(8, rect.top - h - 8); // flip up
    setStyle({ position: "fixed", top, left, width: w, maxHeight: h, zIndex: 50 });
  }, [anchor, w, h]);
  return style;
}

export const Popover: React.FC<{ anchorEl: HTMLElement | null; onClose: () => void; children: React.ReactNode }> = ({ anchorEl, onClose, children }) => {
  const style = usePopoverPosition(anchorEl);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as Node)) return;
      if (anchorEl && (e.target as Node) instanceof Node) {
        // close on outside click
        const el = document.getElementById("popover-root");
        if (el && !el.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) onClose();
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;
  return createPortal(
    <div id="popover-root" style={style} className="rounded-xl border p-2 bg-[#0E1530] border-[#1A2348] shadow-xl overflow-auto">
      {children}
    </div>,
    document.body
  );
};
