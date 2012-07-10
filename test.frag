precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
    vec4 texColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    float mask = texColor.a;
    texColor.a = 1.0;
    vec4 clr;

    clr.rgba = vec4(1.0, 1.0, 0.0, 1.0);
    if (mask < 0.4) {
        clr.rgb = vec3(0.0, 0.0, 1.0);
    } else if (mask < 0.6) {
        clr.rgb = vec3(0.0, 1.0, 0.0);
    } else {
        clr = texColor;
    }
    gl_FragColor = clr;
    //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
}