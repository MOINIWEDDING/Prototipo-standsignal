// components/catalog/ProductModel3D.tsx
"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { BUILD, PRODUCTS, type ProductKey } from "@/lib/nfc3d/builders";

const CAM = { fov: 30, y: 1.02, z: 2.95, look: 0.02 };
const FLOOR_Y = -0.7;
const TARGET_D = 1.05;
const SPIN = 0.255; // rad/s

export default function ProductModel3D({
  productKey,
  className,
  shadow = true,
}: {
  productKey: ProductKey;
  className?: string;
  shadow?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const meta = PRODUCTS.find((p) => p.key === productKey)!;
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      container.removeChild(canvas);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = shadow;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // @ts-ignore — outputEncoding existe en three@0.128 (r128), deprecado en versiones más nuevas
    if ("outputEncoding" in renderer) (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM.fov, 1, 0.1, 100);
    camera.position.set(0, CAM.y, CAM.z);
    camera.lookAt(0, CAM.look, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.85);
    key.position.set(2.4, 3.6, 2.6);
    key.castShadow = shadow;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -1.35; key.shadow.camera.right = 1.35;
    key.shadow.camera.top = 1.35; key.shadow.camera.bottom = -1.35;
    key.shadow.camera.near = 0.8; key.shadow.camera.far = 14;
    key.shadow.bias = -0.0006;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xdfe7ef, 0.52);
    fill.position.set(-3.0, 1.2, 2.2); scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.8);
    rim.position.set(-1.6, 2.2, -3.0); scene.add(rim);

    scene.add(new THREE.HemisphereLight(0xdae4ee, 0x090b0e, 0.5));
    scene.add(new THREE.AmbientLight(0xffffff, 0.13));

    if (shadow) {
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.4 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = FLOOR_Y;
      floor.receiveShadow = true;
      scene.add(floor);
    }

    const pivot = new THREE.Group();
    const tilt = new THREE.Group();
    const outer = new THREE.Group();
    const model = BUILD[productKey]();

    outer.add(model);
    outer.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3());
    model.position.sub(c);
    outer.updateMatrixWorld(true);
    const sph = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
    outer.scale.setScalar((TARGET_D / (sph.radius * 2)) * meta.scale);

    tilt.rotation.x = meta.tilt;
    tilt.add(outer);
    pivot.add(tilt);
    scene.add(pivot);

    let raf = 0;
    let last = performance.now();
    let visible = true;
    let paused = false;

    function resize() {
      const r = container!.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (paused || !visible) return;
      pivot.rotation.y += SPIN * dt;
      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 });
    io.observe(container);

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          const mat = m.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else mat.dispose();
        }
      });
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [productKey, shadow]);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
