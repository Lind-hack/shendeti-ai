"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Condition {
  id: number;
  label: string;
  severity: "high" | "medium";
  position: { x: number; y: number; z: number };
}

interface TooltipState {
  condition: Condition;
  x: number;
  y: number;
}

interface Props {
  conditions: Condition[];
  patientName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BodyViewer3D({ conditions }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth || 420;
    const H = el.clientHeight || 420;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Scene + Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.z = 3.2;

    // ── Lighting ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.10);
    keyLight.position.set(-1.5, 2.5, 2.0);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.38);
    fillLight.position.set(2.0, -1.0, -2.0);
    scene.add(fillLight);

    // ── Shared body material ──────────────────────────────────────────────────
    const BM = new THREE.MeshPhongMaterial({
      color: 0xd0d8e8,
      specular: 0x8899bb,
      shininess: 52,
    });

    // ── Body group ─────────────────────────────────────────────────────────────
    const body = new THREE.Group();
    scene.add(body);

    // Geometry shortcuts
    const S = (r: number, s = 24) => new THREE.SphereGeometry(r, s, s);
    const C = (rT: number, rB: number, h: number, s = 28) =>
      new THREE.CylinderGeometry(rT, rB, h, s);
    const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

    // Add a body-material mesh to the body group at a given position
    const add = (geo: THREE.BufferGeometry, x: number, y: number, z = 0): THREE.Mesh => {
      const m = new THREE.Mesh(geo, BM);
      m.position.set(x, y, z);
      body.add(m);
      return m;
    };

    // ── HEAD ──────────────────────────────────────────────────────────────────
    add(S(0.115, 32), 0, 0.820);

    // ── NECK ──────────────────────────────────────────────────────────────────
    add(C(0.052, 0.060, 0.120, 20), 0, 0.700);
    add(S(0.052, 18), 0, 0.760);   // neck top cap
    add(S(0.060, 18), 0, 0.640);   // neck base

    // ── TRAPEZIUS FILLER ──────────────────────────────────────────────────────
    // Smooth blob bridging neck → chest/shoulders
    add(S(0.130, 28), 0, 0.622);

    // ── CHEST ─────────────────────────────────────────────────────────────────
    // top=0.620, bottom=0.350, center=0.485, h=0.270 — wider at top (shoulders)
    add(C(0.188, 0.168, 0.270, 32), 0, 0.485);
    add(S(0.190, 26), 0, 0.620);   // chest-top cap (blends into trapezius)

    // ── ABS ───────────────────────────────────────────────────────────────────
    // top=0.350, bottom=0.100, center=0.225, h=0.250
    add(C(0.168, 0.160, 0.250, 32), 0, 0.225);

    // ── PELVIS ────────────────────────────────────────────────────────────────
    // top=0.100, bottom=-0.100, center=0.000, h=0.200 — widens at bottom (hips)
    add(C(0.162, 0.180, 0.200, 32), 0, 0.000);
    add(S(0.180, 28), 0, -0.100); // pelvis bottom / hip cap

    // ── SHOULDERS ─────────────────────────────────────────────────────────────
    add(S(0.078, 24), -0.220, 0.572);
    add(S(0.078, 24),  0.220, 0.572);

    // ── ARMS ──────────────────────────────────────────────────────────────────
    for (const s of [-1, 1]) {
      // Group origin = shoulder joint; rotation creates A-pose
      const armG = new THREE.Group();
      armG.position.set(s * 0.220, 0.572, 0);
      armG.rotation.z = s * -0.22;
      body.add(armG);

      const am = (geo: THREE.BufferGeometry, ly: number, lz = 0) => {
        const m = new THREE.Mesh(geo, BM);
        m.position.set(0, ly, lz);
        armG.add(m);
        return m;
      };

      // Upper arm — cylinder centered at local y=-0.14
      am(C(0.055, 0.048, 0.280, 24), -0.140);
      am(S(0.055, 22), 0.000);    // shoulder cap
      am(S(0.060, 22), -0.280);   // elbow (slightly larger for natural bump)

      // Forearm sub-group attached at elbow
      const fG = new THREE.Group();
      fG.position.y = -0.280;
      fG.rotation.z = s * 0.05;  // slight splay
      armG.add(fG);

      const fm = (geo: THREE.BufferGeometry, ly: number, lz = 0) => {
        const m = new THREE.Mesh(geo, BM);
        m.position.set(0, ly, lz);
        fG.add(m);
        return m;
      };

      fm(C(0.043, 0.034, 0.240, 22), -0.120);
      fm(S(0.043, 20), 0.000);    // forearm top
      fm(S(0.034, 18), -0.240);   // wrist
      fm(S(0.042, 16), -0.282);   // palm sphere
      // Finger box
      const hb = new THREE.Mesh(B(0.078, 0.032, 0.028), BM);
      hb.position.set(0, -0.315, 0.010);
      fG.add(hb);
    }

    // ── LEGS ──────────────────────────────────────────────────────────────────
    for (const s of [-1, 1]) {
      const lx = s * 0.105;

      // Hip sphere (thigh top cap)
      add(S(0.086, 22), lx, -0.100);

      // Thigh — no end caps; hip sphere and knee sphere serve as caps
      // top=-0.100, bottom=-0.580, center=-0.340, h=0.480
      add(C(0.082, 0.070, 0.480, 28), lx, -0.340);

      // Knee sphere
      add(S(0.074, 22), lx, -0.580);

      // Shin — no end caps; knee sphere and ankle sphere serve as caps
      // top=-0.580, bottom=-0.900, center=-0.740, h=0.320
      add(C(0.058, 0.042, 0.320, 24), lx, -0.740);

      // Ankle sphere
      add(S(0.046, 18), lx, -0.900);

      // Foot — elongated box extended forward on Z
      const foot = new THREE.Mesh(B(0.065, 0.038, 0.155), BM);
      foot.position.set(lx, -0.928, 0.048);
      body.add(foot);
    }

    // ── MARKERS ───────────────────────────────────────────────────────────────
    const highMat = new THREE.MeshPhongMaterial({
      color: 0xff2222,
      emissive: 0xff0000,
      emissiveIntensity: 0.65,
      shininess: 90,
    });
    const medMat = new THREE.MeshPhongMaterial({
      color: 0xf5c000,
      emissive: 0xffaa00,
      emissiveIntensity: 0.45,
      shininess: 90,
    });

    const markerMeshes: THREE.Mesh[] = [];
    const condMap = new Map<THREE.Mesh, Condition>();

    for (const cond of conditions) {
      const mat = cond.severity === "high" ? highMat : medMat;
      const m = new THREE.Mesh(S(0.028, 16), mat);
      m.position.set(cond.position.x, cond.position.y, cond.position.z);
      body.add(m);
      markerMeshes.push(m);
      condMap.set(m, cond);
    }

    // ── Raycasting / hover ────────────────────────────────────────────────────
    const rc = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let prevHit = false;

    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      rc.setFromCamera(mouse, camera);
      const hits = rc.intersectObjects(markerMeshes);
      if (hits.length > 0) {
        const cond = condMap.get(hits[0].object as THREE.Mesh);
        if (cond) {
          setTooltip({
            condition: cond,
            x: e.clientX - rect.left + 14,
            y: e.clientY - rect.top - 10,
          });
          renderer.domElement.style.cursor = "pointer";
          prevHit = true;
        }
      } else if (prevHit) {
        setTooltip(null);
        renderer.domElement.style.cursor = "default";
        prevHit = false;
      }
    };

    renderer.domElement.addEventListener("mousemove", onMove);

    // ── Responsive resize ─────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw > 0 && ch > 0) {
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
      }
    });
    ro.observe(el);

    // ── Animation loop ────────────────────────────────────────────────────────
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      body.rotation.y += 0.008; // ~10s per full rotation
      const t = performance.now() * 0.003;
      markerMeshes.forEach((m, i) => {
        m.scale.setScalar(1.0 + 0.32 * Math.sin(t + i * 1.1));
      });
      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("mousemove", onMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      BM.dispose();
      highMat.dispose();
      medMat.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [conditions]);

  return (
    <div className="flex flex-col w-full select-none">
      {/* 3D canvas */}
      <div
        ref={mountRef}
        className="relative w-full"
        style={{
          height: 420,
          background: "linear-gradient(180deg, #f0f4fa 0%, #e8eef6 100%)",
        }}
      >
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 min-w-[152px]">
              <p className="text-sm font-semibold text-gray-800 leading-snug">
                {tooltip.condition.label}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      tooltip.condition.severity === "high" ? "#ff2222" : "#f5c000",
                  }}
                />
                <span className="text-xs text-gray-500">
                  {tooltip.condition.severity === "high"
                    ? "Severe Injury"
                    : "Moderate Condition"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 bg-white border-t border-gray-100">
        <LegendDot color="#ff2222" label="Severe Injury" />
        <LegendDot color="#f5c000" label="Moderate Condition" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}88` }}
      />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

// ─── Demo App export ──────────────────────────────────────────────────────────

const sampleConditions: Condition[] = [
  {
    id: 1,
    label: "Left Knee Fracture",
    severity: "high",
    position: { x: 0.18, y: -0.62, z: 0.08 },
  },
  {
    id: 2,
    label: "Right Shoulder Strain",
    severity: "medium",
    position: { x: -0.32, y: 0.50, z: 0.05 },
  },
  {
    id: 3,
    label: "Lumbar Disc Injury",
    severity: "high",
    position: { x: 0.00, y: 0.08, z: -0.12 },
  },
  {
    id: 4,
    label: "Left Ankle Sprain",
    severity: "medium",
    position: { x: 0.14, y: -0.88, z: 0.06 },
  },
];

export function App() {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-sm">
        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">
            3D Body Viewer
          </p>
          <h2 className="text-xl font-bold text-gray-800">Driton Haliti</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {sampleConditions.length} active conditions
          </p>
        </div>

        <BodyViewer3D conditions={sampleConditions} patientName="Driton Haliti" />
      </div>
    </div>
  );
}
