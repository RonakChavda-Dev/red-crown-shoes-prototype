import type { Zone } from "@/data/products";

export const DEFAULT_VIEW = { yaw: -0.38, pitch: 0.1 };
export const PITCH_LIMITS = [-1.1, 0.75] as const;

/** Camera presets that show each zone off best. */
export const ZONE_VIEWS: Record<Zone, { yaw: number; pitch: number }> = {
  upper: { yaw: -0.38, pitch: 0.1 },
  accent: { yaw: -2.3, pitch: 0.1 },
  midsole: { yaw: -0.25, pitch: -0.08 },
  outsole: { yaw: -0.35, pitch: -1.0 },
  laces: { yaw: -0.3, pitch: 0.62 },
};

const clampPitch = (pitch: number) => Math.min(PITCH_LIMITS[1], Math.max(PITCH_LIMITS[0], pitch));

/**
 * Mutable view state shared between the DOM stage (pointer, keyboard,
 * visibility) and the WebGL scene. It lives outside React state so dragging
 * and animation never trigger re-renders; all mutation goes through methods.
 */
export class Rig {
  yaw = DEFAULT_VIEW.yaw;
  pitch = DEFAULT_VIEW.pitch;
  private targetYaw = DEFAULT_VIEW.yaw;
  private targetPitch = DEFAULT_VIEW.pitch;
  private lastInput = 0;
  private sway = 0;
  /** 1 → 0 during the entrance. */
  lift = 0;
  /** Bob offset from the idle float, for the contact shadow. */
  bob = 0;
  dragging = false;
  /** On screen and the tab is visible. */
  active = true;
  private requestFrame: () => void = () => {};

  connect(invalidate: () => void) {
    this.requestFrame = invalidate;
  }

  invalidate() {
    this.requestFrame();
  }

  playIntro() {
    this.yaw = DEFAULT_VIEW.yaw - 1.3;
    this.lift = 1;
  }

  setActive(active: boolean) {
    if (active === this.active) return;
    this.active = active;
    if (active) this.invalidate();
  }

  private touch() {
    this.lastInput = performance.now();
    this.invalidate();
  }

  setView(yaw: number, pitch: number) {
    this.targetYaw = yaw;
    this.targetPitch = clampPitch(pitch);
    this.touch();
  }

  nudge(yaw: number, pitch = 0) {
    this.targetYaw += yaw;
    this.targetPitch = clampPitch(this.targetPitch + pitch);
    this.touch();
  }

  reset() {
    // Unwind to the nearest equivalent of the default angle.
    const turns = Math.round((this.yaw - DEFAULT_VIEW.yaw) / (Math.PI * 2));
    this.yaw -= turns * Math.PI * 2;
    this.setView(DEFAULT_VIEW.yaw, DEFAULT_VIEW.pitch);
  }

  setDragging(dragging: boolean) {
    this.dragging = dragging;
    this.touch();
  }

  /** Advance one frame. Returns true while the view is still moving. */
  step(dt: number, time: number, reducedMotion: boolean) {
    const animate = this.active && !reducedMotion;
    const ease = reducedMotion ? 1 : 1 - Math.exp(-dt * (this.dragging ? 16 : 5));
    const idle = !this.dragging && performance.now() - this.lastInput > 2800;
    this.sway += ((idle && animate ? 1 : 0) - this.sway) * (1 - Math.exp(-dt * 1.2));
    const swayYaw = Math.sin(time * 0.42) * 0.18 * this.sway;

    this.yaw += (this.targetYaw + swayYaw - this.yaw) * ease;
    this.pitch += (this.targetPitch - this.pitch) * ease;
    this.lift += -this.lift * (reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
    this.bob = animate ? Math.sin(time * 1.1) * 0.045 : 0;

    return (
      animate ||
      this.dragging ||
      Math.abs(this.targetYaw + swayYaw - this.yaw) > 1e-3 ||
      Math.abs(this.targetPitch - this.pitch) > 1e-3 ||
      this.lift > 1e-3
    );
  }
}
