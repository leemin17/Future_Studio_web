import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';

// 1. Component hiển thị Model thật từ file GLTF/GLB
const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
};

// 2. Component khối 3D mặc định (Dành cho sản phẩm chưa có file 3D)
const Placeholder = () => (
  <mesh>
    <torusKnotGeometry args={[1, 0.3, 128, 16]} />
    <meshStandardMaterial color="#5ccba3" wireframe />
  </mesh>
);

interface ModelViewerProps {
  modelUrl?: string; // Ví dụ: 'models/product1.glb'
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1, backgroundColor: '#d1a5a5', borderRadius: '8px', cursor: 'grab', overflow: 'hidden', display: 'flex' }}>
      {/* Môi trường không gian Canvas 3D */}
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 50, near: 0.01, far: 2000 }}>
        <Suspense fallback={null}>
          {/* 
            Tùy chỉnh bóng đổ: 
            - type: 'contact' (Bóng áp sát mặt sàn)
            - opacity: 1 (Độ đậm tối đa)
            - blur: 1 (Giảm độ nhòe để bóng sắc nét)
          */}
          <Stage environment="city" intensity={0.8} adjustCamera={1.2} shadows={{ type: 'contact', opacity: 1, blur: 1, color: '#000000' }}>
            {modelUrl ? <Model url={modelUrl} /> : <Placeholder />}
          </Stage>
        </Suspense>
        {/* Controls cho phép chuột xoay 360 độ, zoom và tự động xoay cực chậm khi không chạm */}
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} makeDefault />
      </Canvas>

      {/* Hướng dẫn người dùng xoay mô hình */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(255, 255, 255, 0.4)', color: '#111111', fontSize: '11px', fontWeight: 800, padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none', userSelect: 'none', backdropFilter: 'blur(4px)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
        Kéo để xoay
      </div>
    </div>
  );
};

export default ModelViewer;