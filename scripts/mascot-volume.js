import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { springStep, springConfig, dampFactor } from "./preview-motion.js";

window.previewMotion = { springStep, springConfig, dampFactor };

function wrappedGeometry(path, kind) {
  const parsed = new SVGLoader().parse(
    `<svg xmlns="http://www.w3.org/2000/svg"><path d="${path}"/></svg>`,
  );
  const outline = SVGLoader.createShapes(parsed.paths[0])[0].getSpacedPoints(
    128,
  );
  outline.pop();
  const box = new THREE.Box2().setFromPoints(outline);
  const center = box.getCenter(new THREE.Vector2());
  const scale = 2 / Math.max(box.max.x - box.min.x, box.max.y - box.min.y);
  const points = outline.map(
    (point) =>
      new THREE.Vector2(
        (point.x - center.x) * scale,
        (center.y - point.y) * scale,
      ),
  );
  if (THREE.ShapeUtils.area(points) < 0) points.reverse();
  const depth = kind === "orb" ? 1 : 0.72;
  if (kind === "orb")
    return {
      geometry: new THREE.SphereGeometry(1, 48, 32),
      depth,
      center,
      scale,
    };
  const vertices = [],
    indices = [],
    count = points.length,
    rings = 32;
  for (let ring = 0; ring <= rings; ring++) {
    const angle = (Math.PI * ring) / rings,
      radius = Math.sin(angle);
    for (const point of points)
      vertices.push(
        point.x * radius,
        point.y * radius,
        depth * Math.cos(angle),
      );
  }
  for (let ring = 0; ring < rings; ring++)
    for (let i = 0; i < count; i++) {
      const a = ring * count + i,
        b = (ring + 1) * count + i;
      const next = (i + 1) % count;
      indices.push(
        a,
        b,
        (ring + 1) * count + next,
        a,
        (ring + 1) * count + next,
        ring * count + next,
      );
    }
  const raw = new THREE.BufferGeometry();
  raw.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  raw.setIndex(indices);
  const geometry = mergeVertices(raw, 0.00001);
  raw.dispose();
  geometry.computeVertexNormals();
  return { geometry, depth, center, scale };
}

window.createMascotVolume = function createMascotVolume({
  host,
  button,
  path,
  kind,
  color,
  onState,
}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: true,
    });
  } catch {
    host.dataset.volume = "fallback";
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.className = "mascot-volume-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  host.dataset.volume = "ready";
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(-1.15, 1.15, 1.15, -1.15, 0.1, 20);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const key = new THREE.DirectionalLight(0xfff6ec, 2.6);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.0);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.68,
    metalness: 0.01,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material);
  group.add(body);
  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const eyeGeometry = new THREE.CapsuleGeometry(0.066, 0.16, 6, 12);
  const eyes = [new THREE.Object3D(), new THREE.Object3D()];
  const eyeMeshes = eyes.map((root) => {
    const mesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
    mesh.rotation.z = (15 * Math.PI) / 180;
    mesh.scale.z = 0.36;
    root.add(mesh);
    group.add(root);
    return mesh;
  });
  let depth = 1;
  function updateAppearance(nextPath, nextKind, nextColor) {
    const wrapped = wrappedGeometry(nextPath, nextKind);
    body.geometry.dispose();
    body.geometry = wrapped.geometry;
    depth = wrapped.depth;
    material.color.set(nextColor);
    [
      [41, 44],
      [59, 42],
    ].forEach(([x, y], i) => {
      const px = (x - wrapped.center.x) * wrapped.scale,
        py = (wrapped.center.y - y) * wrapped.scale;
      const z = depth * Math.sqrt(Math.max(0.2, 1 - px * px - py * py));
      eyes[i].position.set(px, py, z + 0.04);
    });
    schedule();
  }
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = new THREE.Vector2(),
    ray = new THREE.Raycaster(),
    plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.5);
  const target = new THREE.Vector3(0, 0, 2.5),
    gaze = target.clone(),
    previousQuaternion = new THREE.Quaternion();
  let state = "idle",
    hovered = false,
    focused = false,
    disposed = false,
    visible = true;
  let frame = null,
    lastTime = 0,
    pendingHappy = null,
    idleTimer = null,
    clickTimes = [],
    suppressClickUntil = 0;
  let scale = 1,
    scaleVelocity = 0,
    squint = 1,
    drag = null,
    x = 0,
    y = 0,
    vx = 0,
    vy = 0,
    tx = 0,
    ty = 0,
    renderedFrames = 0;
  function schedule() {
    if (!disposed && visible && !document.hidden && frame === null)
      frame = requestAnimationFrame(tick);
  }
  function setClip(next, duration = 0) {
    if (disposed || (state === "nervous" && next === "happy")) return;
    clearTimeout(idleTimer);
    state = next;
    host.dataset.state = state;
    onState?.(state);
    if (duration)
      idleTimer = setTimeout(() => {
        state = "idle";
        clickTimes = [];
        host.dataset.state = state;
        onState?.(state);
        schedule();
      }, duration);
    schedule();
  }
  function tick(time) {
    frame = null;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(
      0.032,
      lastTime ? Math.max(0.001, (time - lastTime) / 1000) : 0.016,
    );
    lastTime = time;
    const reduced = motionQuery.matches;
    let moving = false;
    if (reduced) {
      scale = 1;
      scaleVelocity = 0;
      x = y = vx = vy = 0;
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
    } else {
      const expansion = springStep(
        scale,
        scaleVelocity,
        hovered || focused ? 1.055 : 1,
        dt,
      );
      scale = expansion.value;
      scaleVelocity = expansion.velocity;
      moving ||= !expansion.done;
      const horizontal = springStep(x, vx, tx, dt),
        vertical = springStep(y, vy, ty, dt);
      x = horizontal.value;
      vx = horizontal.velocity;
      y = vertical.value;
      vy = vertical.velocity;
      moving ||= !horizontal.done || !vertical.done;
      const oldGaze = gaze.clone();
      gaze.lerp(target, dampFactor(dt, 0.15));
      moving ||= oldGaze.distanceTo(gaze) > 0.00005;
      group.rotation.y = THREE.MathUtils.lerp(
        group.rotation.y,
        pointer.x * 0.1,
        dampFactor(dt, 0.12),
      );
      group.rotation.x = THREE.MathUtils.lerp(
        group.rotation.x,
        -pointer.y * 0.06,
        dampFactor(dt, 0.12),
      );
      const nervous = state === "nervous";
      group.position.set(
        x + (nervous ? Math.sin(time * 0.081) * 0.008 : 0),
        y + (nervous ? Math.sin(time * 0.067) * 0.006 : 0),
        0,
      );
      group.rotation.z =
        x * 0.25 + (nervous ? Math.sin(time * 0.073) * 0.017 : 0);
      moving ||= nervous;
    }
    const desiredSquint = state === "happy" ? 0.04 : 1;
    if (reduced) squint = desiredSquint;
    else {
      squint = THREE.MathUtils.lerp(
        squint,
        desiredSquint,
        dampFactor(dt, 0.35),
      );
      moving ||= Math.abs(squint - desiredSquint) > 0.001;
    }
    const pulse =
      !reduced && state === "nervous" ? 1 + Math.sin(time * 0.029) * 0.012 : 1;
    const squash = !reduced && state === "happy" ? 0.95 : 1;
    group.scale.set(
      scale * pulse * (squash < 1 ? 1.025 : 1),
      scale * pulse * squash,
      scale,
    );
    for (let i = 0; i < eyes.length; i++) {
      eyeMeshes[i].scale.y = squint;
      if (!reduced && state !== "happy") {
        previousQuaternion.copy(eyes[i].quaternion);
        eyes[i].lookAt(gaze);
        const goal = eyes[i].quaternion.clone();
        eyes[i].quaternion
          .copy(previousQuaternion)
          .slerp(goal, dampFactor(dt, 0.15));
        moving ||= previousQuaternion.angleTo(eyes[i].quaternion) > 0.0001;
      }
    }
    renderer.render(scene, camera);
    renderedFrames++;
    if (moving && !reduced) schedule();
    else lastTime = 0;
  }
  function resize() {
    const bounds = host.getBoundingClientRect(),
      width = Math.max(1, bounds.width),
      height = Math.max(1, bounds.height);
    renderer.setSize(width, height, false);
    camera.left = (-1.15 * width) / height;
    camera.right = (1.15 * width) / height;
    camera.updateProjectionMatrix();
    schedule();
  }
  function move(event) {
    if (motionQuery.matches) return;
    const box = button.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        -1.5,
        1.5,
      ),
      THREE.MathUtils.clamp(
        1 - ((event.clientY - box.top) / box.height) * 2,
        -1.5,
        1.5,
      ),
    );
    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, target);
    if (drag && drag.id === event.pointerId) {
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      drag.moved ||= Math.hypot(dx, dy) > 6;
      tx = THREE.MathUtils.clamp((dx / box.width) * 0.2, -0.07, 0.07);
      ty = THREE.MathUtils.clamp((-dy / box.height) * 0.2, -0.06, 0.06);
    }
    schedule();
  }
  function down(event) {
    if (event.button !== 0) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    button.setPointerCapture(event.pointerId);
  }
  function up(event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const id = drag.id;
    if (drag.moved) suppressClickUntil = performance.now() + 350;
    drag = null;
    tx = ty = 0;
    if (button.hasPointerCapture(id)) button.releasePointerCapture(id);
    schedule();
  }
  function click(event) {
    if (event?.detail > 0 && performance.now() < suppressClickUntil) return;
    const now = performance.now();
    clickTimes = clickTimes.filter((time) => now - time <= 500);
    clickTimes.push(now);
    clearTimeout(pendingHappy);
    if (clickTimes.length >= 3) setClip("nervous", 1000);
    else if (state !== "nervous")
      pendingHappy = setTimeout(() => setClip("happy", 300), 90);
  }
  const enter = () => {
      hovered = true;
      schedule();
    },
    leave = () => {
      hovered = false;
      if (!drag) {
        pointer.set(0, 0);
        target.set(0, 0, 2.5);
      }
      schedule();
    };
  const focus = () => {
      focused = true;
      schedule();
    },
    blur = () => {
      focused = false;
      up();
      schedule();
    };
  const preference = () => {
    up();
    pointer.set(0, 0);
    target.set(0, 0, 2.5);
    gaze.copy(target);
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    schedule();
  };
  const visibility = () => {
    if (document.hidden) {
      up();
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    } else schedule();
  };
  button.addEventListener("pointerenter", enter);
  button.addEventListener("pointerleave", leave);
  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("lostpointercapture", up);
  button.addEventListener("focus", focus);
  button.addEventListener("blur", blur);
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  motionQuery.addEventListener("change", preference);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) schedule();
    else if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  });
  intersection.observe(button);
  updateAppearance(path, kind, color);
  resize();
  host.dataset.state = state;
  return {
    click,
    setAppearance: updateAppearance,
    snapshot: () => ({
      renderer: "three-webgl",
      state,
      scale,
      squint,
      depth: depth * 2,
      gaze: gaze.toArray(),
      eyeQuaternion: eyes[0].quaternion.toArray(),
      bodyAngle: group.rotation.toArray().slice(0, 3),
      renderedFrames,
      motionActive:
        !motionQuery.matches && (frame !== null || state === "nervous"),
      position: group.position.toArray(),
    }),
    dispose() {
      if (disposed) return;
      disposed = true;
      clearTimeout(pendingHappy);
      clearTimeout(idleTimer);
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      motionQuery.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointermove", move);
      for (const [type, handler] of [
        ["pointerenter", enter],
        ["pointerleave", leave],
        ["pointerdown", down],
        ["pointerup", up],
        ["pointercancel", up],
        ["lostpointercapture", up],
        ["focus", focus],
        ["blur", blur],
      ])
        button.removeEventListener(type, handler);
      body.geometry.dispose();
      material.dispose();
      eyeGeometry.dispose();
      eyeMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      host.dataset.volume = "disposed";
    },
  };
};
