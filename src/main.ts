import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {createInstancedGrid} from './scene/createInstancedGrid';


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

renderer.setPixelRatio(
  window.devicePixelRatio
);

document.body.appendChild(renderer.domElement);

//Page title and object info
const title = document.createElement("div")
title.textContent = "Mimar Tech - Instanced Building Grid";
title.style.position = "absolute";
title.style.top = "20px";
title.style.left = "20px";
title.style.color = "white";
title.style.fontWeight = "bold";
title.style.fontFamily = "Arial, sans-serif";
title.style.fontSize = "16px";
document.body.appendChild(title);

//Orbital Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;

//Cube TEST To check orbital 
/**
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
});

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

scene.add(cube);
**/

const instanceMesh = createInstancedGrid();

scene.add(instanceMesh);

const material =
  instanceMesh.userData.material as THREE.ShaderMaterial;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-99, -99);

window.addEventListener("mousemove", (event) => {
  mouse.x =
    (event.clientX / window.innerWidth) * 2 - 1;

  mouse.y =
    -(event.clientY / window.innerHeight) * 2 + 1;
});

//Lighting Setup

const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

//Helper grid
const grid = new THREE.GridHelper(
  80,
  80
);
scene.add(grid);

window.addEventListener("resize", () => {
  camera.aspect = 
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
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

  controls.update();

  renderer.render(scene, camera);
}

animate();
