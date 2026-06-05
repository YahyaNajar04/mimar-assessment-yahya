import * as THREE from "three";

import vertexShader from "../shaders/vertex.glsl?raw";
import fragmentShader from "../shaders/fragment.glsl?raw";

const COUNT = 500;
const COLS = 25;
const ROWS = Math.ceil(COUNT / COLS);

const SPACING = 2.2;

const BOX_W = 1.4;
const BOX_H = 1.4;
const BOX_D = 1.4;

export function createInstancedGrid() {
  const geometry = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uHoveredIndex: {
        value: -1,
      },
      uTime: {
        value: 0,
      },
    },
  });

  const mesh = new THREE.InstancedMesh(geometry, material, COUNT);

  const colors = new Float32Array(COUNT * 3);

  const dummy = new THREE.Object3D();

  for (let i = 0; i < COUNT; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    dummy.position.set(
      (col - (COLS - 1) / 2) * SPACING,
      BOX_H / 2,
      (row - (ROWS - 1) / 2) * SPACING,
    );

    dummy.updateMatrix();

    mesh.setMatrixAt(i, dummy.matrix);

    const t = i / COUNT;

    const hue = (t * 260 + 180) % 360;

    const sat = 0.6 + 0.4 * Math.sin(i * 0.31);

    const light = 0.45 + 0.25 * Math.cos(i * 0.17);

    const color = new THREE.Color().setHSL(hue / 360, sat, light);

    colors[i * 3] = color.r;

    colors[i * 3 + 1] = color.g;

    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute(
    "instanceColor",
    new THREE.InstancedBufferAttribute(colors, 3),
  );

  mesh.userData.material = material;

  return mesh;
}
