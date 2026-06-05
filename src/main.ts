import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

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

//Box grid arrangment
const geometry = 
  new THREE.BoxGeometry(
    1,
    1,
    1
  );

  const material = new THREE.MeshStandardMaterial();

  const instanceMesh = 
    new THREE.InstancedMesh(
      geometry,
      material,
      500
    )

scene.add(instanceMesh);

//Lighting Setup

const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

//Helper grid
const grid = new THREE.GridHelper(
  50,
  50
);
scene.add(grid);

//Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
