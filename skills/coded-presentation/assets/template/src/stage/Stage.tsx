import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { StageSpec, TokenLayout } from '../slides/types';
import { TOKEN_COUNT, flight, layouts, seeds, spin } from './layouts';
import { backdropFrag, backdropVert, racksFrag, racksVert, tokensFrag, tokensVert } from './shaders';

/**
 * The WebGL render covers the whole window, whatever its shape. The camera is set so that the
 * slides' 1920×1080 canvas, centered in the window, lands exactly on the z = 0 plane: a point
 * placed at (x, y, 0) sits pixel-perfect under the text. Around it, the background carries on
 * to the edges.
 */
const CAM_Z = 1600;
const damp = THREE.MathUtils.damp;

/** What the window shows of the z = 0 plane, in canvas pixels: at least 1920×1080. */
function visible(size: { width: number; height: number }) {
  const aspect = size.width / Math.max(1, size.height);
  const h = Math.max(1080, 1920 / aspect);
  return { w: h * aspect, h, aspect };
}

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    const v = visible(size);
    camera.aspect = v.aspect;
    camera.fov = (2 * Math.atan(v.h / 2 / CAM_Z) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}
/** ?capture: keeps the WebGL image in memory so that a screenshot can see it. Not needed when presenting. */
const CAPTURE = new URLSearchParams(location.search).has('capture');

function Backdrop({ spec }: { spec: StageSpec }) {
  const target = useRef(spec);
  target.current = spec;
  const mesh = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uHeat: { value: spec.heat }, uGlow: { value: 0 }, uView: { value: new THREE.Vector2(16 / 9, 1) } },
      vertexShader: backdropVert,
      fragmentShader: backdropFrag,
      depthTest: false,
      depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    m.frustumCulled = false;
    m.renderOrder = -10;
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = (mesh.material as THREE.ShaderMaterial).uniforms;
    const v = visible(state.size);
    u.uView.value.set(v.w / 1080, v.h / 1080);
    u.uTime.value += dt;
    u.uHeat.value = damp(u.uHeat.value, target.current.heat, 1.5, dt);
    u.uGlow.value = damp(u.uGlow.value, target.current.glow, 1.5, dt);
  });
  return <primitive object={mesh} />;
}

function Tokens({ spec }: { spec: StageSpec }) {
  const target = useRef(spec);
  target.current = spec;

  const sys = useMemo(() => {
    const start = layouts.none;
    const from = new Float32Array(start.pos);
    const to = new Float32Array(start.pos);
    const sFrom = new Float32Array(start.style);
    const sTo = new Float32Array(start.style);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TOKEN_COUNT * 3), 3));
    geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 4));
    geo.setAttribute('aTo', new THREE.BufferAttribute(to, 4));
    geo.setAttribute('aStyleFrom', new THREE.BufferAttribute(sFrom, 3));
    geo.setAttribute('aStyleTo', new THREE.BufferAttribute(sTo, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uProgress: { value: 1 }, uTime: { value: 0 }, uScale: { value: 1 }, uCamZ: { value: CAM_Z } },
      vertexShader: tokensVert,
      fragmentShader: tokensFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = 10;
    return { geo, mat, points, from, to, sFrom, sTo, progress: 1, duration: 2, layout: 'none' as TokenLayout, rot: 0 };
  }, []);

  // Layout change: start again from each point's actual position, even mid-flight.
  useEffect(() => {
    const next = layouts[spec.tokens];
    const p = sys.progress;
    for (let i = 0; i < TOKEN_COUNT; i++) {
      const t = Math.min(1, Math.max(0, (p - seeds[i * 4] * 0.5) / 0.5));
      const e = t * t * t * (t * (6 * t - 15) + 10);
      for (let k = 0; k < 4; k++) {
        const j = i * 4 + k;
        sys.from[j] = sys.from[j] + (sys.to[j] - sys.from[j]) * e;
      }
      for (let k = 0; k < 3; k++) {
        const j = i * 3 + k;
        sys.sFrom[j] = sys.sFrom[j] + (sys.sTo[j] - sys.sFrom[j]) * e;
      }
    }
    sys.to.set(next.pos);
    sys.sTo.set(next.style);
    for (const name of ['aFrom', 'aTo', 'aStyleFrom', 'aStyleTo']) {
      (sys.geo.getAttribute(name) as THREE.BufferAttribute).needsUpdate = true;
    }
    sys.progress = 0;
    sys.duration = flight[spec.tokens];
    sys.layout = spec.tokens;
    sys.mat.uniforms.uProgress.value = 0;
  }, [spec.tokens, sys]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = sys.mat.uniforms;
    u.uTime.value += dt;
    sys.progress = Math.min(1, sys.progress + dt / sys.duration);
    u.uProgress.value = sys.progress;
    u.uScale.value = (state.size.height * state.viewport.dpr) / visible(state.size).h;

    const speed = spin[sys.layout];
    if (speed === null) {
      // The wall must be straight: bring the rotation back to zero by the shortest way.
      sys.rot = ((((sys.rot + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
      sys.rot = damp(sys.rot, 0, 4, dt);
    } else {
      sys.rot += speed * dt;
    }
    sys.points.rotation.z = sys.rot;

    const [cx, cy] = target.current.center ?? [960, 540];
    sys.points.position.x = damp(sys.points.position.x, cx - 960, 3, dt);
    sys.points.position.y = damp(sys.points.position.y, 540 - cy, 3, dt);
  });

  return <primitive object={sys.points} />;
}

const RACK_COLS = 11;
const RACK_ROWS = 11;

function Racks({ spec }: { spec: StageSpec }) {
  const target = useRef(spec);
  target.current = spec;

  const mesh = useMemo(() => {
    const count = RACK_COLS * RACK_ROWS;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const order = new Float32Array(count);
    const ids = new Float32Array(count);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uHeat: { value: 0.5 } },
      vertexShader: racksVert,
      fragmentShader: racksFrag,
    });
    const m = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    const mid = (RACK_COLS - 1) / 2;
    const maxRank = RACK_ROWS - 1 + mid * 0.4;
    let i = 0;
    for (let r = 0; r < RACK_ROWS; r++) {
      for (let c = 0; c < RACK_COLS; c++) {
        dummy.position.set((c - mid) * 262, -470 + 170, 240 - r * 340);
        dummy.scale.set(150, 340, 150);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        const rank = r + Math.abs(c - mid) * 0.4;
        order[i] = rank === 0 ? 0 : 0.16 + 0.84 * (rank / maxRank);
        ids[i] = i;
        i++;
      }
    }
    geo.setAttribute('aOrder', new THREE.InstancedBufferAttribute(order, 1));
    geo.setAttribute('aId', new THREE.InstancedBufferAttribute(ids, 1));
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    m.visible = false;
    return m;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = (mesh.material as THREE.ShaderMaterial).uniforms;
    const goal = target.current.racks ?? 0;
    u.uTime.value += dt;
    // Slow rise (the room watches the racks multiply), quick exit.
    u.uAmount.value = damp(u.uAmount.value, goal, goal > u.uAmount.value ? 0.9 : 5, dt);
    u.uHeat.value = damp(u.uHeat.value, target.current.heat, 2, dt);
    mesh.visible = u.uAmount.value > 0.002;
  });

  return <primitive object={mesh} />;
}

export function Stage({ spec }: { spec: StageSpec }) {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: CAPTURE }}
      camera={{ fov: 37, position: [0, 0, CAM_Z], near: 20, far: 9000 }}
    >
      <color attach="background" args={['#000000']} />
      <Rig />
      <Backdrop spec={spec} />
      <Racks spec={spec} />
      <Tokens spec={spec} />
    </Canvas>
  );
}
