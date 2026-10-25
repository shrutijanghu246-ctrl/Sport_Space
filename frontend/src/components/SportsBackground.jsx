import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { SPORTS, EXTRA_ICONS } from "../data/sports";

const ALL_ICONS = [...SPORTS.map((s) => s.Icon), ...EXTRA_ICONS];
const HOVER_RADIUS = 130; // px around the cursor that lights up icons

function useViewport() {
  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(
        () => setSize({ w: window.innerWidth, h: window.innerHeight }),
        150,
      );
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);
  return size;
}

// Lay icons out in a staggered grid, skipping the centre of the screen
// (where your content lives). Fewer icons fit on phones automatically.
function buildCells(w, h) {
  const phone = w < 640;
  const cell = phone ? 88 : 76;
  const size = phone ? 30 : 34;
  // size of the empty ellipse in the middle - tweak these to taste
  const rx = phone ? w * 0.62 : w * 0.3;
  const ry = phone ? h * 0.34 : h * 0.42;

  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const out = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cell + (r % 2 ? cell / 2 : 0);
      const y = r * cell;
      const dx = (x - w / 2) / rx;
      const dy = (y - h / 2) / ry;
      const d = dx * dx + dy * dy;
      if (d < 1) continue; // inside the clear zone

      const i = r * 5 + c;
      out.push({
        key: `${r}-${c}`,
        x,
        y,
        size,
        Icon: ALL_ICONS[(i * 7) % ALL_ICONS.length],
        rot: ((i * 53) % 25) - 12,
        fade: Math.min(1, (d - 1) / 0.8), // soft edge near the clear zone
        base: phone ? 0.14 : 0.2,
      });
    }
  }

  // pick a few random icons to float; the rest stay still
  const floatCount = phone ? 4 : 8;
  const chance = Math.min(1, floatCount / Math.max(out.length, 1));
  return out.map((c) => ({
    ...c,
    float: Math.random() < chance,
    delay: Math.random() * 3,
    dur: 6 + Math.random() * 4,
  }));
}

function Tile({ cell, mx, my, reduce }) {
  const { x, y, size, Icon, rot, fade, base, float, delay, dur } = cell;

  // 0 = cursor far away, 1 = cursor right on top of the icon
  const prox = useTransform([mx, my], ([mxv, myv]) => {
    const d = Math.hypot(mxv - x, myv - y);
    return Math.max(0, 1 - d / HOVER_RADIUS);
  });
  const opacity = useTransform(prox, (p) => base * fade + p * 0.55);
  const scale = useTransform(prox, (p) => 1 + p * 0.25);
  const color = useTransform(prox, [0, 1], ["#9ca3af", "#f59e0b"]);

  return (
    <motion.span
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        lineHeight: 0,
        rotate: rot,
        opacity,
        scale,
        color,
      }}
      animate={float && !reduce ? { y: [0, -10, 0] } : undefined}
      transition={
        float && !reduce
          ? { duration: dur, delay, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <Icon size={size} />
    </motion.span>
  );
}

export default function SportsBackground() {
  const reduce = useReducedMotion();
  const { w, h } = useViewport();
  const cells = useMemo(() => buildCells(w, h), [w, h]);

  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  useEffect(() => {
    if (reduce) return; // reduced motion: icons stay frozen, no hover effect
    const move = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    const leave = () => {
      mx.set(-9999);
      my.set(-9999);
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [reduce, mx, my]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {cells.map((cell) => (
        <Tile key={cell.key} cell={cell} mx={mx} my={my} reduce={reduce} />
      ))}
    </div>
  );
}
