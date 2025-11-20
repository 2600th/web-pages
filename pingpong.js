import {
    Scene,
    OrthographicCamera,
    WebGLRenderTarget,
    ShaderMaterial,
    Mesh,
    PlaneGeometry,
    Vector2,
    Vector3,
    Vector4,
    NearestFilter,
    RGBAFormat,
    FloatType,
    WebGLRenderer,
    BufferGeometry,
    Float32BufferAttribute,
    Points,
    PointsMaterial,
    AdditiveBlending,
    GLSL3
} from 'three';

export class PingPongGame {
    constructor(containerId) {
        this.overlay = document.getElementById(containerId);
        this.container = this.overlay.querySelector('.game-container');
        this.canvas = this.container.querySelector('canvas');
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false
        });
        this.renderer.autoClear = false;

        this.scene = new Scene();
        this.simScene = new Scene(); // Separate scene for simulation
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.camera.position.z = 1;

        this.mouseY = 0;
        this.isRunning = false;
        this.time = 0;
        this.lastTime = 0;

        this.initBuffers();
        this.initParticles();
        this.initInput();
        this.resize();
    }

    initParticles() {
        const particleCount = 200;
        this.particleGeometry = new BufferGeometry();
        this.particlePositions = new Float32Array(particleCount * 3);
        this.particleVelocities = new Float32Array(particleCount * 3);
        this.particleLife = new Float32Array(particleCount);

        this.particleGeometry.setAttribute('position', new Float32BufferAttribute(this.particlePositions, 3));

        const material = new PointsMaterial({
            color: 0xffffff,
            size: 5,
            transparent: true,
            opacity: 0.8,
            blending: AdditiveBlending,
            depthWrite: false
        });

        this.particles = new Points(this.particleGeometry, material);
        this.scene.add(this.particles);

        // Initialize off-screen
        for (let i = 0; i < particleCount; i++) {
            this.particleLife[i] = 0;
            this.particlePositions[i * 3] = 999;
        }
    }

    spawnParticles(x, y, type) {
        const count = 15;
        const color = type === 'score' ? 0x99C278 : 0xFFFFFF;
        this.particles.material.color.setHex(color);

        for (let i = 0; i < this.particleLife.length; i++) {
            if (this.particleLife[i] <= 0) {
                for (let j = 0; j < count; j++) {
                    if (i + j >= this.particleLife.length) break;
                    this.particleLife[i + j] = 1.0;
                    this.particlePositions[(i + j) * 3] = x;
                    this.particlePositions[(i + j) * 3 + 1] = y;
                    this.particlePositions[(i + j) * 3 + 2] = 0;

                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 0.5 + 0.2;
                    this.particleVelocities[(i + j) * 3] = Math.cos(angle) * speed;
                    this.particleVelocities[(i + j) * 3 + 1] = Math.sin(angle) * speed;
                    this.particleVelocities[(i + j) * 3 + 2] = 0;
                }
                break;
            }
        }
    }

    initBuffers() {
        // Buffer A (Game State) - Low res is fine for state, but we need float precision if possible
        // Using NearestFilter is CRITICAL for state storage
        this.bufferA = new WebGLRenderTarget(320, 240, {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            type: FloatType, // Use FloatType for precise state
            stencilBuffer: false,
            depthBuffer: false
        });

        this.bufferB = this.bufferA.clone(); // Double buffering for state feedback

        // Buffer A Shader (Logic)
        this.bufferAMaterial = new ShaderMaterial({
            uniforms: {
                iTime: { value: 0 },
                iTimeDelta: { value: 0 },
                iFrame: { value: 0 },
                iResolution: { value: new Vector3(320, 240, 1) },
                iChannel0: { value: null }, // Feedback
                uPlayerY: { value: 0.0 },
                uReset: { value: false },
                uServeTimer: { value: 0.0 }
            },
            glslVersion: GLSL3,
            vertexShader: `
                precision highp float;
                out vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                precision highp int;

                uniform float iTime;
                uniform float iTimeDelta;
                uniform int iFrame;
                uniform sampler2D iChannel0;
                uniform float uPlayerY;
                uniform bool uReset;
                uniform float uServeTimer;

                in vec2 vUv;
                out vec4 fragColor;

                // Constants
                const ivec2 txPlayerPaddlePos = ivec2(0,0);
                const ivec2 txGPUPaddlePos = ivec2(1,0);
                const ivec2 txBallPosDir = ivec2(2,0);
                const ivec2 txScore = ivec2(3,0);
                const ivec2 txState = ivec2(4,0);

                const vec2 PaddleHalfSize = vec2(0.015, 0.08);
                const float HalfWallWidth = 0.01;
                const float BallRadius = 0.015;
                const float HalfFieldHeight = 0.53;
                
                const float BallSpeed = 1.5;
                const float BallSpeedIncreasePerSecond = 0.2;
                const float SpeedLimit = 3.0;
                const float PlayerPaddleXPos = -0.85;
                const float GpuPaddleXPos = 0.85;

                vec4 LoadValue(in ivec2 re) {
                    return texelFetch(iChannel0, re, 0);
                }

                float Hash(in float n) {
                    return fract(sin(n)*138.5453123);
                }

                void StoreValue(in ivec2 txPos, in vec4 value, inout vec4 color, in ivec2 fragPos) {
                    if (fragPos.x == txPos.x && fragPos.y == txPos.y) color = value;
                }

                float GetSpeed(in float pointStartTime) {
                    return clamp(0.0, SpeedLimit, BallSpeed + (iTime - pointStartTime) * BallSpeedIncreasePerSecond);
                }

                void main() {
                    ivec2 iCurPixel = ivec2(gl_FragCoord.xy);
                    
                    // Only compute for the first row, first few pixels
                    if (iCurPixel.y > 0 || iCurPixel.x > 5) {
                        discard;
                    }

                    vec2 playerPaddlePos = LoadValue(txPlayerPaddlePos).xy;
                    vec2 gpuPaddlePos = LoadValue(txGPUPaddlePos).xy;
                    vec4 ballPosDir = LoadValue(txBallPosDir);
                    vec2 score = LoadValue(txScore).xy;
                    vec3 state = LoadValue(txState).xyz;

                    // Initialize
                    if (iFrame == 0 || uReset) {
                        ballPosDir = vec4(0.0, 0.0, 0.0, 0.0);
                        playerPaddlePos = vec2(PlayerPaddleXPos, 0.0);
                        gpuPaddlePos = vec2(GpuPaddleXPos, 0.0);
                        state.x = -1.0; // State: -1 = Reset/Wait, 0 = Playing
                        state.z = 1.0;  // Serve direction
                        score = vec2(0, 0);
                    }

                    // Game Logic
                    if (state.x < -0.5) {
                        // Waiting for serve
                        if (uServeTimer <= 0.0) {
                            ballPosDir.xy = vec2(0.0, 0.0);
                            ballPosDir.zw = normalize(vec2(state.z, Hash(float(iFrame) * 1.5) * 0.25));
                            state.x = 0.0; // Playing
                            state.y = iTime;
                            gpuPaddlePos.y = 0.0;
                        }
                    } else {
                        float limits = HalfFieldHeight - HalfWallWidth;
                        float totalHalfPaddleHeight = PaddleHalfSize.y;

                        // Update Player Paddle (Direct Control via Uniform)
                        playerPaddlePos.y = clamp(uPlayerY, -limits + totalHalfPaddleHeight, limits - totalHalfPaddleHeight);

                        // Update GPU Paddle (Simple AI)
                        float moveUp = step(0.0, ballPosDir.y - (gpuPaddlePos.y + totalHalfPaddleHeight));
                        float moveDown = step(0.0, (gpuPaddlePos.y - totalHalfPaddleHeight) - ballPosDir.y);
                        // AI Speed
                        float aiSpeed = 1.0; // Slightly slower than instant
                        gpuPaddlePos.y += iTimeDelta * aiSpeed * (moveUp - moveDown);
                        gpuPaddlePos.y = clamp(gpuPaddlePos.y, -limits + totalHalfPaddleHeight, limits - totalHalfPaddleHeight);

                        // Update Ball
                        ballPosDir.xy += ballPosDir.zw * GetSpeed(state.y) * iTimeDelta;

                        // Wall Collisions
                        if (ballPosDir.y + BallRadius >= limits) {
                            ballPosDir.y = limits - BallRadius;
                            ballPosDir.w *= -1.0;
                        } else if (ballPosDir.y - BallRadius <= -limits) {
                            ballPosDir.y = BallRadius - limits;
                            ballPosDir.w *= -1.0;
                        }

                        // Paddle Collisions
                        // GPU
                        if (ballPosDir.x + BallRadius >= (gpuPaddlePos.x - PaddleHalfSize.x)) {
                            if (abs(ballPosDir.y - gpuPaddlePos.y) <= totalHalfPaddleHeight + BallRadius) {
                                ballPosDir.x = gpuPaddlePos.x - PaddleHalfSize.x - BallRadius;
                                ballPosDir.z *= -1.0;
                                ballPosDir.w += (ballPosDir.y - gpuPaddlePos.y) * 5.0;
                                ballPosDir.zw = normalize(ballPosDir.zw);
                            }
                        }
                        // Player
                        else if (ballPosDir.x - BallRadius <= playerPaddlePos.x + PaddleHalfSize.x) {
                            if (abs(ballPosDir.y - playerPaddlePos.y) <= totalHalfPaddleHeight + BallRadius) {
                                ballPosDir.x = playerPaddlePos.x + PaddleHalfSize.x + BallRadius;
                                ballPosDir.z *= -1.0;
                                ballPosDir.w += (ballPosDir.y - playerPaddlePos.y) * 5.0;
                                ballPosDir.zw = normalize(ballPosDir.zw);
                            }
                        }

                        // Scoring
                        if (ballPosDir.x - BallRadius > gpuPaddlePos.x) {
                            score.x += 1.0; // Player scores
                            state.x = -1.0;
                            state.z = -1.0; // Serve to loser
                        } else if (ballPosDir.x + BallRadius < playerPaddlePos.x) {
                            score.y += 1.0; // GPU scores
                            state.x = -1.0;
                            state.z = 1.0;
                        }
                    }

                    fragColor = vec4(0.0);
                    StoreValue(txPlayerPaddlePos, vec4(playerPaddlePos, 0.0, 0.0), fragColor, iCurPixel);
                    StoreValue(txGPUPaddlePos, vec4(gpuPaddlePos, 0.0, 0.0), fragColor, iCurPixel);
                    StoreValue(txBallPosDir, ballPosDir, fragColor, iCurPixel);
                    StoreValue(txScore, vec4(score, 0.0, 0.0), fragColor, iCurPixel);
                    StoreValue(txState, vec4(state, 0.0), fragColor, iCurPixel);
                }
            `
        });

        // Main Display Shader
        this.mainMaterial = new ShaderMaterial({
            uniforms: {
                iResolution: { value: new Vector3() },
                iChannel0: { value: null }, // Buffer A
                uShake: { value: 0.0 },
                iTime: { value: 0.0 }
            },
            glslVersion: GLSL3,
            vertexShader: `
                precision highp float;
                out vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                precision highp int;

                uniform vec3 iResolution;
                uniform sampler2D iChannel0;
                uniform float uShake;
                uniform float iTime;
                in vec2 vUv;
                out vec4 fragColor;

                // Constants
                const ivec2 txPlayerPaddlePos = ivec2(0,0);
                const ivec2 txGPUPaddlePos = ivec2(1,0);
                const ivec2 txBallPosDir = ivec2(2,0);
                const ivec2 txScore = ivec2(3,0);
                
                const vec2 PaddleHalfSize = vec2(0.015, 0.08);
                const float HalfWallWidth = 0.01;
                const float BallRadius = 0.015;
                const float HalfFieldHeight = 0.53;
                const float Thickness = 0.002;

                vec4 LoadValue(in ivec2 re) {
                    return texelFetch(iChannel0, re, 0);
                }

                float hash2(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                // Digit rendering
                const int[] font = int[](0x75557, 0x22222, 0x74717, 0x74747, 0x11574, 0x71747, 0x71757, 0x74444, 0x75757, 0x75747);
                const int[] powers = int[](1, 10, 100, 1000, 10000);
                
                float PrintInt(in vec2 uv, in int value) {
                    const int maxDigits = 2;
                    if (abs(uv.y - 0.5) < 0.5) {
                        int iu = int(floor(uv.x));
                        if (iu >= 0 && iu < maxDigits) {
                            int n = (value / powers[maxDigits - iu - 1]) % 10;
                            uv.x = fract(uv.x);
                            ivec2 p = ivec2(floor(uv * vec2(4.0, 5.0)));
                            return float((font[n] >> (p.x + p.y * 4)) & 1);
                        }
                    }
                    return 0.0;
                }

                float sdSquare(in vec2 p, in vec2 pos, in vec2 size) {
                    vec2 d = abs(p - pos) - size;
                    return length(max(d, 0.0));
                }

                vec3 RenderBall(vec2 pos, vec2 ballPos, vec3 col) {
                    float t = sdSquare(pos, ballPos, vec2(BallRadius));
                    return mix(vec3(1.0), col, smoothstep(0.0, Thickness, t));
                }

                vec3 RenderPaddle(vec2 pos, vec2 paddlePos, vec3 col) {
                    float t = sdSquare(pos, paddlePos, PaddleHalfSize);
                    return mix(vec3(1.0), col, smoothstep(0.0, Thickness, t));
                }

                vec3 RenderBorders(in vec2 pos, in float distToCenter, in vec3 col) {
                    float t = abs(abs(pos.y) - distToCenter) / HalfWallWidth;
                    return mix(vec3(1.0), col, smoothstep(0.0, Thickness, t - 1.0));
                }

                vec3 RenderScore(in vec2 score, in vec2 uv, in vec3 col) {
                    const vec2 displacement = vec2(0.3, -0.5);
                    col = mix(col, vec3(1.0), PrintInt((uv + displacement) * vec2(10.0, 7.0), int(score.x)));
                    col = mix(col, vec3(1.0), PrintInt((uv + displacement * vec2(-0.4, 1.0)) * vec2(10.0, 7.0), int(score.y)));
                    return col;
                }

                vec3 RenderCenterLine(in vec2 pos, in float limitsDistToCenter, in vec3 col) {
                    float t = abs(pos.x) - 0.003;
                    float dashT = step(0.0, sin(pos.y * 200.0));
                    float limitsT = (abs(pos.y) - limitsDistToCenter);
                    col = mix(vec3(1.0), col, smoothstep(0.0, Thickness, max(t, limitsT) + dashT));
                    return col;
                }

                void main() {
                    vec2 uv = vUv;
                    // Camera Shake
                    if (uShake > 0.0) {
                        uv += (vec2(hash2(uv + iTime), hash2(uv - iTime)) - 0.5) * uShake;
                    }

                    vec2 pos = (uv * 2.0 - 1.0);
                    pos.y *= iResolution.y / iResolution.x;

                    vec2 playerPaddlePos = LoadValue(txPlayerPaddlePos).xy;
                    vec2 gpuPaddlePos = LoadValue(txGPUPaddlePos).xy;
                    vec2 ballPos = LoadValue(txBallPosDir).xy;
                    vec2 score = LoadValue(txScore).xy;

                    vec3 col = vec3(0.05, 0.05, 0.05); // Dark background

                    col = RenderBall(pos, ballPos, col);
                    col = RenderPaddle(pos, playerPaddlePos, col);
                    col = RenderPaddle(pos, gpuPaddlePos, col);
                    col = RenderBorders(pos, HalfFieldHeight, col);
                    col = RenderCenterLine(pos, HalfFieldHeight, col);
                    
                    // Score needs UV not pos
                    vec2 scoreUV = (vUv * 2.0 - 1.0);
                    col = RenderScore(score, scoreUV, col);

                    // CRT Scanline effect (Subtle)
                    col *= 1.0 - 0.1 * sin(vUv.y * iResolution.y * 2.0);

                    fragColor = vec4(col, 1.0);
                }
            `
        });

        this.quad = new Mesh(new PlaneGeometry(2, 2), this.bufferAMaterial);
        this.simScene.add(this.quad); // Add to simulation scene

        // We also need a quad for the main display in the main scene
        this.displayQuad = new Mesh(new PlaneGeometry(2, 2), this.mainMaterial);
        this.scene.add(this.displayQuad);
    }

    initInput() {
        const updateMouse = (y) => {
            // Map screen Y to [-0.5, 0.5] roughly
            // Canvas top is 1, bottom is -1 in UV space logic, but we need to map clientY
            const rect = this.canvas.getBoundingClientRect();
            const relativeY = (y - rect.top) / rect.height; // 0 to 1
            // In game, Y goes from approx -0.53 to 0.53
            // Invert Y because screen coords are top-down
            this.mouseY = -(relativeY * 2 - 1) * 0.6;
        };

        window.addEventListener('mousemove', (e) => {
            if (!this.isRunning) return;
            updateMouse(e.clientY);
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isRunning) return;
            e.preventDefault();
            updateMouse(e.touches[0].clientY);
        }, { passive: false });
    }

    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.renderer.setSize(width, height);
        this.mainMaterial.uniforms.iResolution.value.set(width, height, 1);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.bufferAMaterial.uniforms.iFrame.value = 0;
        this.bufferAMaterial.uniforms.uReset.value = true;
        this.bufferAMaterial.uniforms.uServeTimer.value = 0.0;
        this.shakeIntensity = 0.0;
        this.serveTimer = 0.0;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
    }

    animate() {
        if (!this.isRunning) return;
        this.rafId = requestAnimationFrame(this.animate.bind(this));

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap dt
        this.lastTime = now;
        this.time += dt;

        // Update Uniforms
        this.bufferAMaterial.uniforms.iTime.value = this.time;
        this.bufferAMaterial.uniforms.iTimeDelta.value = dt;
        this.bufferAMaterial.uniforms.uPlayerY.value = this.mouseY;
        this.mainMaterial.uniforms.iTime.value = this.time;

        // Update Serve Timer
        if (this.serveTimer > 0) {
            this.serveTimer -= dt;
            this.bufferAMaterial.uniforms.uServeTimer.value = this.serveTimer;
        } else {
            this.bufferAMaterial.uniforms.uServeTimer.value = 0.0;
        }

        // Update Shake
        if (this.shakeIntensity > 0) {
            this.shakeIntensity *= 0.9; // Decay
            if (this.shakeIntensity < 0.001) this.shakeIntensity = 0.0;
            this.mainMaterial.uniforms.uShake.value = this.shakeIntensity;
        }

        // Update Particles
        const positions = this.particleGeometry.attributes.position.array;
        for (let i = 0; i < this.particleLife.length; i++) {
            if (this.particleLife[i] > 0) {
                this.particleLife[i] -= dt * 2.0; // Fade out
                positions[i * 3] += this.particleVelocities[i * 3] * dt;
                positions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * dt;
            } else {
                positions[i * 3] = 999; // Hide
            }
        }
        this.particleGeometry.attributes.position.needsUpdate = true;

        // Ping-Pong Buffering
        // Read from Buffer A (current state), Write to Buffer B (next state)
        this.bufferAMaterial.uniforms.iChannel0.value = this.bufferA.texture;
        // this.quad is already in simScene with bufferAMaterial
        this.renderer.setRenderTarget(this.bufferB);
        this.renderer.render(this.simScene, this.camera);

        // Swap Buffers
        const temp = this.bufferA;
        this.bufferA = this.bufferB;
        this.bufferB = temp;

        // Render to Screen
        this.mainMaterial.uniforms.iChannel0.value = this.bufferA.texture;
        // this.displayQuad is in scene with mainMaterial
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);

        this.bufferAMaterial.uniforms.iFrame.value++;
        this.bufferAMaterial.uniforms.uReset.value = false;

        this.checkState();
    }

    checkState() {
        // Read state from Buffer A
        const buffer = new Float32Array(320 * 240 * 4);
        this.renderer.readRenderTargetPixels(this.bufferA, 0, 0, 320, 240, buffer);

        // txBallPosDir is at (2,0) -> Index: (0 * 320 + 2) * 4 = 8
        // txScore is at (3,0) -> Index: (0 * 320 + 3) * 4 = 12

        const ballX = buffer[8];
        const ballY = buffer[9];
        const ballVelX = buffer[10];
        const ballVelY = buffer[11];
        const scoreX = buffer[12];
        const scoreY = buffer[13];

        // SFX & Shake Logic
        // We track velocity changes to detect collisions

        if (this.prevBallVelX !== undefined && this.prevBallVelY !== undefined) {
            const xFlip = Math.sign(ballVelX) !== Math.sign(this.prevBallVelX) && Math.abs(ballVelX) > 0.1;
            const yFlip = Math.sign(ballVelY) !== Math.sign(this.prevBallVelY) && Math.abs(ballVelY) > 0.1;

            if (xFlip || yFlip) {
                this.playTone(200, 0.05); // Bounce SFX for any hit
                this.spawnParticles(ballX, ballY, 'bounce'); // Particles for any hit
                // Shake removed for paddle hits as per user request
            }
        }
        this.prevBallVelX = ballVelX;
        this.prevBallVelY = ballVelY;

        // SFX: Score
        if (this.prevScoreX !== undefined) {
            if (scoreX > this.prevScoreX || scoreY > this.prevScoreY) {
                this.playTone(600, 0.1); // Score
                this.shakeIntensity = 0.05; // Big shake
                this.serveTimer = 1.0; // 1 second delay
                this.bufferAMaterial.uniforms.uServeTimer.value = 1.0;
                this.spawnParticles(0, 0, 'score'); // Center explosion
            }
        }
        this.prevScoreX = scoreX;
        this.prevScoreY = scoreY;

        // Win/Loss
        if (scoreX >= 10 || scoreY >= 10) {
            this.stop();
            if (this.onGameOver) {
                this.onGameOver(scoreX >= 10 ? 'player' : 'cpu');
            }
        }
    }

    playTone(freq, duration) {
        if (window.playTone) {
            window.playTone(freq, duration);
        }
    }
}
