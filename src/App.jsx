import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./style.css";

function Mannequin() {
  const skin = "#d8b28c";
  const hair = "#24140f";

  return (
    <group position={[0, -1.2, 0]}>
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>

      <mesh position={[0, 3.16, -0.08]} scale={[1, 0.75, 0.65]}>
        <sphereGeometry args={[0.29, 32, 32]} />
        <meshStandardMaterial color={hair} roughness={0.8} />
      </mesh>

      <mesh position={[0, 2.65, 0]}>
        <capsuleGeometry args={[0.08, 0.24, 12, 24]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      <mesh position={[0, 1.95, 0]} scale={[0.48, 1.0, 0.28]}>
        <capsuleGeometry args={[0.42, 1.05, 16, 32]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      <mesh position={[-0.62, 2.0, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.07, 1.25, 16, 32]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      <mesh position={[0.62, 2.0, 0]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.07, 1.25, 16, 32]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      <mesh position={[-0.22, 0.62, 0]} rotation={[0, 0, 0.04]}>
        <capsuleGeometry args={[0.09, 1.45, 16, 32]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      <mesh position={[0.22, 0.62, 0]} rotation={[0, 0, -0.04]}>
        <capsuleGeometry args={[0.09, 1.45, 16, 32]} />
        <meshStandardMaterial color={skin} />
      </mesh>
    </group>
  );
}

function ClothingMaterial({ color, fabric }) {
  const texture = useMemo(() => {
    if (!fabric) return null;
    const tex = new THREE.TextureLoader().load(fabric);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.2, 2.2);
    return tex;
  }, [fabric]);

  return (
    <meshStandardMaterial
      color={color}
      map={texture}
      roughness={0.68}
      metalness={0.02}
      side={THREE.DoubleSide}
    />
  );
}

function Clothing({ type, color, fabric, length, flare }) {
  const material = <ClothingMaterial color={color} fabric={fabric} />;
  const long = length === "Long" ? 1.45 : length === "Midi" ? 1.15 : 0.78;
  const width = flare === "Wide" ? 0.95 : flare === "Slim" ? 0.58 : 0.75;

  if (type === "Top") {
    return (
      <group>
        <mesh position={[0, 1.95, 0]} scale={[0.66, 0.55, 0.36]}>
          <capsuleGeometry args={[0.52, 0.58, 16, 32]} />
          {material}
        </mesh>
      </group>
    );
  }

  if (type === "Skirt") {
    return (
      <mesh position={[0, 0.83 - long / 2, 0]} scale={[1, 1, 0.62]}>
        <coneGeometry args={[width, long, 96, 1, true]} />
        {material}
      </mesh>
    );
  }

  if (type === "Pants") {
    return (
      <group>
        <mesh position={[-0.18, 0.45, 0]} scale={[0.28, 1.15, 0.24]}>
          <capsuleGeometry args={[0.35, 1.35, 16, 32]} />
          {material}
        </mesh>
        <mesh position={[0.18, 0.45, 0]} scale={[0.28, 1.15, 0.24]}>
          <capsuleGeometry args={[0.35, 1.35, 16, 32]} />
          {material}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 1.88, 0]} scale={[0.67, 0.58, 0.36]}>
        <capsuleGeometry args={[0.52, 0.58, 16, 32]} />
        {material}
      </mesh>
      <mesh position={[0, 1.1 - long / 2, 0]} scale={[1, 1, 0.62]}>
        <coneGeometry args={[width, long, 96, 1, true]} />
        {material}
      </mesh>
    </group>
  );
}

function Scene(props) {
  return (
    <Canvas camera={{ position: [0, 1.6, 4.8], fov: 42 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.7} />
      <Environment preset="studio" />
      <Mannequin />
      <Clothing {...props} />
      <ContactShadows position={[0, -1.18, 0]} opacity={0.32} scale={8} blur={2.2} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={7} />
    </Canvas>
  );
}

function App() {
  const [type, setType] = useState("Dress");
  const [color, setColor] = useState("#1f78b4");
  const [fabric, setFabric] = useState(null);
  const [clientName, setClientName] = useState("");
  const [note, setNote] = useState("");
  const [length, setLength] = useState("Mini");
  const [flare, setFlare] = useState("Classic");
  const [saved, setSaved] = useState([]);

  function uploadFabric(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFabric(URL.createObjectURL(file));
  }

  function savePrototype() {
    const prototype = {
      id: Date.now(),
      clientName: clientName || "Client prototype",
      type,
      color,
      length,
      flare,
      note
    };
    setSaved([prototype, ...saved]);
    setClientName("");
    setNote("");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">O</div>
          <div>
            <h1>OSSEY Studio</h1>
            <p>Voir l’habit avant couture</p>
          </div>
        </div>

        <section className="panel">
          <label>Client name</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Ama" />

          <label>Clothing type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Dress</option>
            <option>Top</option>
            <option>Skirt</option>
            <option>Pants</option>
          </select>

          <label>Length</label>
          <select value={length} onChange={(e) => setLength(e.target.value)}>
            <option>Mini</option>
            <option>Midi</option>
            <option>Long</option>
          </select>

          <label>Shape</label>
          <select value={flare} onChange={(e) => setFlare(e.target.value)}>
            <option>Classic</option>
            <option>Slim</option>
            <option>Wide</option>
          </select>

          <label>Main color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

          <label>Upload fabric / pattern</label>
          <input type="file" accept="image/*" onChange={uploadFabric} />

          <label>Notes</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Measurements, sleeve style, fabric notes..." />

          <button onClick={savePrototype}>Save Prototype</button>
        </section>

        <section className="saved">
          <h2>Saved Prototypes</h2>
          {saved.length === 0 && <p>No prototype saved yet.</p>}
          {saved.map((item) => (
            <div className="saved-card" key={item.id}>
              <strong>{item.clientName}</strong>
              <span>{item.type} · {item.length} · {item.flare}</span>
            </div>
          ))}
        </section>
      </aside>

      <main className="viewer">
        <header className="topbar">
          <div>
            <h2>{type} Preview</h2>
            <p>Rotate, zoom, test fabric and validate before sewing.</p>
          </div>
        </header>
        <div className="canvas-wrap">
          <Scene type={type} color={color} fabric={fabric} length={length} flare={flare} />
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
