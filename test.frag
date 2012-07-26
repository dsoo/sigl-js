precision mediump float;

varying vec2 vTexCoord;

uniform float uThreshold;
uniform sampler2D uSampler;

void main(void) {
    vec4 texColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));
    float mask = texColor.a;
    texColor.a = 0.5;
    vec4 clr;
    clr.a=0.5;

    clr.rgba = vec4(1.0, 1.0, 0.0, 0.5);
    if (mask < uThreshold) {
        clr.rgb = vec3(0.0, 0.0, 1.0);
    } else if (mask < (uThreshold + 0.2)) {
        clr.rgb = vec3(0.0, 1.0, 0.0);
    } else {
        clr = texColor;
    }
    gl_FragColor = clr;
}
