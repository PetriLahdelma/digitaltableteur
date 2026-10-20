/**
 * A rotating 3D model rendered as ASCII on the GPU, for hero backgrounds.
 *
 * The scene renders into a low-resolution target (two texels per character
 * cell); a fragment shader turns each cell's brightness into a glyph from a
 * canvas-drawn atlas. Loaded with a dynamic import so three.js stays out of
 * the initial bundle.
 */
import {
  AmbientLight,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface AsciiSceneTone {
  contrast: number;
  brightness: number;
  gamma: number;
  /** Lowest ramp step for any cell the model covers, so pale surfaces keep their outline. */
  floor: number;
}

export interface AsciiSceneLight {
  /** Key light azimuth and elevation in degrees. */
  keyAz: number;
  keyEl: number;
  key: number;
  rim: number;
  ambient: number;
}

export type AsciiSceneMotion =
  /** A steady turn at `speed` degrees per second. */
  | { kind: "spin"; speed: number }
  /** A slow rock of up to `sway` degrees that never shows the model edge-on. */
  | { kind: "tumble"; speed: number; sway: number };

export interface AsciiSceneOptions {
  modelUrl: string;
  /** Glyph colour and background. */
  fg: string;
  bg: string;
  /** 0..1: how far glyphs go from the background toward fg (dims without touching tokens). */
  strength: number;
  /** Character cell height in CSS pixels. */
  cell: number;
  tone: AsciiSceneTone;
  light: AsciiSceneLight;
  /** Camera framing: larger is closer. */
  zoom: number;
  /** Shift of the model in frame (scene units; the model spans about 1.6). */
  offset?: { x: number; y: number };
  motion: AsciiSceneMotion;
}

export interface AsciiSceneHandle {
  setColors(fg: string, bg: string, strength: number): void;
  setRunning(running: boolean): void;
  destroy(): void;
}

const RAMP = " .:-=+*#%@";
const FONT_STACK = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const FRAGMENT = /* glsl */ `
  uniform sampler2D tScene, tAtlas;
  uniform float uGlyphs, uContrast, uBright, uGamma, uInvert, uStrength, uFloor;
  uniform vec2 uCell, uRes, uGrid;
  uniform vec3 uFg, uBg;
  varying vec2 vUv;
  void main() {
    vec2 px = vUv * uRes;
    vec2 cell = floor(px / uCell);
    vec2 local = fract(px / uCell);
    vec4 s = texture2D(tScene, (cell + 0.5) / uGrid);
    vec3 rgb = s.rgb / max(s.a, 0.001);
    float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    lum = clamp((lum - 0.5) * uContrast + 0.5 + uBright, 0.0, 1.0);
    lum = pow(lum, uGamma);
    if (uInvert > 0.5) lum = 1.0 - lum;
    float idx = floor(lum * (uGlyphs - 1.0) + 0.5);
    idx = max(idx, uFloor);
    if (s.a < 0.35) idx = 0.0;
    float g = texture2D(tAtlas, vec2((idx + local.x) / uGlyphs, local.y)).a;
    gl_FragColor = vec4(mix(uBg, uFg, g * uStrength), 1.0);
    #include <colorspace_fragment>
  }
`;

const luminance = (c: Color) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;

export async function createAsciiScene(
  canvas: HTMLCanvasElement,
  options: AsciiSceneOptions,
): Promise<AsciiSceneHandle> {
  const { tone, light, motion } = options;
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.01, 100);
  camera.position.set(0, 0, 3.4 / options.zoom);

  const ambient = new AmbientLight(0xffffff, light.ambient);
  const key = new DirectionalLight(0xffffff, light.key);
  const rim = new DirectionalLight(0xffffff, light.rim);
  const az = (light.keyAz * Math.PI) / 180;
  const el = (light.keyEl * Math.PI) / 180;
  key.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(5);
  rim.position.set(-key.position.x, key.position.y * 0.4 + 1, -Math.abs(key.position.z) - 2);
  scene.add(ambient, key, rim);

  const pivot = new Group();
  scene.add(pivot);
  pivot.position.set(options.offset?.x ?? 0, options.offset?.y ?? 0, 0);

  // Embedded textures load through <img> (img-src allows blob:), not
  // fetch-based ImageBitmapLoader, which the site's connect-src blocks.
  const loader = new GLTFLoader();
  loader.register((parser) => {
    (parser as unknown as { textureLoader: TextureLoader }).textureLoader = new TextureLoader(parser.options.manager);
    return { name: "dt_img_textures" };
  });
  const gltf = await loader.loadAsync(options.modelUrl);
  const model = gltf.scene;
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const scale = 1.6 / Math.max(size.x, size.y, size.z);
  model.position.copy(center).multiplyScalar(-scale);
  model.scale.setScalar(scale);
  pivot.add(model);

  const target = new WebGLRenderTarget(2, 2, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: UnsignedByteType,
  });
  target.texture.colorSpace = SRGBColorSpace;

  const uniforms = {
    tScene: { value: target.texture },
    tAtlas: { value: null as CanvasTexture | null },
    uGlyphs: { value: RAMP.length },
    uCell: { value: new Vector2(6, 10) },
    uRes: { value: new Vector2(1, 1) },
    uGrid: { value: new Vector2(1, 1) },
    uFg: { value: new Color() },
    uBg: { value: new Color() },
    uContrast: { value: tone.contrast },
    uBright: { value: tone.brightness },
    uGamma: { value: tone.gamma },
    uFloor: { value: tone.floor },
    uInvert: { value: 0 },
    uStrength: { value: 1 },
  };
  const quadScene = new Scene();
  const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      uniforms,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: FRAGMENT,
    }),
  );
  quadScene.add(quad);

  // Glyph atlas: the ramp drawn once, white on transparent.
  const ch = Math.round(options.cell * dpr);
  const cw = Math.max(2, Math.round(ch * 0.6));
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = cw * RAMP.length;
  atlasCanvas.height = ch;
  const ctx = atlasCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 ${Math.round(ch * 0.92)}px ${FONT_STACK}`;
    [...RAMP].forEach((glyph, i) => ctx.fillText(glyph, i * cw + cw / 2, ch / 2 + ch * 0.04));
  }
  const atlas = new CanvasTexture(atlasCanvas);
  atlas.minFilter = LinearFilter;
  atlas.magFilter = LinearFilter;
  atlas.generateMipmaps = false;
  uniforms.tAtlas.value = atlas;
  uniforms.uCell.value.set(cw, ch);

  const setColors = (fg: string, bg: string, strength: number) => {
    uniforms.uStrength.value = strength;
    uniforms.uFg.value.set(fg);
    uniforms.uBg.value.set(bg);
    // Dark glyphs on a light ground: reverse the ramp so lit surfaces stay sparse.
    uniforms.uInvert.value = luminance(uniforms.uFg.value) < luminance(uniforms.uBg.value) ? 1 : 0;
  };
  setColors(options.fg, options.bg, options.strength);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * dpr, h * dpr);
    const cols = Math.ceil((w * dpr) / cw);
    const rows = Math.ceil((h * dpr) / ch);
    uniforms.uGrid.value.set(cols, rows);
    target.setSize(cols * 2, rows * 2);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  // Rotation: the scene's own motion, plus whatever the visitor drags in.
  // Spin: drag and fling, easing back to the steady turn. Tumble: the drag
  // offsets the rock and its fling coasts to a stop.
  const deg = Math.PI / 180;
  let yaw = 0;
  let pitch = 0;
  let offset = 0;
  let velocity = 0;
  let clock = 0;
  let dragging = false;
  let lastX = 0;
  let lastMoveTime = 0;
  const spin = motion.kind === "spin" ? motion.speed * deg : 0;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastMoveTime = performance.now();
    velocity = 0;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const delta = (dx / Math.max(1, canvas.clientWidth)) * Math.PI * 2;
    if (motion.kind === "spin") yaw += delta;
    else offset += delta;
    velocity = (delta / Math.max(1, now - lastMoveTime)) * 1000;
    lastX = e.clientX;
    lastMoveTime = now;
    if (!running) draw();
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const pose = () => {
    if (motion.kind === "tumble") {
      const f = motion.speed * deg;
      yaw = Math.sin(clock * f * 1.6) * motion.sway * deg + offset;
      pitch = Math.sin(clock * f * 1.1 + 1.3) * motion.sway * deg * 0.35;
    }
  };
  const draw = () => {
    pose();
    pivot.rotation.set(pitch, yaw, 0);
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
  };

  let running = false;
  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    if (!dragging) {
      // Fling momentum eases back into the scene's own motion.
      velocity += (spin - velocity) * Math.min(1, dt * 2.5);
      if (motion.kind === "spin") yaw += velocity * dt;
      else offset += velocity * dt;
    }
    draw();
    raf = requestAnimationFrame(frame);
  };
  const setRunning = (next: boolean) => {
    if (next === running) return;
    running = next;
    if (running) {
      last = performance.now();
      velocity = spin;
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      draw();
    }
  };
  draw();

  return {
    setColors: (fg, bg, strength) => {
      setColors(fg, bg, strength);
      if (!running) draw();
    },
    setRunning,
    destroy: () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      atlas.dispose();
      target.dispose();
      quad.geometry.dispose();
      (quad.material as ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
