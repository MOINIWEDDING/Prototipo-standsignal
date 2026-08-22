// lib/nfc3d/builders.ts
//
// Geometrías paramétricas de los 8 productos de la línea NFC, portadas
// del catálogo original (Three.js r128) a un módulo TS reutilizable.
// Cada builder devuelve un THREE.Group en su pose natural — la escala y
// el centrado se normalizan después, en ProductModel3D.

import * as THREE from "three";

export type ProductKey =
  | "tag" | "tagHang" | "card" | "stand" | "keychain" | "wristband" | "sticker" | "ring";

export type ProductMeta = { key: ProductKey; name: string; spec: string; scale: number; tilt: number };

export const PRODUCTS: ProductMeta[] = [
  { key: "tag", name: "NFC Tag", spec: "Disco rígido 25 mm · control de activos", scale: 0.72, tilt: 0.52 },
  { key: "tagHang", name: "NFC Tag Colgante", spec: "Orificio central · llavero o mascota", scale: 0.72, tilt: 0.52 },
  { key: "card", name: "NFC Card", spec: "Formato CR80 · 85,6 × 54 mm", scale: 1.0, tilt: 0.48 },
  { key: "stand", name: "NFC Stand", spec: "Base de mostrador · zona de contacto", scale: 1.0, tilt: 0.0 },
  { key: "keychain", name: "NFC Keychain", spec: "Disco Ø30 mm · bisel y argolla partida", scale: 0.84, tilt: 0.5 },
  { key: "wristband", name: "NFC Wristband", spec: "Silicona flexible · resistente al agua", scale: 0.96, tilt: 0.36 },
  { key: "sticker", name: "NFC Sticker", spec: "Etiqueta ultrafina · adhesivo permanente", scale: 0.86, tilt: 0.44 },
  { key: "ring", name: "NFC Ring", spec: "Anillo cerámico · uso diario", scale: 0.62, tilt: 0.08 },
];

/* ---------------------------- geometría base ---------------------------- */
function roundedRectShape(w: number, h: number, r: number) {
  const x = -w / 2, y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function circleShape(r: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, 0, Math.PI * 2, false);
  return s;
}
function circleHole(shape: THREE.Shape, r: number, cx: number, cy: number) {
  const h = new THREE.Path();
  h.absarc(cx, cy, r, 0, Math.PI * 2, true);
  shape.holes.push(h);
  return shape;
}
function extrude(shape: THREE.Shape, depth: number, bt: number, bs: number, seg?: number, curve?: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs,
    bevelSegments: seg || 3, curveSegments: curve || 64, steps: 1,
  });
  g.computeVertexNormals();
  return g;
}
function topZ(obj: THREE.Object3D) {
  obj.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(obj).max.z;
}
function makeMat(kind: "gloss" | "soft" | "matte") {
  if (kind === "gloss") {
    return new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.0, clearcoat: 0.65, clearcoatRoughness: 0.16 });
  }
  if (kind === "soft") {
    return new THREE.MeshStandardMaterial({ color: 0xf7f8f9, roughness: 0.78, metalness: 0.0 });
  }
  return new THREE.MeshStandardMaterial({ color: 0xfafbfc, roughness: 0.46, metalness: 0.0 });
}
function mesh(geo: THREE.BufferGeometry, mat: THREE.Material) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* ---------------------------- 8 builders ---------------------------- */
export const BUILD: Record<ProductKey, () => THREE.Group> = {
  tag() {
    const g = new THREE.Group(), matte = makeMat("matte"), gloss = makeMat("gloss");
    const body = mesh(extrude(circleShape(12.5), 1.0, 0.16, 0.2, 4, 96), gloss);
    g.add(body);
    const z = topZ(body);
    const coil = mesh(new THREE.TorusGeometry(7.6, 0.16, 12, 128), matte);
    coil.position.z = z - 0.1; g.add(coil);
    const coil2 = mesh(new THREE.TorusGeometry(6.5, 0.14, 12, 128), matte);
    coil2.position.z = z - 0.12; g.add(coil2);
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  tagHang() {
    const g = new THREE.Group(), matte = makeMat("matte"), gloss = makeMat("gloss");
    const sh = circleHole(circleShape(12.5), 1.9, 0, 0);
    const body = mesh(extrude(sh, 1.0, 0.16, 0.2, 4, 96), gloss);
    g.add(body);
    const z = topZ(body);
    const coil = mesh(new THREE.TorusGeometry(8.4, 0.16, 12, 128), matte);
    coil.position.z = z - 0.1; g.add(coil);
    const coil2 = mesh(new THREE.TorusGeometry(7.1, 0.14, 12, 128), matte);
    coil2.position.z = z - 0.12; g.add(coil2);
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  card() {
    const g = new THREE.Group(), gloss = makeMat("gloss");
    const body = mesh(extrude(roundedRectShape(85.6, 54, 3.18), 0.6, 0.12, 0.14, 4, 24), gloss);
    g.add(body);
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  stand() {
    const g = new THREE.Group(), matte = makeMat("matte"), gloss = makeMat("gloss");
    const base = mesh(extrude(roundedRectShape(76, 50, 0.6), 1.6, 0.2, 0.22, 2, 6), matte);
    base.rotation.x = -Math.PI / 2;
    base.position.set(0, 0, 0);
    g.add(base);
    const panel = mesh(extrude(roundedRectShape(76, 120, 0.6), 1.6, 0.2, 0.22, 2, 6), gloss);
    panel.rotation.x = -0.20944;
    panel.position.set(0, 60.48, 11.55);
    g.add(panel);
    return g;
  },
  keychain() {
    const g = new THREE.Group(), gloss = makeMat("gloss"), matte = makeMat("matte");
    const body = mesh(extrude(circleShape(15), 2.6, 0.6, 0.65, 5, 128), gloss);
    g.add(body);
    const bezel = mesh(new THREE.TorusGeometry(14.9, 0.95, 14, 160), matte);
    bezel.position.z = 1.3; g.add(bezel);
    const tab = mesh(extrude(circleHole(roundedRectShape(7.5, 9, 2.4), 1.7, 0, 1.0), 1.6, 0.3, 0.32, 4, 24), matte);
    tab.position.set(0, 19, 0.5); g.add(tab);
    const ring = mesh(new THREE.TorusGeometry(8.0, 1.0, 16, 128), matte);
    ring.position.set(0, 28.0, 1.3); g.add(ring);
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  wristband() {
    const g = new THREE.Group(), soft = makeMat("soft"), matte = makeMat("matte");
    const sh = circleHole(circleShape(34), 31.4, 0, 0);
    const band = mesh(extrude(sh, 11, 0.5, 0.55, 4, 128), soft);
    g.add(band);
    const pad = mesh(extrude(roundedRectShape(19, 5.0, 2.2), 8, 0.7, 0.7, 4, 20), soft);
    pad.position.set(0, 32.6, 1.5); g.add(pad);
    const seam = mesh(new THREE.TorusGeometry(32.7, 0.22, 10, 160), matte);
    seam.position.z = topZ(band) - 0.3; g.add(seam);
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  sticker() {
    const g = new THREE.Group(), matte = makeMat("matte");
    const liner = mesh(extrude(roundedRectShape(46, 46, 3), 0.35, 0.1, 0.12, 2, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1f3f5, roughness: 0.88, metalness: 0 }));
    g.add(liner);
    const geo = new THREE.RingGeometry(0.15, 17, 128, 26);
    const pos = geo.attributes.position;
    const x0 = 1.5, R = 17;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      if (x > x0) {
        const t = Math.min(1, (x - x0) / (R - x0));
        pos.setZ(i, 9.2 * Math.pow(t, 2.15));
        pos.setX(i, x0 + (x - x0) * (1 - 0.3 * t * t));
        pos.setY(i, y * (1 - 0.035 * t * t));
      }
    }
    geo.computeVertexNormals();
    const label = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x9fb4c4, roughness: 0.34, metalness: 0, side: THREE.DoubleSide }));
    label.castShadow = true; label.receiveShadow = true;
    label.position.z = topZ(liner) + 0.06;
    g.add(label);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(9.4, 0.1, 8, 96), new THREE.MeshStandardMaterial({ color: 0xb4c6d3, roughness: 0.7, metalness: 0 }));
    coil.position.z = label.position.z + 0.14;
    g.add(coil);
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  ring() {
    const g = new THREE.Group();
    const p = [
      [9.55, -3.9], [9.55, 3.9], [10.2, 4.25], [11.15, 3.6],
      [11.72, 1.9], [11.85, 0], [11.72, -1.9], [11.15, -3.6],
      [10.2, -4.25], [9.55, -3.9],
    ].map((v) => new THREE.Vector2(v[0], v[1]));
    const geo = new THREE.LatheGeometry(p, 160);
    geo.computeVertexNormals();
    const m = mesh(geo, makeMat("gloss"));
    g.add(m);
    g.rotation.x = Math.PI / 2;
    return g;
  },
};
