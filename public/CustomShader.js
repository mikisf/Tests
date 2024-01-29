export const vertexShader = `
varying vec3 vNormal;
varying vec3 vColor;

attribute vec3 color;  // Three.js provides this attribute if the geometry has colors

uniform float size;

#include <clipping_planes_pars_vertex>

void main() {
    #include <begin_vertex>
    vNormal = normal != vec3(0.0) ? normalize(normalMatrix * normal) : vec3(0.0, 0.0, 1.0);
    vColor = color; // Assign vertex color to varying
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * 5.0;

    #include <project_vertex>
    #include <clipping_planes_vertex>
}
`;

export const fragmentShader = `
#define MAXLIGHTS 2

varying vec3 vNormal;
varying vec3 vColor;  // Receive color from vertex shader

uniform vec3 lightDirections[MAXLIGHTS];
uniform float lightIntensities[MAXLIGHTS];
uniform float minLightIntensity;

#include <clipping_planes_pars_fragment>

void main() {
    #include <clipping_planes_fragment>
    
    vec3 color = vec3(0.0);

    for (int i = 0; i < MAXLIGHTS; i++) {
        float intensity = (minLightIntensity + max(dot(vNormal, lightDirections[i]), 0.0) * (1.0 - minLightIntensity)) * lightIntensities[i];
        color += vColor * intensity;
    }

    gl_FragColor = vec4(color, 1.0);
}
`;