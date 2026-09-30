// The cabinet's CRT: the selected cartridge's picture (still, clip or typed terminal)
// drawn through a curved phosphor screen with scanlines and colour fringing. Changing
// cartridge rolls the picture through static. Raw WebGL2: one quad, one texture.
import { gsap } from 'gsap';
import { sceneLoop } from './mount.js';
import { CRT_GLSL, collectSources } from './crt-picture.js';

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uTexSize;
uniform float uTime, uSwitch, uStart, uCurve;
in vec2 vUv;
out vec4 outColor;
${CRT_GLSL}
void main() { outColor = crt(vUv); }`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

export function mount(screen) {
  const root = screen.closest('[data-arcade]');
  const canvas = screen.querySelector('[data-arcade-gl]');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return {};

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(['uTex', 'uRes', 'uTexSize', 'uTime', 'uSwitch', 'uStart', 'uCurve'].map((name) => [name, gl.getUniformLocation(program, name)]));
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u.uTex, 0);
  gl.uniform1f(u.uCurve, 1);

  // Every cartridge's picture source: an image, a clip (poster until it plays) or a terminal.
  const sources = collectSources(screen);

  let currentId = screen.querySelector('[data-feed][data-on]')?.dataset.feed;
  const state = { sw: 0, start: 0 };
  let texSize = [16, 9];
  let dirty = true;

  const upload = (element, w, h) => {
    if (!w || !h) return false;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
    texSize = [w, h];
    return true;
  };

  const refresh = (time) => {
    const source = sources.get(currentId);
    if (!source) return;
    if (source.kind === 'img') {
      if (dirty && source.img.complete && source.img.naturalWidth) dirty = !upload(source.img, source.img.naturalWidth, source.img.naturalHeight);
    } else if (source.kind === 'video') {
      const { video, poster } = source;
      if (!video.paused && video.readyState >= 2) upload(video, video.videoWidth, video.videoHeight);
      else if (dirty && poster.complete && poster.naturalWidth) dirty = !upload(poster, poster.naturalWidth, poster.naturalHeight);
    } else if (source.kind === 'term') {
      source.term.draw(time);
      upload(source.term.canvas, ...source.term.size);
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const frame = (time) => {
    refresh(time);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform2f(u.uTexSize, texSize[0], texSize[1]);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uSwitch, state.sw);
    gl.uniform1f(u.uStart, state.start);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const loop = sceneLoop(canvas, (time) => frame(time));

  root.addEventListener('arcade:select', (event) => {
    gsap.killTweensOf(state);
    gsap.timeline()
      .to(state, { sw: 1, duration: 0.16, ease: 'power2.in' })
      .add(() => {
        currentId = event.detail.id;
        dirty = true;
        sources.get(currentId)?.term?.reset();
      })
      .to(state, { sw: 0, duration: 0.5, ease: 'power2.out' });
  });
  // Pressing start switches the tube off before the link opens.
  const observer = new MutationObserver(() => {
    if (root.dataset.starting === 'true') gsap.to(state, { start: 1, duration: 0.25, ease: 'power3.in' });
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-starting'] });
  addEventListener('pageshow', () => { delete root.dataset.starting; state.start = 0; });

  screen.dataset.gl = 'on';
  loop.wake();
  return {
    setMotion(on) {
      screen.dataset.gl = on ? 'on' : 'off';
      if (on) loop.wake();
    },
    destroy() { loop.stop(); observer.disconnect(); },
  };
}
