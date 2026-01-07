document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;

            vec3 colorBg = vec3(0.01, 0.01, 0.02); 
            vec3 colorSmoke = vec3(0.12, 0.22, 0.45); 

            float noiseVal = 0.0;
            float amp = 0.6;
            float freq = 1.2;
            
            vec2 pos = st + vec2(u_time * 0.02, u_time * 0.01);

            for(int i = 0; i < 3; i++) {
                noiseVal += amp * snoise(pos * freq);
                pos += vec2(1.5, 2.5); 
                freq *= 2.0;
                amp *= 0.5;
            }

            float smoke = smoothstep(-0.2, 0.8, noiseVal);
            vec3 finalColor = mix(colorBg, colorSmoke, smoke);
            
            float vignette = 1.0 - smoothstep(0.4, 1.4, length(gl_FragCoord.xy / u_resolution.xy - 0.5));
            finalColor *= vignette;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionLocation = gl.getAttribLocation(program, "position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let startTime = performance.now();
    function loop() {
        const time = (performance.now() - startTime) * 0.001;
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, time);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(loop);
    }
    loop();
});
