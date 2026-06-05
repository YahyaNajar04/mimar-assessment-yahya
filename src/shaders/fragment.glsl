varying vec3 vColor;
varying float vHovered;
varying vec3 vNormal;
varying vec3 vWorldPos;

uniform float uTime;

void main() {

    vec3 lightDir =
        normalize(
            vec3(0.4, 1.0, 0.6)
        );

    float diff =
        max(
            dot(vNormal, lightDir),
            0.0
        );

    float ambient = 0.35;

    float lighting =
        ambient +
        (1.0 - ambient) * diff;

    vec3 col =
        vColor * lighting;

    if (vHovered > 0.5) {

        vec3 viewDir =
            normalize(
                cameraPosition -
                vWorldPos
            );

        float fresnel =
            1.0 -
            max(
                dot(vNormal, viewDir),
                0.0
            );

        fresnel =
            pow(fresnel, 2.2);

        vec3 hoverTint =
            vec3(
                0.48,
                1.0,
                0.88
            );

        float hoverStrength =
            0.55 +
            0.2 *
            sin(uTime * 6.0);

        col =
            mix(
                col,
                hoverTint,
                hoverStrength
            );

        col +=
            fresnel *
            vec3(
                0.3,
                1.0,
                0.85
            ) *
            1.8;
    }

    gl_FragColor =
        vec4(col, 1.0);
}