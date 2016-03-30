#version 430

in vec3 Color;
layout (location=0) out vec4 colorOutputInFragment;

void main() {
    colorOutputInFragment = vec4(Color, 1.0);
}
