/** A finite pointer trail scoped to the mascot studio, with no idle RAF. */
export function createMascotDotfield(studio) {
  if (!studio) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "mascot-dotfield";
  canvas.setAttribute("aria-hidden", "true");
  const context = canvas.getContext("2d");
  if (!context) return null;
  studio.prepend(canvas);
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const lifetime = 900,
    radius = 125,
    spacing = 22;
  let width = 1,
    height = 1,
    frame = null,
    visible = true,
    disposed = false;
  let pointer = null,
    trail = [],
    points = [],
    renderedFrames = 0,
    peak = 0;
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }
  function schedule() {
    if (
      !disposed &&
      visible &&
      !document.hidden &&
      !preference.matches &&
      frame === null
    )
      frame = requestAnimationFrame(draw);
  }
  function draw(time = performance.now()) {
    frame = null;
    if (disposed) return;
    trail = trail.filter((sample) => time - sample.time < lifetime);
    context.clearRect(0, 0, width, height);
    peak = 0;
    for (const point of points) {
      let light = 0;
      if (!preference.matches) {
        if (pointer)
          light =
            Math.max(
              0,
              1 - Math.hypot(point.x - pointer.x, point.y - pointer.y) / radius,
            ) ** 2;
        for (const sample of trail) {
          const radial =
            Math.max(
              0,
              1 - Math.hypot(point.x - sample.x, point.y - sample.y) / radius,
            ) ** 2;
          light = Math.max(
            light,
            radial * (1 - (time - sample.time) / lifetime),
          );
        }
      }
      peak = Math.max(peak, light);
      context.beginPath();
      context.arc(point.x, point.y, 1, 0, Math.PI * 2);
      context.fillStyle = `rgba(132,132,132,${0.2 + light * 0.6})`;
      context.fill();
    }
    renderedFrames++;
    // The current pointer can remain illuminated with a static final frame.
    if (trail.length) schedule();
  }
  function reset() {
    stop();
    pointer = null;
    trail = [];
    draw();
  }
  function resize() {
    stop();
    const bounds = studio.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const density = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    points = [];
    for (let y = spacing / 2; y < height; y += spacing)
      for (let x = spacing / 2; x < width; x += spacing) points.push({ x, y });
    reset();
  }
  function move(event) {
    if (preference.matches || !visible || document.hidden) return;
    const bounds = studio.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    trail.push({ ...pointer, time: performance.now() });
    if (trail.length > 32) trail.shift();
    schedule();
  }
  function leave() {
    pointer = null;
    schedule();
  }
  function visibility() {
    if (document.hidden) reset();
    else if (visible) {
      stop();
      draw();
    }
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(studio);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (!visible) reset();
    else {
      stop();
      draw();
    }
  });
  intersection.observe(studio);
  studio.addEventListener("pointermove", move, { passive: true });
  studio.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  preference.addEventListener("change", reset);
  resize();
  return {
    snapshot: () => ({
      active: frame !== null,
      peak,
      renderedFrames,
      pointCount: points.length,
    }),
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      studio.removeEventListener("pointermove", move);
      studio.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", reset);
      canvas.remove();
    },
  };
}
