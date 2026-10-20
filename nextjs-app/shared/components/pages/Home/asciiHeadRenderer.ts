/**
 * Rotating 3D head rendered as ASCII on the GPU, for the homepage hero.
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

export interface AsciiHeadOptions {
  modelUrl: string;
  /** Glyph colour and background, read from the theme. */
  fg: string;
  bg: string;
  /** 0..1: how far glyphs go from the background toward fg (dims without touching tokens). */
  strength: number;
  /** Spin speed in degrees per second; 0 holds the head still. */
  speed: number;
  /** Character cell height in CSS pixels. */
  cell: number;
}

export interface AsciiHeadHandle {
  setColors(fg: string, bg: string, strength: number): void;
  setRunning(running: boolean): void;
  destroy(): void;
}

// Tuned in the ASCII bench ("Ink on paper").
const RAMP = " .:-=+*#%@";
const TONE = { contrast: 1.6, brightness: 0.02, gamma: 0.9 };
const LIGHT = { keyAz: 25, keyEl: 20, key: 3, rim: 2.6, ambient: 0.35 };
const ZOOM = 1.35;
const FONT_STACK = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const FRAGMENT = /* glsl */ `
  uniform sampler2D tScene, tAtlas;
  uniform float uGlyphs, uContrast, uBright, uGamma, uInvert, uStrength;
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
    if (s.a < 0.35) idx = 0.0;
    float g = texture2D(tAtlas, vec2((idx + local.x) / uGlyphs, local.y)).a;
    gl_FragColor = vec4(mix(uBg, uFg, g * uStrength), 1.0);
    #include <colorspace_fragment>
  }
`;

const luminance = (c: Color) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;

export async function createAsciiHead(
  canvas: HTMLCanvasElement,
  options: AsciiHeadOptions,
): Promise<AsciiHeadHandle> {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.01, 100);
  camera.position.set(0, 0, 3.4 / ZOOM);

  const ambient = new AmbientLight(0xffffff, LIGHT.ambient);
  const key = new DirectionalLight(0xffffff, LIGHT.key);
  const rim = new DirectionalLight(0xffffff, LIGHT.rim);
  const az = (LIGHT.keyAz * Math.PI) / 180;
  const el = (LIGHT.keyEl * Math.PI) / 180;
  key.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(5);
  rim.position.set(-key.position.x, key.position.y * 0.4 + 1, -Math.abs(key.position.z) - 2);
  scene.add(ambient, key, rim);

  const pivot = new Group();
  scene.add(pivot);

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
    uContrast: { value: TONE.contrast },
    uBright: { value: TONE.brightness },
    uGamma: { value: TONE.gamma },
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
    // Dark glyphs on a light ground: reverse the ramp so lit skin stays sparse.
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

  // Rotation: a steady spin, overridden while the visitor drags.
  let yaw = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let lastMoveTime = 0;
  const spin = (options.speed * Math.PI) / 180;
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
    yaw += delta;
    velocity = delta / Math.max(1, now - lastMoveTime) * 1000;
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

  const draw = () => {
    pivot.rotation.y = yaw;
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
    if (!dragging) {
      // Fling momentum eases back into the steady spin.
      velocity += (spin - velocity) * Math.min(1, dt * 2.5);
      yaw += velocity * dt;
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
