import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createInstancedGrid } from "./scene/createInstancedGrid";

//Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

//Camera Setup
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

//Orbital Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;

//Instanced Mesh Creation

const instanceMesh = createInstancedGrid();

scene.add(instanceMesh);

const material = instanceMesh.userData.material as THREE.ShaderMaterial;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-99, -99);
const hoverInfo = document.getElementById("hovered") as HTMLDivElement;

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;

  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

//Lighting Setup

const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

//Helper grid
const grid = new THREE.GridHelper(80, 80);
scene.add(grid);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

//Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  material.uniforms.uTime.value = time;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObject(instanceMesh);

  const hoveredId =
    hits.length > 0 && hits[0].instanceId !== undefined
      ? hits[0].instanceId
      : -1;

  material.uniforms.uHoveredIndex.value = hoveredId;
  if (hoveredId >= 0) {
    const col = hoveredId % 25;
    const row = Math.floor(hoveredId / 25);

    hoverInfo.textContent = `Instance ID: ${hoveredId} | Grid Position: (${col}, ${row})`;

    hoverInfo.style.opacity = "1";
  } else {
    hoverInfo.style.opacity = "0";
  }

  controls.update();

  renderer.render(scene, camera);
}

animate();
