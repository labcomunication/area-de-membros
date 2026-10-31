/** Shared deterministic motion primitives for the Three island and DOM labels. */
export const springConfig = { stiffness: 210, damping: 24 };
export function springStep(
  value,
  velocity,
  target,
  delta,
  config = springConfig,
) {
  const dt = Math.min(0.032, Math.max(0.001, delta));
  const nextVelocity =
    velocity +
    ((target - value) * config.stiffness - velocity * config.damping) * dt;
  const nextValue = value + nextVelocity * dt;
  const done =
    Math.abs(nextValue - target) < 0.001 && Math.abs(nextVelocity) < 0.006;
  return {
    value: done ? target : nextValue,
    velocity: done ? 0 : nextVelocity,
    done,
  };
}
export function dampFactor(delta, factor = 0.15) {
  return 1 - Math.pow(1 - factor, Math.min(0.05, delta) * 60);
}
