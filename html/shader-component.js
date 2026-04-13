class MetallicShader extends HTMLElement {
    static get observedAttributes() { return ["metal-type"]; }

    constructor() {
        super();
        this.attachShadow({mode:"open"}).innerHTML = `
<style>
:host {
    display: inline-block;
    border: 2px solid #555;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
canvas { width: 100%; height: 100%; display: block; }
</style>
<canvas></canvas>
<img style="display:none;">
`;
        this.metalType = 0;
    }

connectedCallback() {
    const shadow = this.shadowRoot;
    const canvas = shadow.querySelector("canvas");
    const width = parseInt(this.getAttribute("width")) || 650;
    const height = parseInt(this.getAttribute("height")) || 450;
    canvas.width = width;
    canvas.height = height;
    this.canvas = canvas;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    this.gl = gl;
    console.log(canvas.toDataURL());

    const img = shadow.querySelector("img");
    img.crossOrigin = "anonymous";
    img.src = this.getAttribute("src");
    img.onload = () => this.initShader(img);

    const fileInput = document.getElementById("imageLoader");
    if(fileInput){
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const url = URL.createObjectURL(file);
            this.setImage(url);
        });
    }

    canvas.addEventListener("mousemove", e => {
        if(!this.auto){
            const r = canvas.getBoundingClientRect();
            this.mouse[0] = e.clientX - r.left;
            this.mouse[1] = canvas.height - (e.clientY - r.top);
        }
    });
}

    initShader(img) {
        const gl = this.gl;
        const canvas = this.canvas;

        const vsSrc = `
attribute vec2 position;
void main() { gl_Position = vec4(position,0.0,1.0); }
`;

        const fsSrc = `
precision mediump float;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform sampler2D iChannel0;
uniform int metalType;

void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv = vec2(fragCoord.x,iResolution.y-fragCoord.y)/iResolution.xy;

    float hL = dot(texture2D(iChannel0, uv+vec2(-1.0,0.0)/iResolution.xy).rgb, vec3(0.299,0.587,0.114));
    float hR = dot(texture2D(iChannel0, uv+vec2(1.0,0.0)/iResolution.xy).rgb, vec3(0.299,0.587,0.114));
    float hD = dot(texture2D(iChannel0, uv+vec2(0.0,-1.0)/iResolution.xy).rgb, vec3(0.299,0.587,0.114));
    float hU = dot(texture2D(iChannel0, uv+vec2(0.0,1.0)/iResolution.xy).rgb, vec3(0.299,0.587,0.114));
    vec3 normal = normalize(vec3(hL-hR,hD-hU,0.35));

    vec2 m = (iMouse.xy==vec2(0.0)) ? iMouse.zw : iMouse.xy;
    m.y = iResolution.y - m.y;
    m /= iResolution.xy;

    vec3 pos = vec3(uv,0.0);
    vec3 lightPos = vec3(m,0.3);
    vec3 L = normalize(lightPos-pos);
    vec3 V = vec3(0.0,0.0,1.0);
    vec3 R = reflect(-V,normal);

    float sky = 0.5 + 0.5*R.y;
    vec3 env = mix(vec3(0.1),vec3(1.0),sky);
    float diff = max(dot(normal,L),0.0);
    float spec = pow(max(dot(reflect(-L,normal),V),0.0),128.0);

    vec3 metalColor;
    float metalSpec;
    if(metalType==0){ metalColor = vec3(0.8,0.8,0.85); metalSpec = 1.0; }
    else if(metalType==1){ metalColor = vec3(0.8,0.5,0.2); metalSpec = 0.6; }
    else { metalColor = vec3(1.0,0.75,0.2); metalSpec = 0.95; }

    vec3 chrome = env*metalSpec + metalColor*0.3;
    fragColor = vec4(chrome*diff + spec,1.0);
}

void main(){ mainImage(gl_FragColor,gl_FragCoord.xy); }
`;

        const compile = (src, type) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if(!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                console.error(gl.getShaderInfoLog(s));
            return s;
        };
        const vs = compile(vsSrc, gl.VERTEX_SHADER);
        const fs = compile(fsSrc, gl.FRAGMENT_SHADER);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        this.program = program;

        const vertices = new Float32Array([-1,-1,1,-1,-1,1,1,1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program,"position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc,2,gl.FLOAT,false,0,0);

        this.iResLoc = gl.getUniformLocation(program,"iResolution");
        this.iMouseLoc = gl.getUniformLocation(program,"iMouse");
        this.iChanLoc = gl.getUniformLocation(program,"iChannel0");
        this.metalLoc = gl.getUniformLocation(program,"metalType");

        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.iChanLoc,0);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        this.texture = tex;

        this.mouse = [0,0,0,0];
        this.angle = 0;
        this.auto = this.hasAttribute("auto-light");

        if(!this.auto) {
            this.canvas.addEventListener("mousemove", e=>{
                const r = this.canvas.getBoundingClientRect();
                this.mouse[0] = e.clientX - r.left;
                this.mouse[1] = canvas.height - (e.clientY - r.top);
            });
        }

        this.render();
    }

    render() {
        const gl = this.gl;
        const canvas = this.canvas;
        const iResLoc = this.iResLoc;
        const iMouseLoc = this.iMouseLoc;
        const metalLoc = this.metalLoc;

        const loop = () => {
            gl.viewport(0,0,canvas.width,canvas.height);
            gl.clearColor(0,0,0,1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            if(this.auto){
                this.angle += 0.01;
                const radius = 0.3;
                const lx = 0.5 + Math.cos(this.angle)*radius;
                const ly = 0.5 + Math.sin(this.angle)*radius;
                this.mouse[0] = lx * canvas.width;
                this.mouse[1] = ly * canvas.height;
            }

            gl.uniform3f(iResLoc, canvas.width, canvas.height, 1.0);
            gl.uniform4f(iMouseLoc, ...this.mouse);
            gl.uniform1i(metalLoc, this.metalType);

            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
            requestAnimationFrame(loop);
        };
        loop();
    }

    setImage(src){
        const img = this.shadowRoot.querySelector("img");
        img.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,img);
        };
        img.src = src;
    }

    attributeChangedCallback(name, oldVal, newVal){
        if(name === "metal-type"){
            if(newVal === "aluminum") this.metalType = 0;
            else if(newVal === "bronze") this.metalType = 1;
            else if(newVal === "gold") this.metalType = 2;
        }
    }
}

customElements.define("metallic-shader", MetallicShader);