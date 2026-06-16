import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { Move, Scissors, Ruler, Shirt, Save, Upload, Layers, Grid3X3, Undo2, Redo2 } from "lucide-react";
import "./style.css";

const garments = {
  Dress: {
    pieces: [
      { name: "Front Bodice", x: 135, y: 110, w: 120, h: 170, path: "M60 0 C25 20 18 70 30 140 C42 165 78 165 90 140 C102 70 95 20 60 0Z" },
      { name: "Back Bodice", x: 310, y: 110, w: 120, h: 170, path: "M60 0 C28 22 22 70 34 140 C46 162 74 162 86 140 C98 70 92 22 60 0Z" },
      { name: "Skirt Front", x: 120, y: 330, w: 160, h: 250, path: "M65 0 L95 0 L150 235 C105 250 55 250 10 235Z" },
      { name: "Skirt Back", x: 320, y: 330, w: 160, h: 250, path: "M65 0 L95 0 L150 235 C105 250 55 250 10 235Z" }
    ]
  },
  Top: {
    pieces: [
      { name: "Front", x: 150, y: 145, w: 140, h: 190, path: "M70 0 C20 35 18 115 38 175 L102 175 C122 115 120 35 70 0Z" },
      { name: "Back", x: 335, y: 145, w: 140, h: 190, path: "M70 0 C25 30 22 120 40 178 L100 178 C118 120 115 30 70 0Z" },
      { name: "Sleeve L", x: 125, y: 390, w: 115, h: 130, path: "M15 30 C45 -5 85 -5 110 30 L85 120 L35 120Z" },
      { name: "Sleeve R", x: 345, y: 390, w: 115, h: 130, path: "M15 30 C45 -5 85 -5 110 30 L85 120 L35 120Z" }
    ]
  },
  Skirt: {
    pieces: [
      { name: "Panel A", x: 135, y: 150, w: 150, h: 330, path: "M50 0 L100 0 L145 315 C100 330 50 330 5 315Z" },
      { name: "Panel B", x: 340, y: 150, w: 150, h: 330, path: "M50 0 L100 0 L145 315 C100 330 50 330 5 315Z" }
    ]
  }
};

function PatternCanvas({ type, color, fabric }) {
  const pieces = garments[type].pieces;
  return (
    <div className="pattern-board">
      <div className="ruler-x" />
      <div className="ruler-y" />
      <svg className="pattern-svg" viewBox="0 0 620 640">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
          </pattern>
          {fabric && (
            <pattern id="fabricPattern" width="90" height="90" patternUnits="userSpaceOnUse">
              <image href={fabric} width="90" height="90" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect width="620" height="640" fill="url(#grid)" />
        {pieces.map((p, i) => (
          <g key={p.name} transform={`translate(${p.x},${p.y})`} className="pattern-piece">
            <path d={p.path} fill={fabric ? "url(#fabricPattern)" : color} stroke="#21242c" strokeWidth="2.2" />
            <path d={p.path} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1" strokeDasharray="6 7" transform="scale(.90) translate(8 8)" />
            <text x="12" y="22" fontSize="12" fill="#1f242d" fontWeight="700">{p.name}</text>
            <circle cx="10" cy="10" r="4" fill="#2e6aff" />
            <circle cx={(p.w || 100) - 12} cy="12" r="4" fill="#2e6aff" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Avatar() {
  const skin = "#c99872";
  return (
    <group position={[0, -1.55, 0]}>
      <mesh position={[0, 3.05, 0]}><sphereGeometry args={[0.23, 48, 48]} /><meshStandardMaterial color={skin} roughness={0.55} /></mesh>
      <mesh position={[0, 2.25, 0]} scale={[0.38, 0.92, 0.24]}><capsuleGeometry args={[0.36, 1.2, 24, 48]} /><meshStandardMaterial color={skin} roughness={0.55} /></mesh>
      <mesh position={[-0.48, 2.18, 0]} rotation={[0, 0, -0.33]}><capsuleGeometry args={[0.06, 1.15, 16, 32]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[0.48, 2.18, 0]} rotation={[0, 0, 0.33]}><capsuleGeometry args={[0.06, 1.15, 16, 32]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[-0.15, 0.78, 0]} rotation={[0, 0, 0.02]}><capsuleGeometry args={[0.075, 1.55, 16, 32]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[0.15, 0.78, 0]} rotation={[0, 0, -0.02]}><capsuleGeometry args={[0.075, 1.55, 16, 32]} /><meshStandardMaterial color={skin} /></mesh>
    </group>
  );
}

function Garment3D({ type, color, fabric, length }) {
  const texture = useMemo(() => {
    if (!fabric) return null;
    const t = new THREE.TextureLoader().load(fabric);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.6, 2.6);
    return t;
  }, [fabric]);
  const mat = <meshPhysicalMaterial color={color} map={texture} roughness={0.82} sheen={0.7} side={THREE.DoubleSide} />;

  return (
    <group position={[0, -0.28, 0]}>
      {(type === "Dress" || type === "Top") && (
        <>
          <mesh position={[0, 0.92, 0]} scale={[0.48, 0.62, 0.26]}><capsuleGeometry args={[0.46, 0.9, 32, 64]} />{mat}</mesh>
          <mesh position={[-0.52, 0.94, 0]} rotation={[0, 0, -0.72]} scale={[1, 1, 0.8]}><capsuleGeometry args={[0.075, 0.62, 16, 32]} />{mat}</mesh>
          <mesh position={[0.52, 0.94, 0]} rotation={[0, 0, 0.72]} scale={[1, 1, 0.8]}><capsuleGeometry args={[0.075, 0.62, 16, 32]} />{mat}</mesh>
        </>
      )}
      {(type === "Dress" || type === "Skirt") && (
        <mesh position={[0, -0.15 - length * 0.16, 0]} scale={[0.64, 1 + length * 0.42, 0.34]}>
          <coneGeometry args={[0.82, 1.45, 96, 8, true]} />{mat}
        </mesh>
      )}
      <Html position={[0.82, 1.75, 0]} className="floating-label">3D Preview</Html>
    </group>
  );
}

function ThreeViewer(props) {
  return (
    <Canvas camera={{ position: [0, 1.15, 4.6], fov: 36 }} shadows>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={2} castShadow />
      <Environment preset="city" />
      <Avatar />
      <Garment3D {...props} />
      <ContactShadows position={[0, -1.55, 0]} opacity={0.35} scale={7} blur={2.3} />
      <OrbitControls enablePan={false} minDistance={3.2} maxDistance={6.5} />
    </Canvas>
  );
}

function App() {
  const [type, setType] = useState("Dress");
  const [color, setColor] = useState("#a71f3d");
  const [fabric, setFabric] = useState(null);
  const [length, setLength] = useState(0.4);

  const uploadFabric = (e) => {
    const file = e.target.files?.[0];
    if (file) setFabric(URL.createObjectURL(file));
  };

  return (
    <div className="workspace">
      <header className="top-menu">
        <div className="app-title"><span>OSSEY</span> Studio</div>
        <nav><button>File</button><button>Edit</button><button>Avatar</button><button>Garment</button><button>Fabric</button><button>Render</button></nav>
        <div className="top-actions"><Undo2 size={17}/><Redo2 size={17}/><button className="primary"><Save size={16}/> Save</button></div>
      </header>

      <aside className="left-tools">
        <button className="active"><Move /></button><button><Scissors /></button><button><Ruler /></button><button><Shirt /></button><button><Layers /></button><button><Grid3X3 /></button>
      </aside>

      <main className="split-view">
        <section className="panel-view two-d">
          <div className="view-head"><strong>2D Pattern Window</strong><span>Pattern pieces / cutting layout</span></div>
          <PatternCanvas type={type} color={color} fabric={fabric} />
        </section>
        <section className="panel-view three-d">
          <div className="view-head"><strong>3D Garment Window</strong><span>Avatar fitting preview</span></div>
          <ThreeViewer type={type} color={color} fabric={fabric} length={length} />
        </section>
      </main>

      <aside className="right-panel">
        <h3>Property Editor</h3>
        <label>Garment Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}><option>Dress</option><option>Top</option><option>Skirt</option></select>
        <label>Fabric Color</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label>Import Fabric Image</label><label className="upload"><Upload size={17}/> Upload fabric<input type="file" accept="image/*" onChange={uploadFabric}/></label>
        <label>Length Adjustment</label><input type="range" min="0" max="1" step="0.01" value={length} onChange={(e) => setLength(Number(e.target.value))}/>
        <div className="info-card"><strong>OSSEY note</strong><p>This version looks like the capture: 2D pattern area + 3D preview + professional fashion software interface.</p></div>
      </aside>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
