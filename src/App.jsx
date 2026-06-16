import React, { Suspense, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows, Html, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import "./style.css";

const MODEL_PATHS = {
  mannequin: "/models/mannequin.glb",
  dress: "/models/dress.glb",
  top: "/models/top.glb",
  skirt: "/models/skirt.glb"
};

function FallbackMannequin() {
  const material = new THREE.MeshStandardMaterial({ color: "#c79c7a", roughness: 0.55 });
  return (
    <group position={[0, -1.18, 0]}>
      <mesh material={material} position={[0, 2.72, 0]}><sphereGeometry args={[0.24, 48, 48]} /></mesh>
      <mesh material={material} position={[0, 1.82, 0]} scale={[0.46, 0.92, 0.26]}><capsuleGeometry args={[0.42, 1.15, 24, 48]} /></mesh>
      <mesh material={material} position={[-0.45, 1.82, 0]} rotation={[0, 0, -0.25]}><capsuleGeometry args={[0.055, 1.25, 16, 32]} /></mesh>
      <mesh material={material} position={[0.45, 1.82, 0]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.055, 1.25, 16, 32]} /></mesh>
      <mesh material={material} position={[-0.15, 0.48, 0]}><capsuleGeometry args={[0.07, 1.35, 16, 32]} /></mesh>
      <mesh material={material} position={[0.15, 0.48, 0]}><capsuleGeometry args={[0.07, 1.35, 16, 32]} /></mesh>
    </group>
  );
}

function LoadableModel({ url, fallback, materialOverride, scale = 1, position = [0, 0, 0] }) {
  try {
    const { scene } = useGLTF(url);
    const cloned = useMemo(() => scene.clone(true), [scene]);

    useMemo(() => {
      if (!materialOverride) return;
      cloned.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.material = materialOverride;
        }
      });
    }, [cloned, materialOverride]);

    return <primitive object={cloned} scale={scale} position={position} />;
  } catch {
    return fallback;
  }
}

function FallbackDress({ material, length }) {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh material={material} position={[0, 0.74, 0]} scale={[0.55, 0.72, 0.32]}>
        <capsuleGeometry args={[0.5, 0.74, 32, 64]} />
      </mesh>
      <mesh material={material} position={[0, -0.2 - (length - 1) * 0.18, 0]} scale={[0.85, 1.0 * length, 0.48]}>
        <coneGeometry args={[0.78, 1.45, 96, 2, true]} />
      </mesh>
    </group>
  );
}

function FallbackTop({ material }) {
  return (
    <mesh material={material} position={[0, 0.72, 0]} scale={[0.58, 0.72, 0.34]}>
      <capsuleGeometry args={[0.5, 0.7, 32, 64]} />
    </mesh>
  );
}

function FallbackSkirt({ material, length }) {
  return (
    <mesh material={material} position={[0, -0.28 - (length - 1) * 0.15, 0]} scale={[0.86, 0.92 * length, 0.5]}>
      <coneGeometry args={[0.78, 1.35, 96, 2, true]} />
    </mesh>
  );
}

function Clothing({ garment, color, fabricUrl, length }) {
  const texture = fabricUrl ? useTexture(fabricUrl) : null;
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.2, 2.2);
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    map: texture || null,
    roughness: 0.78,
    metalness: 0,
    sheen: 0.65,
    sheenRoughness: 0.9,
    side: THREE.DoubleSide
  }), [color, texture]);

  if (garment === "Top") return <LoadableModel url={MODEL_PATHS.top} materialOverride={material} fallback={<FallbackTop material={material} />} />;
  if (garment === "Skirt") return <LoadableModel url={MODEL_PATHS.skirt} materialOverride={material} fallback={<FallbackSkirt material={material} length={length} />} />;
  return <LoadableModel url={MODEL_PATHS.dress} materialOverride={material} fallback={<FallbackDress material={material} length={length} />} />;
}

function RotatingStand() {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.18; });
  return <group ref={ref} />;
}

function Scene(props) {
  return (
    <Canvas shadows camera={{ position: [0, 1.35, 4.8], fov: 35 }}>
      <color attach="background" args={["#ece8df"]} />
      <ambientLight intensity={0.75} />
      <directionalLight castShadow position={[3.5, 5, 3]} intensity={2.2} shadow-mapSize={[2048, 2048]} />
      <Suspense fallback={<Html center>Loading OSSEY Studio...</Html>}>
        <Environment preset="apartment" />
        <group>
          <LoadableModel url={MODEL_PATHS.mannequin} fallback={<FallbackMannequin />} />
          <group position={[0, 0.08, 0]}>
            <Clothing {...props} />
          </group>
        </group>
      </Suspense>
      <ContactShadows position={[0, -1.18, 0]} opacity={0.38} scale={7} blur={2.5} />
      <OrbitControls enablePan={false} minDistance={3.2} maxDistance={7} target={[0, 0.65, 0]} />
    </Canvas>
  );
}

function App() {
  const [garment, setGarment] = useState("Dress");
  const [color, setColor] = useState("#8b2f2f");
  const [fabricUrl, setFabricUrl] = useState(null);
  const [length, setLength] = useState(1);
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState([]);

  function uploadFabric(e) {
    const file = e.target.files?.[0];
    if (file) setFabricUrl(URL.createObjectURL(file));
  }

  function savePrototype() {
    setSaved([{ id: Date.now(), client: client || "Unnamed client", garment, color, notes }, ...saved]);
    setNotes("");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="mark">O</div><div><h1>OSSEY Studio</h1><p>Preview before sewing</p></div></div>
        <section className="card">
          <label>Client</label>
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name" />
          <label>Garment</label>
          <div className="tabs">
            {['Dress','Top','Skirt'].map(x => <button className={garment===x?'active':''} onClick={() => setGarment(x)} key={x}>{x}</button>)}
          </div>
          <label>Fabric color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <label>Upload real fabric / lace / pattern</label>
          <input type="file" accept="image/*" onChange={uploadFabric} />
          <label>Length adjustment</label>
          <input type="range" min="0.75" max="1.35" step="0.01" value={length} onChange={(e) => setLength(Number(e.target.value))} />
          <label>Sewing notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sleeves, neckline, measurements, changes..." />
          <button className="save" onClick={savePrototype}>Save prototype</button>
        </section>
        <section className="saved"><h2>Saved</h2>{saved.map(s => <div className="savedItem" key={s.id}><b>{s.client}</b><span>{s.garment}</span></div>)}</section>
      </aside>
      <main className="stage">
        <div className="topbar"><h2>{garment} preview</h2><p>Place real .glb models inside public/models for a more realistic OSSEY fitting preview.</p></div>
        <div className="viewer"><Scene garment={garment} color={color} fabricUrl={fabricUrl} length={length} /></div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
