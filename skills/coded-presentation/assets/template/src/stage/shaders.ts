const noise = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

/* ---------------- Background: a glow that shifts from cold to ember ---------------- */

export const backdropVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const backdropFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uHeat;
uniform float uGlow;
uniform vec2 uView;
varying vec2 vUv;
${noise}
void main() {
  // p is ±0.5 vertically over the slides' canvas; the window may show more than that.
  vec2 p = (vUv - 0.5) * uView;
  float t = uTime * 0.03;

  // A temperature field: a heat source below the screen, warped by slow noise.
  vec2 q = p * 0.9;
  q += 0.42 * vec2(vnoise(q * 1.3 + vec2(0.0, t)), vnoise(q * 1.3 + vec2(4.1, -t))) - 0.21;
  float relief = vnoise(q * 1.7 + vec2(t * 0.6, -t * 0.4)) * 0.66 + vnoise(q * 3.3 - vec2(t * 0.5, t * 0.3)) * 0.34;
  float source = 1.0 - length((p - vec2(0.0, -0.98)) * vec2(0.52, 1.0));
  float field = source + (relief - 0.5) * 0.62;

  // Isotherms: contour lines of constant thickness, drifting slowly away from the source.
  float levels = mix(8.0, 13.0, uHeat);
  float v = field * levels - uTime * 0.05;
  float w = fwidth(v);
  float line = 1.0 - smoothstep(0.55 * w, 1.5 * w, abs(fract(v) - 0.5));

  // The lines are bright near the source and fade toward the top, where the text sits.
  float near = smoothstep(-0.32, 0.62, field);
  float mask = pow(near, 1.7);

  vec3 lineCold = mix(vec3(0.16, 0.44, 0.86), vec3(0.62, 0.90, 1.0), near);
  vec3 lineHot = mix(vec3(0.86, 0.22, 0.05), vec3(1.0, 0.80, 0.46), near);
  vec3 col = mix(lineCold, lineHot, uHeat) * line * mask * 1.15;

  // A diffuse glow along the floor.
  float haze = pow(smoothstep(0.02, 1.0, field + 0.22), 3.0);
  col += mix(vec3(0.03, 0.17, 0.46), vec3(0.72, 0.17, 0.02), uHeat) * haze;

  col *= uGlow;

  // Grain, only where there is light: prevents gradient banding on a projector, and keeps
  // black perfectly black.
  float lum = max(col.r, max(col.g, col.b));
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.03 * smoothstep(0.0, 0.1, lum);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

/* ---------------- Points: one point = one dollar ---------------- */

export const tokensVert = /* glsl */ `
attribute vec4 aFrom;
attribute vec4 aTo;
attribute vec3 aStyleFrom;
attribute vec3 aStyleTo;
attribute vec4 aSeed;
uniform float uProgress;
uniform float uTime;
uniform float uScale;
uniform float uCamZ;
varying float vAlpha;
varying float vHeat;

void main() {
  // Each point leaves with its own delay, then speeds up and slows down.
  float t = clamp((uProgress - aSeed.x * 0.5) / 0.5, 0.0, 1.0);
  float e = t * t * t * (t * (6.0 * t - 15.0) + 10.0);

  vec3 a = aFrom.xyz;
  vec3 b = aTo.xyz;
  vec3 pos = mix(a, b, e);

  // In flight: a curved path that swings toward the camera.
  float mid = sin(e * 3.14159265);
  vec3 dir = b - a;
  float len = length(dir);
  pos.xy += vec2(-dir.y, dir.x) * 0.22 * (aSeed.y - 0.5) * mid;
  pos.z += mid * (aSeed.z - 0.25) * min(len, 700.0) * 0.55;

  // At rest: a slow drift.
  float drift = mix(aStyleFrom.z, aStyleTo.z, e);
  float ph = aSeed.w * 6.2831853;
  pos.xy += vec2(sin(uTime * 0.33 + ph), cos(uTime * 0.27 + ph * 1.7)) * drift;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = mix(aStyleFrom.y, aStyleTo.y, e) * uScale * (uCamZ / max(-mv.z, 1.0));
  vAlpha = mix(aFrom.w, aTo.w, e);
  vHeat = mix(aStyleFrom.x, aStyleTo.x, e);
}
`;

export const tokensFrag = /* glsl */ `
precision highp float;
varying float vAlpha;
varying float vHeat;

void main() {
  if (vAlpha < 0.004) discard;
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.36, d);
  vec3 white = vec3(0.96, 0.96, 0.97);
  vec3 cold = vec3(0.50, 0.84, 1.0);
  vec3 ember = mix(vec3(1.0, 0.70, 0.30), vec3(1.0, 0.33, 0.10), clamp(vHeat * 1.6 - 0.6, 0.0, 1.0));
  vec3 col = vHeat >= 0.0 ? mix(white, ember, clamp(vHeat * 1.8, 0.0, 1.0)) : mix(white, cold, -vHeat);
  gl_FragColor = vec4(col, disc * vAlpha);
}
`;

/* ---------------- Server racks ---------------- */

export const racksVert = /* glsl */ `
attribute float aOrder;
attribute float aId;
uniform float uAmount;
varying vec3 vN;
varying vec2 vUv;
varying float vId;
varying float vZ;
varying float vS;

void main() {
  // Each rack rises from the floor in turn, from nearest to farthest.
  float s = smoothstep(aOrder, aOrder + 0.12, uAmount * 1.12);
  vec3 p = position;
  p.y = (p.y + 0.5) * s - 0.5;
  vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vN = normal;
  vUv = uv;
  vId = aId;
  vZ = wp.z;
  vS = s;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const racksFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uHeat;
varying vec3 vN;
varying vec2 vUv;
varying float vId;
varying float vZ;
varying float vS;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  if (vS < 0.01) discard;
  // Three flat tones: lit top, dark front, near-black sides.
  vec3 col = vec3(0.020, 0.022, 0.028);
  col = mix(col, vec3(0.042, 0.046, 0.056), step(0.5, vN.z));
  col = mix(col, vec3(0.135, 0.145, 0.17), step(0.5, vN.y));

  // Edges: separate each rack from the black.
  float edge = max(smoothstep(0.468, 0.5, abs(vUv.x - 0.5)), smoothstep(0.486, 0.5, abs(vUv.y - 0.5)));
  col += vec3(0.085, 0.092, 0.11) * edge;

  if (vN.z > 0.5) {
    // Front: rows of blinking status LEDs.
    vec2 g = vUv * vec2(4.0, 20.0);
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float rate = 0.4 + 2.2 * hash(id.yx + vId * 3.1);
    float on = step(0.42, hash(id + vId * 13.7 + floor(uTime * rate)));
    float led = smoothstep(0.17, 0.05, length(f * vec2(2.2, 1.0)));
    vec3 warm = mix(vec3(1.0, 0.62, 0.22), vec3(1.0, 0.30, 0.10), hash(id + 3.0));
    vec3 cool = vec3(0.40, 0.80, 1.0);
    vec3 ledCol = mix(cool, warm, step(hash(id * 1.7 + vId), 0.25 + 0.7 * uHeat));
    col += ledCol * led * on * 1.5;
    col += 0.02 * smoothstep(0.42, 0.5, abs(f.y));
  }

  // Distant racks fade into the black.
  float fog = smoothstep(350.0, -3300.0, vZ);
  col *= (1.0 - fog) * smoothstep(0.0, 0.6, vS);
  gl_FragColor = vec4(col, 1.0);
}
`;
