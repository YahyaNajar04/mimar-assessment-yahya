attribute vec3 instanceColor;

uniform float uHoveredIndex;
uniform float uTime;

varying vec3 vColor;
varying float vHovered;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
    vColor = instanceColor;

    float isHovered =
        step(
            0.5,
            1.0 - abs(float(gl_InstanceID) - uHoveredIndex)
        );

    vHovered = isHovered;

    vec3 pos = position;

    if (isHovered > 0.5) {
        float pulse =
            1.0 + 0.12 * sin(uTime * 6.0);

        pos *= pulse;
    }

    vec4 worldPos =
        instanceMatrix *
        vec4(pos, 1.0);

    vWorldPos = worldPos.xyz;

    mat3 normalMat = mat3(instanceMatrix);

    vNormal =
        normalize(
            normalMat * normal
        );

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        worldPos;
}