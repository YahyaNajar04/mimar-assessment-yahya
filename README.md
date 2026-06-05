# mimar-assessment

Mimar — Frontend 3D Developer Assessment
Open [https://yahyanajar04.github.io/mimar-assessment-yahya/] to veiw the assessment.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for production

```bash
npm run build
```

Output is in the `dist/` folder.

## What's inside

- **500 instanced boxes** arranged in a 25×20 grid using `THREE.InstancedMesh` — zero individual `Mesh` objects.
- **Custom vertex + fragment shaders** (`ShaderMaterial`):
  - Per-instance color derived from instance index via an `InstancedBufferAttribute`, read entirely inside the vertex shader.
  - Mouse hover detection via raycasting; hovered box gets a shader-driven cyan tint + scale pulse.
  - **Bonus:** Fresnel-based edge highlight on the hovered box, computed in the fragment shader using the view direction and surface normal — no wireframe geometry, no post-processing.
- **Orbit camera** via `OrbitControls`.

## Written answers

See [ANSWERS.md](./ANSWERS.md) for all Part 1 written responses (Q1a–Q4c).

## Tech stack

- [Vite](https://vitejs.dev/) (build tool)
- [Three.js](https://threejs.org/) r165
- Vanilla JavaScript (ES modules) — no frameworks
