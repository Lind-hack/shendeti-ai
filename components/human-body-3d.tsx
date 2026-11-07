"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface HumanBody3DProps {
  conditions: string[];
  bmi?: number;
  height?: number;
  muscleMass?: number;
  onRegionClick?: (layer: AnatomyLayer, x: number, y: number) => void;
}

export type AnatomyLayer = "angiology" | "splanchnology" | "myology";

type HitPoint = {
  layer: AnatomyLayer;
  label: string;
  local: THREE.Vector3;
};

// Production serves meshopt-compressed .glb models from a separate static host;
// local dev falls back to the original .gltf files in public/models.
const MODELS_URL = process.env.NEXT_PUBLIC_MODELS_URL;
const modelPath = (id: AnatomyLayer) =>
  MODELS_URL ? `${MODELS_URL}/${id}/scene.glb` : `/models/${id}/scene.gltf`;

const layers: { id: AnatomyLayer; label: string; path: string }[] = [
  { id: "angiology", label: "Angiology", path: modelPath("angiology") },
  { id: "splanchnology", label: "Splanchnology", path: modelPath("splanchnology") },
  { id: "myology", label: "Myology", path: modelPath("myology") },
];

const layerLabels = layers.reduce<Record<AnatomyLayer, string>>((acc, layer) => {
  acc[layer.id] = layer.label;
  return acc;
}, {} as Record<AnatomyLayer, string>);


function normalizeModel(scene: THREE.Group) {
  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.55 / maxAxis;

  clone.position.set(-center.x * scale, -center.y * scale - 0.05, -center.z * scale);
  clone.scale.setScalar(scale);

  clone.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;
    }
  });

  return clone;
}

function AnatomyModels({
  activeLayer,
  onLayerPointClick,
}: {
  activeLayer: AnatomyLayer;
  onLayerPointClick: (hit: HitPoint) => void;
}) {
  const angiology = useGLTF(modelPath("angiology"));
  const splanchnology = useGLTF(modelPath("splanchnology"));
  const myology = useGLTF(modelPath("myology"));

  const layerRefs = useRef<Record<AnatomyLayer, THREE.Object3D | null>>({
    angiology: null,
    splanchnology: null,
    myology: null,
  });

  const models = useMemo(
    () => ({
      angiology: normalizeModel(angiology.scene),
      splanchnology: normalizeModel(splanchnology.scene),
      myology: normalizeModel(myology.scene),
    }),
    [angiology.scene, splanchnology.scene, myology.scene]
  );

  useLayoutEffect(() => {
    layerRefs.current.angiology = models.angiology;
    layerRefs.current.splanchnology = models.splanchnology;
    layerRefs.current.myology = models.myology;
  }, [models]);

  const handleModelClick = (layer: AnatomyLayer) => (event: ThreeEvent<MouseEvent>) => {
    if (activeLayer !== layer) return;

    event.stopPropagation();
    const activeObject = layerRefs.current[layer];
    const worldPoint = event.point.clone();
    const localPoint = activeObject ? activeObject.worldToLocal(worldPoint.clone()) : worldPoint;

    onLayerPointClick({
      layer,
      label: layerLabels[layer],
      local: localPoint,
    });
  };

  return (
    <group rotation={[0, Math.PI, 0]} position={[0, -0.08, 0]}>
      <primitive
        object={models.angiology}
        visible={activeLayer === "angiology"}
        onClick={handleModelClick("angiology")}
      />
      <primitive
        object={models.splanchnology}
        visible={activeLayer === "splanchnology"}
        onClick={handleModelClick("splanchnology")}
      />
      <primitive
        object={models.myology}
        visible={activeLayer === "myology"}
        onClick={handleModelClick("myology")}
      />
    </group>
  );
}

function CanvasFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
      Duke ngarkuar modelet anatomike...
    </div>
  );
}

export default function HumanBody3D({ onRegionClick }: HumanBody3DProps) {
  const [activeLayer, setActiveLayer] = useState<AnatomyLayer>("splanchnology");

  const handleLayerPointClick = (hit: HitPoint) => {
    onRegionClick?.(hit.layer, hit.local.x, hit.local.y);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-slate-50 via-[#eef4f8] to-slate-100">
      <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap gap-1 rounded-lg border border-white/70 bg-white/85 p-1 shadow-sm backdrop-blur">
        {layers.map((layer) => {
          const active = activeLayer === layer.id;

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayer(layer.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {layer.label}
            </button>
          );
        })}
      </div>

      <Canvas
        camera={{ position: [0, 0.18, 4.25], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#b7c8d8", 0.75]} />
        <directionalLight position={[-3, 4, 3]} intensity={1.25} castShadow />
        <directionalLight position={[3, 1, -2]} intensity={0.35} color="#dbeafe" />

        <Suspense fallback={null}>
          <AnatomyModels activeLayer={activeLayer} onLayerPointClick={handleLayerPointClick} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate
          rotateSpeed={0.65}
          autoRotate={true}
          autoRotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
          minPolarAngle={Math.PI * 0.16}
          maxPolarAngle={Math.PI * 0.86}
        />
      </Canvas>

      <Suspense fallback={<CanvasFallback />}>
        <PreloadSentinel />
      </Suspense>

    </div>
  );
}

function PreloadSentinel() {
  useGLTF(modelPath("angiology"));
  useGLTF(modelPath("splanchnology"));
  useGLTF(modelPath("myology"));
  return null;
}

layers.forEach((layer) => useGLTF.preload(layer.path));
