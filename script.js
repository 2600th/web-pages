import {
    WebGLRenderer,
    Scene,
    OrthographicCamera,
    WebGLRenderTarget,
    LinearFilter,
    RGBAFormat,
    ShaderMaterial,
    Vector3,
    Vector4,
    Mesh,
    PlaneGeometry
} from 'three';
import { PingPongGame } from './pingpong.js';

// 8-bit Retro Console System
// Author: Pranshul
// 2600th System

// --- Audio System ---
class MusicSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = false;
        this.currentNote = 0;
        this.nextNoteTime = 0;
        this.timerID = null;

        // Define multiple tracks – darker, cinematic synthwave-style chiptune themes
        // Each track is a 16-step pattern in a minor key with a driving bass and melodic ostinato.
        this.tracks = [
            {
                name: 'Event Horizon',
                bpm: 100,
                // A minor, pulsing low bass for an ominous orbit feel
                bass: [
                    'A1', 'A1', 'A1', 'A1', 'E2', 'E2', 'E2', 'E2',
                    'F2', 'F2', 'F2', 'F2', 'D2', 'D2', 'D2', 'D2'
                ],
                // Zimmer-ish repeating motif that slowly climbs
                melody: [
                    'A3', null, 'C4', null, 'E4', null, 'A4', null,
                    'G4', null, 'E4', null, 'C4', null, 'A3', null
                ]
            },
            {
                name: 'Neon Cathedral',
                bpm: 108,
                // D minor, more insistent bass with a synthwave gallop
                bass: [
                    'D2', 'D2', 'A1', 'D2', 'F2', 'F2', 'C2', 'F2',
                    'G2', 'G2', 'D2', 'G2', 'A2', 'A2', 'E2', 'A2'
                ],
                // Wide intervals to feel bigger and more “score-like”
                melody: [
                    'D4', null, 'F4', null, 'A4', null, 'D5', null,
                    'C5', null, 'A4', null, 'F4', null, 'D4', null
                ]
            },
            {
                name: 'Midnight Relay',
                bpm: 112,
                // G# minor, steady synthwave bass-line
                bass: [
                    'G#1', 'G#1', 'G#1', 'G#1', 'E2', 'E2', 'E2', 'E2',
                    'B1', 'B1', 'B1', 'B1', 'F#2', 'F#2', 'F#2', 'F#2'
                ],
                // Arp-style top line with occasional octave jumps
                melody: [
                    'G#3', null, 'B3', null, 'D#4', null, 'G#4', null,
                    'F#4', null, 'D#4', null, 'B3', null, 'G#3', 'G#4'
                ]
            },
            {
                name: 'Signal to Nowhere',
                bpm: 96,
                // Slow-burning, heavy low end in C minor
                bass: [
                    'C2', 'C2', 'G1', 'C2', 'G#1', 'G#1', 'D#2', 'D#2',
                    'F2', 'F2', 'C2', 'F2', 'D#2', 'D#2', 'G1', 'G1'
                ],
                // Sparse, high-register motif to float over the drones
                melody: [
                    null, 'G4', null, 'C5', null, 'D#5', null, 'G5',
                    null, 'F5', null, 'D#5', null, 'C5', 'G4', null
                ]
            }
        ];

        this.currentTrackIndex = 0;
        this.updateTrack();
    }

    updateTrack() {
        const track = this.tracks[this.currentTrackIndex];
        this.bpm = track.bpm;
        this.noteDuration = 60 / this.bpm / 4;
        this.sequenceBass = track.bass;
        this.sequenceMelody = track.melody;
    }

    shuffleTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.updateTrack();
        return this.tracks[this.currentTrackIndex].name;
    }

    getCurrentTrackName() {
        return this.tracks[this.currentTrackIndex].name;
    }

    noteToFreq(note) {
        if (!note) return 0;
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const keyNumber = notes.indexOf(note.slice(0, -1));
        if (keyNumber === -1) return 0;
        return 440 * Math.pow(2, ((keyNumber + (octave - 4) * 12) - 9) / 12);
    }

    playTone(freq, type, startTime, duration, vol = 0.1) {
        if (freq <= 0) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playNoise(time) {
        const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.05;
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(time);
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.15);
    }

    scheduleNote() {
        const time = this.nextNoteTime;

        // Bass
        const bassNote = this.sequenceBass[this.currentNote % this.sequenceBass.length];
        this.playTone(this.noteToFreq(bassNote), 'square', time, 0.2, 0.15);

        // Melody (every 2nd bar effectively, or overlay)
        const melodyNote = this.sequenceMelody[this.currentNote % this.sequenceMelody.length];
        if (melodyNote) {
            this.playTone(this.noteToFreq(melodyNote), 'sawtooth', time, 0.1, 0.08);
        }

        // Drums
        if (this.currentNote % 4 === 0) {
            this.playKick(time);
        }
        if (this.currentNote % 4 === 2) {
            this.playNoise(time); // Snare/Hat
        }
        if (this.currentNote % 2 === 0) {
            // Hi-hat tick
            this.playTone(8000, 'square', time, 0.01, 0.02);
        }

        this.currentNote++;
        this.nextNoteTime += this.noteDuration;
    }

    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.scheduleNote();
        }
        if (this.isPlaying) {
            this.timerID = requestAnimationFrame(this.scheduler.bind(this));
        }
    }

    start() {
        if (this.isPlaying) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        cancelAnimationFrame(this.timerID);
    }
}

// --- Typewriter Effect ---
class Typewriter {
    constructor(el, text, speed = 30) {
        this.el = el;
        this.fullText = text;
        this.speed = speed;
        this.el.innerHTML = '';
        this.index = 0;
        this.isTyping = false;
    }

    start() {
        if (this.isTyping) return;
        this.isTyping = true;
        this.type();
    }

    type() {
        if (this.index < this.fullText.length) {
            this.el.textContent += this.fullText.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.speed + Math.random() * 20);
        } else {
            this.isTyping = false;
            // Remove cursor blink effect after done? Or keep it.
            // Keeping it looks like a waiting terminal.
        }
    }
}

// --- Scramble Text Effect ---
class ScrambleText {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud" style="color: #5C6370">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// --- Global State ---
let visualModuleControl = { pause: () => { }, resume: () => { } };
let pingPongGame = null;

// Expose launch function globally
window.launchPingPong = function () {
    console.log("Launching PingPong...");
    const gameOverlay = document.getElementById('game-overlay');
    if (!gameOverlay) {
        console.error("Game overlay not found");
        return;
    }

    // Initialize game if needed
    if (!pingPongGame) {
        pingPongGame = new PingPongGame('game-overlay');
    }

    // Show overlay
    gameOverlay.classList.remove('hidden');

    // Ensure correct size now that it's visible
    if (pingPongGame) {
        pingPongGame.resize();
    }

    // Pause Skull
    if (visualModuleControl && visualModuleControl.pause) {
        visualModuleControl.pause();
    }

    // Start Game
    pingPongGame.start();

    // Handle Game Over
    pingPongGame.onGameOver = (winner) => {
        const resultOverlay = document.getElementById('game-result');
        const title = document.getElementById('result-title');
        const subtitle = document.getElementById('result-subtitle');

        if (resultOverlay && title && subtitle) {
            if (winner === 'player') {
                title.textContent = 'SYSTEM VICTORY';
                subtitle.textContent = 'NEURAL LINK ESTABLISHED';
                title.style.color = '#99C278'; // Green
            } else {
                title.textContent = 'SYSTEM FAILURE';
                subtitle.textContent = 'CONNECTION TERMINATED';
                title.style.color = '#E06C75'; // Red
            }
            resultOverlay.classList.remove('hidden');
        }
    };

    // Restart Button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.onclick = () => {
            const resultOverlay = document.getElementById('game-result');
            if (resultOverlay) resultOverlay.classList.add('hidden');
            pingPongGame.start();
        };
    }
};

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded, initializing systems...');
    // Scramble Text for Header
    const el = document.querySelector('.glitch');
    if (el) {
        const scrambler = new ScrambleText(el);
        // Initial scramble
        const originalText = el.getAttribute('data-text') || el.innerText;
        scrambler.setText(originalText);

        // Periodic scramble
        setInterval(() => {
            if (Math.random() > 0.9) {
                scrambler.setText(originalText);
            }
        }, 5000);
    }

    // Typewriter for Bio
    const bioEl = document.querySelector('.typing-text');
    if (bioEl) {
        const text = bioEl.innerText.trim();
        const typewriter = new Typewriter(bioEl, text, 20);
        // Start after a delay
        setTimeout(() => typewriter.start(), 1500);
    }

    // Subtitle lifecycle messaging
    const subtitleEl = document.querySelector('.subtitle');
    const fadeSubtitleTo = (text, delay) => {
        if (!subtitleEl) return;
        setTimeout(() => {
            subtitleEl.classList.add('subtitle-hidden');
            setTimeout(() => {
                subtitleEl.textContent = text;
                subtitleEl.classList.remove('subtitle-hidden');
            }, 250);
        }, delay);
    };

    if (subtitleEl) {
        window.addEventListener('load', () => {
            fadeSubtitleTo('System Initialization Complete...', 150);
            fadeSubtitleTo('Cognitive Core Re-indexed. Hello, operator.', 3350);
        }, { once: true });
    }

    // 3D Skull Setup (Shader)
    try {
        visualModuleControl = initThreeJS() || visualModuleControl;
    } catch (e) {
        console.error("ThreeJS Init Failed:", e);
    }

    // Game Setup
    const gameOverlay = document.getElementById('game-overlay');
    const gameCloseBtn = document.getElementById('game-close-btn');

    if (gameCloseBtn && gameOverlay) {
        gameCloseBtn.addEventListener('click', () => {
            gameOverlay.classList.add('hidden');
            if (pingPongGame) pingPongGame.stop();
            visualModuleControl.resume();
        });
    }

    // Audio Setup
    const synth = new MusicSynth();
    const musicBtn = document.getElementById('music-btn');
    const terminalToggleButtons = Array.from(document.querySelectorAll('[data-terminal-toggle]'));
    const terminalCloseBtn = document.getElementById('terminal-close-btn');

    window.initAudio = () => {
        if (synth.ctx.state === 'suspended') synth.ctx.resume();
        toggleMusic();
    };

    window.toggleMusic = () => {
        if (synth.isPlaying) {
            synth.stop();
            if (musicBtn) musicBtn.innerHTML = '<span class="key">click</span> play music';
        } else {
            if (synth.ctx.state === 'suspended') synth.ctx.resume();
            synth.start();
            if (musicBtn) musicBtn.innerHTML = `<span class="key">click</span> stop music • ${synth.getCurrentTrackName()}`;
        }
    };

    window.shuffleMusic = () => {
        const wasPlaying = synth.isPlaying;
        if (wasPlaying) synth.stop();
        const trackName = synth.shuffleTrack();
        if (wasPlaying) {
            synth.start();
            if (musicBtn) musicBtn.innerHTML = `<span class="key">click</span> stop music • ${trackName}`;
        }
        return trackName;
    };

    window.getMusicSynth = () => synth;

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            window.toggleMusic();
        });
    }

    const bindTerminalToggle = (btn) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            window.toggleTerminal();
        });
    };

    terminalToggleButtons.forEach(bindTerminalToggle);
    bindTerminalToggle(terminalCloseBtn);

    // Terminal Interaction
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 't' && document.activeElement !== terminalInput) {
            e.preventDefault();
            window.toggleTerminal();
        }
        if (key === 'escape') {
            const gameOverlay = document.getElementById('game-overlay');
            if (gameOverlay && !gameOverlay.classList.contains('hidden')) {
                e.preventDefault();
                gameOverlay.classList.add('hidden');
                if (pingPongGame) pingPongGame.stop();
                visualModuleControl.resume();
                return;
            }

            if (terminalOverlay && terminalOverlay.style.display === 'flex') {
                e.preventDefault();
                window.toggleTerminal();
            }
        }
    });
});

// --- 3D Scene (Shadertoy Port) ---
function initThreeJS() {
    const container = document.querySelector('.visual-module');
    const canvas = document.querySelector('#canvas');
    if (!container || !canvas) return;

    const renderer = new WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false
    });
    renderer.autoClear = false;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    // Buffer A (Raymarching Skull)
    const bufferA = new WebGLRenderTarget(320, 240, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat
    });

    const bufferAMaterial = new ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new Vector3(320, 240, 1) },
            iMouse: { value: new Vector4() }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float iTime;
            uniform vec3 iResolution;
            uniform vec4 iMouse;

            #define T iTime
            #define R iResolution.xy
            #define S(a, b, c) smoothstep(a, b, c)
            #define PI acos(-1.)
            #define LOWRES 320.

            float rem(vec2 iR) {
                return 4.0; // Fixed cell size
            }

            float hash(float n) {
                return fract(sin(n) * 4121.15393) + .444;
            }

            float noise(in vec3 x) {
                vec3 p = floor(x);
                vec3 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                float n = p.x + p.y * 157.0 + 113.0 * p.z;
                return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                               mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
                           mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                               mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
            }

            // SDF Primitives
            float sdSphere(vec3 p, float s) { return length(p) - s; }
            float sdBox(vec3 p, vec3 b) {
                vec3 d = abs(p) - b;
                return max(min(d.x, min(d.y, d.z)), 0.0) + length(max(d, 0.0));
            }
            float smin(float a, float b, float k) {
                float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
                return mix(b, a, h) - k * h * (1.0 - h);
            }
            float smax(float a, float b, float k) {
                float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
                return mix(b, a, h) + k * h * (1.0 - h);
            }

            // Skull SDF
            float sdSkull(vec3 p, float s) {
                float ss = noise(p * 9.);
                ss = mix(s, ss * .5, .1);
                vec3 sp = vec3(p.x, p.y, abs(p.z));
                
                float shape = sdSphere(p - vec3(.0, .05, .0), s * .95 * cos(cos(p.y * 11.) * p.z * 2.3));
                shape = smin(shape, sdSphere(p - vec3(.10, 0.23, 0.00), s * .82), .09);
                shape = smin(shape, sdSphere(p - vec3(-.1, 0.24, 0.00), s * .82), .09);
                shape = smin(shape, sdSphere(sp - vec3(.25, 0.07, 0.10), s * .36 * cos(p.y * 7.0)), .02);
                shape = smax(shape, -sdSphere(sp - vec3(.15, -.01, 0.31), s * .28 * cos(p.x * .59)), .02);
                shape = smin(shape, sdSphere(sp - vec3(.22, -.13, .18), s * .11), .09);
                shape = max(shape, -sdSphere(p - vec3(.0, .05, .0), s * .90 * cos(cos(p.y * 11.) * p.z * 2.3)));
                shape = smax(shape, -sdSphere(p - vec3(.10, 0.23, 0.00), s * .74), .02);
                shape = smax(shape, -sdSphere(p - vec3(-.1, 0.24, 0.00), s * .74), .02);
                shape = smax(shape, -sdSphere(p - vec3(.0, 0.24, 0.00), s * .74), .02);
                shape = smax(shape, -sdSphere(sp - vec3(.32, -.04, .140), s * .28 * cos(p.y * 10.)), .03);

                // Nose
                float temp = sdSphere(p - vec3(cos(.0) * .220, -.05, sin(.0) * .3), s * .35 * cos(sin(p.y * 22.) * p.z * 24.));
                temp = smax(temp, -sdSphere(sp - vec3(.32, -.04, .140), s * .35 * cos(p.y * 10.)), .02);
                temp = smax(temp, -sdSphere(p - vec3(.0, .05, .0), s * .90 * cos(cos(p.y * 11.) * p.z * 2.3)), .02);
                shape = smin(shape, temp, .015);
                shape = smax(shape, -sdSphere(p - vec3(cos(.0) * .238, -.09, sin(.0) * .3), s * .3 * cos(sin(p.y * 18.) * p.z * 29.)), .002);
                shape = smax(shape, -sdSphere(p - vec3(-.15, -0.97, .0), s * 2.5), .01);
                shape = smax(shape, -sdSphere(p - vec3(-.23, -0.57, .0), abs(ss) * 1.6), .01);

                // Jaws
                temp = smax(sdSphere(p - vec3(.13, -.26, .0), .45 * s), -sdSphere(p - vec3(.125, -.3, .0), .40 * s), .01);
                temp = smax(temp, -sdSphere(p - vec3(-.2, -.1, .0), .9 * s), .03);
                temp = smax(temp, -sdSphere(p - vec3(.13, -.543, .0), .9 * s), .03);
                temp = max(temp, -sdSphere(p - vec3(.0, .02, .0), s * .90 * cos(cos(p.y * 11.) * p.z * 2.3)));
                shape = smin(shape, temp, .07);

                // Teeth
                temp = sdSphere(p - vec3(.26, -.29, .018), .053 * s);
                temp = min(temp, sdSphere(p - vec3(.26, -.29, -.018), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.25, -.29, .05), .05 * s));
                temp = min(temp, sdSphere(sp - vec3(.235, -.29, .08), .05 * s));
                temp = min(temp, sdSphere(sp - vec3(.215, -.28, .1), .05 * s));
                temp = max(temp, -sdSphere(p - vec3(.16, -.35, .0), .33 * s));
                temp = min(temp, sdSphere(sp - vec3(.18, -.28, .115), .05 * s));
                temp = min(temp, sdSphere(sp - vec3(.14, -.28, .115), .06 * s));
                temp = min(temp, sdSphere(sp - vec3(.11, -.28, .115), .06 * s));
                temp = min(temp, sdSphere(sp - vec3(.08, -.28, .115), .06 * s));
                shape = smin(shape, temp, .03);

                // Down Jaws
                temp = sdSphere(p - vec3(.1, -.32, .0), .43 * s);
                temp = smax(temp, -sdSphere(p - vec3(.1, -.32, .0), .37 * s), .02);
                temp = smax(temp, -sdSphere(p - vec3(.1, -.034, .0), 1.03 * s), .02);
                temp = smax(temp, -sdSphere(p - vec3(.0, -.4, .0), .35 * s), .02);
                temp = smin(temp, sdBox(sp - vec3(.04 - .03 * cos(p.y * 20.2), -.23, .27 + sin(p.y) * .27), vec3(cos(p.y * 4.) * .03, .12, .014)), .13);
                temp = max(temp, -sdSphere(sp - vec3(.0, .153, .2), .85 * s));
                temp = smin(temp, sdSphere(sp - vec3(.2, -.45, 0.05), .05 * s), .07);
                shape = smin(shape, temp, .02);

                // Lower Teeth
                temp = sdSphere(p - vec3(.23, -.34, .018), .053 * s);
                temp = min(temp, sdSphere(p - vec3(.23, -.34, -.018), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.22, -.34, .048), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.20, -.34, .078), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.17, -.35, .098), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.14, -.35, .11), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.11, -.35, .11), .053 * s));
                temp = min(temp, sdSphere(sp - vec3(.08, -.35, .11), .053 * s));
                shape = 1.5 * smin(shape, temp, .025);

                return shape;
            }

            vec2 map(vec3 pos) {
                return vec2(.5 * sdSkull(pos, .35), 39.);
            }

            vec2 castRay(vec3 ro, vec3 rd) {
                int i = 0;
                float close = 1.0;
                float far = 3.0;
                float p = 0.0005 * close;
                float id = 0.0;
                for(int j=0; j<64; j++) {
                    vec2 res = map(ro + rd * close);
                    if(abs(res.x) < p || close > far) break;
                    close += res.x;
                    id = res.y;
                }
                return vec2(close, id);
            }

            vec3 calcNormal(vec3 pos) {
                vec2 e = vec2(1., -1.) * 0.0005;
                return normalize(e.xyy * map(pos + e.xyy).x +
                                 e.yyx * map(pos + e.yyx).x +
                                 e.yxy * map(pos + e.yxy).x +
                                 e.xxx * map(pos + e.xxx).x);
            }

            vec3 render(vec2 p, vec3 ro, vec3 rd) {
                vec2 res = castRay(ro, rd);
                float t = res.x;
                float m = res.y;
                vec3 col = vec3(0.);
                vec3 pos = ro + t * rd;
                vec3 nor = calcNormal(pos);
                col = .45 + .55 * sin(vec3(.05, .08, .1) * m - 1.);
                col = mix(col, vec3(0.), 1. - exp(-0.02 * pow(t, 9.5)));
                return clamp(col, 0., 1.);
            }

            mat3 setCamera(vec3 ro) {
                vec3 cw = normalize(-ro);
                vec3 cp = vec3(sin(0.), cos(0.), 0.);
                vec3 cu = normalize(cross(cw, cp));
                vec3 cv = normalize(cross(cu, cw));
                return mat3(cu, cv, cw);
            }

            void main() {
                vec2 p = (-iResolution.xy + 2.0 * gl_FragCoord.xy) / iResolution.y;
                vec3 ro = vec3(1.6 * cos(iTime * .6), 0., 1.6 * sin(iTime * .6));
                mat3 ca = setCamera(ro);
                vec3 rd = ca * normalize(vec3(p.xy, 2.));
                vec3 col = render(p, ro, rd);
                col = pow(col, vec3(0.25));
                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    // Main Pass (Halftone)
    const mainMaterial = new ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new Vector3() },
            iChannel0: { value: bufferA.texture }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float iTime;
            uniform vec3 iResolution;
            uniform sampler2D iChannel0;

            #define T iTime
            #define R iResolution.xy
            #define S(a, b, c) smoothstep(a, b, c)
            #define CEL 4.0

            float hash2(vec2 p) {
                vec3 p3 = fract(vec3(p.xyx) * .2831);
                p3 += dot(p3, p3.yzx + 19.19);
                return fract((p3.x + p3.y) * p3.z);
            }

            float make_dot(vec2 uv, float r, float c) {
                return smoothstep(r - .1, r, min(length((uv - vec2(c / 2.)) * 2.), r));
            }

            float get_tex(vec2 U) {
                vec3 tex_col = texture2D(iChannel0, U / R).xyz;
                return .45 * (tex_col.x + tex_col.y + tex_col.z);
            }

            void main() {
                vec2 U = gl_FragCoord.xy;
                
                // Halftone
                float pixel_color = get_tex(ceil(U / CEL) * CEL);
                float dot_radius = pixel_color;
                vec2 U_mod = mod(U, CEL);
                vec4 dot_color = vec4(make_dot(U_mod, ceil(dot_radius * CEL), CEL));
                vec4 C = 1. - dot_color;

                // Glitch / Post
                vec2 V = 1. - 2. * U / R;
                vec2 off = vec2(S(.0, 0.0, cos(T + U.y / R.y * 5.0)), .0) - vec2(.5, .0);
                
                // Colorize (Green tint)
                float r = texture2D(iChannel0, .03 * off + U / R).x;
                float g = texture2D(iChannel0, .04 * off + U / R).x;
                float b = texture2D(iChannel0, .05 * off + U / R).x;
                
                vec4 finalColor = vec4(0., .1, .2, 1.);
                finalColor += .06 * hash2(T + V * vec2(1462.439, 297.185));
                finalColor += vec4(r, g, b, 1.);
                finalColor *= 1.25 * vec4(1. - S(.1, 1.8, length(V * V))); // Vignette
                
                // Combine Halftone + Color
                C = C * finalColor;
                
                // Add scanline-ish effect
                C *= .4 + sign(S(.99, 1., U_mod.y));
                C += .14 * vec4(pow(1. - length(V * vec2(.5, .35)), 3.), .0, .0, 1.);

                // Tint to match our theme (Green/Retro)
                float gray = dot(C.rgb, vec3(0.299, 0.587, 0.114));
                vec3 themeColor = vec3(0.6, 0.76, 0.47); // #99C278
                // Mix original slightly with theme to keep some depth, but mostly theme
                vec3 final = mix(vec3(gray), themeColor * gray * 1.8, 0.8);
                gl_FragColor = vec4(final, 1.0);
            }
        `
    });

    const quad = new Mesh(new PlaneGeometry(2, 2), mainMaterial);
    scene.add(quad);

    const sceneBufferA = new Scene();
    const quadBufferA = new Mesh(new PlaneGeometry(2, 2), bufferAMaterial);
    sceneBufferA.add(quadBufferA);

    function resizeRenderer() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;
        renderer.setSize(width, height);

        const vecRes = new Vector3(width, height, 1);
        bufferAMaterial.uniforms.iResolution.value = new Vector3(320, 240, 1); // Keep buffer low res
        mainMaterial.uniforms.iResolution.value = vecRes;
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    let animationId;
    let isPaused = false;

    function animate(time) {
        if (isPaused) return;
        animationId = requestAnimationFrame(animate);

        const t = time * 0.001;

        // Render Buffer A
        bufferAMaterial.uniforms.iTime.value = t;
        renderer.setRenderTarget(bufferA);
        renderer.render(sceneBufferA, camera);

        // Render Main
        mainMaterial.uniforms.iTime.value = t;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }
    animate(0);

    return {
        pause: () => {
            isPaused = true;
            cancelAnimationFrame(animationId);
        },
        resume: () => {
            if (isPaused) {
                isPaused = false;
                animate(performance.now());
            }
        }
    };
}

// --- Terminal System ---
const terminalOverlay = document.getElementById('terminal-overlay');
const terminalInput = document.getElementById('cmd-input');
const terminalOutput = document.getElementById('cmd-output');
const commandHistory = [];
let historyIndex = -1;

function focusTerminalInputEnd() {
    if (!terminalInput) return;
    terminalInput.focus();
    const len = terminalInput.value.length;
    try {
        terminalInput.setSelectionRange(len, len);
    } catch (_err) {
        // Some browsers might not support setSelectionRange on certain inputs.
    }
}

function ensureMusicPlaying() {
    if (typeof window.getMusicSynth !== 'function' || typeof window.toggleMusic !== 'function') {
        return false;
    }
    const synthInstance = window.getMusicSynth();
    if (!synthInstance || synthInstance.isPlaying) {
        return false;
    }
    window.toggleMusic();
    return true;
}

window.toggleTerminal = () => {
    if (!terminalOverlay) return;
    const isOpen = terminalOverlay.style.display === 'flex';

    if (isOpen) {
        terminalOverlay.style.display = 'none';
        terminalOverlay.classList.add('hidden');
        if (terminalInput) {
            terminalInput.value = '';
            terminalInput.blur(); // Close mobile keyboard
        }
    } else {
        terminalOverlay.style.display = 'flex';
        terminalOverlay.classList.remove('hidden');
        // Delay focus to ensure terminal is visible
        setTimeout(() => {
            if (terminalInput) {
                terminalInput.focus();
                // Trigger mobile keyboard
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    terminalInput.click();
                }
            }
        }, 100);
    }
    playTone(800, 0.05);
};

window.playTone = function (freq, duration) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminalInput.value.toLowerCase().trim();
            if (!command) return;
            handleCommand(command);
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            terminalInput.value = '';
            playTone(1200, 0.05);
            return;
        }

        if (e.key === 'ArrowUp') {
            if (!commandHistory.length) return;
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
            } else {
                historyIndex = 0;
            }
            terminalInput.value = commandHistory[historyIndex] || '';
            setTimeout(() => {
                focusTerminalInputEnd();
            }, 0);
        } else if (e.key === 'ArrowDown') {
            if (!commandHistory.length) return;
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        }
    });
}

if (terminalOverlay && terminalInput) {
    terminalOverlay.addEventListener('click', (e) => {
        if (terminalOverlay.style.display !== 'flex') return;
        const interactiveTarget = e.target.closest('button, a, input, textarea');
        if (interactiveTarget && interactiveTarget !== terminalInput) {
            return;
        }
        const selection = window.getSelection ? window.getSelection() : null;
        if (selection && selection.toString().length > 0) {
            return;
        }
        focusTerminalInputEnd();
    });
}

function handleCommand(cmd) {
    const output = document.createElement('div');
    output.className = 'output-line';

    let response = '';
    switch (cmd) {
        case 'help':
            response = 'COMMANDS: HELP, ABOUT, SKILLS, CONTACT, MUSIC, PINGPONG, SHUFFLE, TRACK, DATE, WHOAMI, SUDO, ECHO, CLEAR, EXIT';
            break;
        case 'about':
            response = 'USER: PRANSHUL | CLASS: DEVELOPER | LVL: 2600';
            break;
        case 'skills':
            response = 'JavaScript, Python, C++, WebGL, GLSL, React, Node.js';
            break;
        case 'contact':
            response = 'TRANSMITTING ON ALL FREQUENCIES...';
            break;
        case 'music':
            response = 'TOGGLING AUDIO SYSTEM...';
            window.toggleMusic();
            break;
        case 'pingpong':
            response = 'INITIALIZING PING PONG PROTOCOL...';
            if (window.launchPingPong) {
                setTimeout(() => window.launchPingPong(), 500);
            } else {
                response = 'ERROR: GAME MODULE NOT FOUND.';
            }
            break;
        case 'shuffle':
            ensureMusicPlaying();
            const trackName = window.shuffleMusic();
            response = `SWITCHED TO TRACK: ${trackName}`;
            break;
        case 'track':
            ensureMusicPlaying();
            const currentTrack = window.getMusicSynth().getCurrentTrackName();
            response = `NOW PLAYING: ${currentTrack}`;
            break;
        case 'date':
            response = new Date().toString();
            break;
        case 'whoami':
            response = 'GUEST USER (UNAUTHORIZED)';
            break;
        case 'sudo':
            response = 'ACCESS DENIED. INCIDENT REPORTED.';
            break;
        case 'clear':
            terminalOutput.innerHTML = '';
            return;
        case 'exit':
            window.toggleTerminal();
            return;
        default:
            if (cmd.startsWith('echo ')) {
                response = cmd.substring(5);
            } else {
                response = `UNKNOWN COMMAND: ${cmd}`;
            }
    }

    output.innerText = `> ${cmd}\n${response}`;
    terminalOutput.appendChild(output);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}
