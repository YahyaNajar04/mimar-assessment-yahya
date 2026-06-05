# ANSWERS.md - Mimar 3D Development Assessment

## Q1 - Vertex Displacement & Normals

### Q1a

```glsl
float displacement = sin(uTime * 2.0) * 0.1;
vec3 displacedPosition = position + normal * displacement;
gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
```

### Q1b

`position` — Position represents the original vertex position in object space.

`normal` — Normal is a unit vector perpendicular to the mesh surface at that vertex. Using it as the displacement direction ensures each vertex moves directly away from or into the surface, regardless of the mesh's shape, rather than all vertices moving along a single global axis. This is what produces a uniform outward expansion rather than a shear or stretch.

`uTime` — This is a continuously increasing uniform passed from JavaScript to the shader which drives the animation.

`sin(uTime * 2.0)` — The sine function generates a smooth oscillation between -1 and 1. The multiplier 2.0 controls the animation speed. Larger values make the breathing/pulsing effect faster.

`* 0.1` — This controls the displacement amplitude. A value of 0.1 means vertices move up to 0.1 units inward or outward from their original position.

`position + normal * displacement` — This moves each vertex along its normal direction. Positive values expand the mesh while negative values contract it, which produces a smooth breathing effect.

### Q1c

The vertex normals stored in the geometry are computed for the original un-displaced mesh. After displacement each vertex is in a different position, hence the surface geometry changes. This means the lighting model is evaluating incorrectly, which may cause flat or broken shading.

**Fix 1 — Recompute the normals based on the displaced geometry.**
Express the displacement as a differentiable function of the vertex's UV coordinates, then compute the partial derivatives of the displaced position with respect to U and V. The cross product of those two tangent vectors gives the correct new normal at that displaced position. This is exact but requires the displacement function to be expressible in closed form.

**Fix 2 — Finite Differences.**
Evaluate the displacement at two nearby UV offsets `(u + ε, v)` and `(u, v + ε)`, compute the world-space positions those would produce, and derive the new normal from the cross product of the resulting difference vectors. This approximation works for any displacement function, including ones based on noise, and is the standard approach used in procedural terrain shaders. The epsilon should be small but not so small that floating-point precision degrades the result.

---

## Q2 - Performance Diagnosis

### Q2a

1. **Excessive Draw Calls** — Rendering thousands of individual meshes creates significant CPU overhead because each call requires validation and communication with the GPU.

2. **Scene graph traversal and matrix updates** — With a very large number of objects, the cost of matrix updates, visibility checks, and hierarchy traversal every frame increases significantly.

3. **Per-object JavaScript update logic** — Animations, transforms, raycasting, or update loops executed for each object every frame can heavily load the CPU.

4. **Garbage collection pressure** — Creating temporary vectors, arrays, matrices, or objects can trigger pauses in garbage collection.

5. **Brute-force raycasting** — Testing thousands of objects individually every frame is very expensive without spatial acceleration.

### Q2b

1. Using techniques like `InstancedMesh`, batching, and geometry merging can reduce thousands of draw calls to one or a few depending on the technique used.

2. Reducing node counts by instancing, merging static geometry, and flattening deep hierarchies.

3. Move per-object animation into shaders using uniforms. For objects that don't animate, set `matrixAutoUpdate = false` and call `updateMatrix()` once at load time. This eliminates the per-frame JS cost entirely for static geometry.

4. Declare `Vector3`, `Matrix4`, and similar objects once outside the render loop and call `.set()` or `.copy()` on them each frame rather than using `new`. This prevents the allocations that trigger garbage collection.

5. Excessive raycasting should be avoided. Instead, spatial partitioning, layer filtering, and BVH acceleration structures can be used, while raycasting should only be used when necessary.

---

## Q3 - Shader Debugging

### Q3a

The shader distorts the texture horizontally using a sine wave varying along the vertical axis. The wave has a total of 20 cycles across the mesh height and the phase advances over time using uTime making the pattern animate continuously. The horizontal shift is capped at ±0.05 UV units. The result is a continuously moving ripple like water effect.

### Q3b

The seam appears at `uv.x = 0.0` (the left edge, which wraps to `uv.x = 1.0` on the right edge). The displacement pushes the UV coordinates outside the valid [0,1] range. When sampling occurs outside the expected texture region, wrapping or clamping behaviour creates a discontinuity which becomes visible.

### Q3c

**Fix 1 — Wrap the displaced UV using `fract()`.**
After computing the displaced coordinate, apply `uv.x = fract(uv.x);` before passing it to `texture2D`. `fract()` returns only the fractional part of a value, so any result below 0.0 or above 1.0 is mapped back into the valid [0, 1) range. This means a displaced UV of -0.03 becomes 0.97, sampling the opposite edge of the texture smoothly instead of clamping. `texture.wrapS = THREE.RepeatWrapping` must also be set so the GPU sampler's own behaviour at the boundary is consistent with what the shader is doing.

**Fix 2 — Attenuate the displacement near the edges.**
Multiply the sine offset by a `smoothstep` factor that fades to zero within a small margin of `uv.x = 0.0` and `uv.x = 1.0`. For example:

```glsl
uv.x += sin(uv.y * 20.0 + uTime) * 0.05 * smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x);
```

This prevents the displaced UV from ever crossing the boundary. The tradeoff is that the wave effect is suppressed near the left and right edges of the mesh.

---

## Q4 - Instanced Rendering

### Q4a

The naive approach is to create one `THREE.Mesh` for each box, meaning 10,000 individual objects added to the scene. Each mesh has its own draw call; the CPU must set the shaders, upload the model matrix, and call the WebGL draw command once per object per frame. With 10,000 objects there are 10,000 draw calls. The CPU and driver submitting this many commands saturates the thread and starves the GPU before rendering. Frame time is therefore dominated by command submission rather than actual rendering.

### Q4b

`THREE.InstancedMesh` renders all 10,000 boxes using only one draw call. Each instance's transform is stored in an instance matrix buffer and uploaded to the GPU at once. Per-instance data like color is added using `InstancedBufferAttribute`. In the vertex shader, `gl_InstanceID` indexes into the buffers to read the correct transform and attributes for each instance. The GPU executes this using `drawElementsInstanced` without any CPU involvement per instance. The CPU still pays the cost of one draw call regardless of how many instances are present.

### Q4c

**Limitation 1 — Shared geometry and material.**
When using `InstancedMesh`, only boxes which share the same shape and shader can be batched together. For each different shader or shape, separate instanced batches are needed, which reintroduces multiple draw calls.

**Limitation 2 — High frame update cost at high counts.**
Changing one instance's matrix still requires uploading the full `instanceMatrix` buffer. For scenarios with thousands of moving instances updating every frame, a GPU-driven approach scales better than CPU-side instancing.     