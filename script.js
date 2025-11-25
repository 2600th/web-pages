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
        this.sequencePad = [];
        this.sequenceStabs = [];

        // Scale definitions for synthwave keys
        this.scales = {
            'Am': { root: 'A', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], chords: ['Am', 'Dm', 'Em', 'F', 'G'] },
            'Em': { root: 'E', notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'], chords: ['Em', 'Am', 'Bm', 'C', 'D'] },
            'F#m': { root: 'F#', notes: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'], chords: ['F#m', 'Bm', 'C#m', 'D', 'E'] },
            'Cm': { root: 'C', notes: ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'], chords: ['Cm', 'Fm', 'Gm', 'G#', 'A#'] }
        };

        // Define multiple tracks – epic, upbeat synthwave masterpieces
        // Each track is 512 steps (~64 seconds at 120 BPM) with multiple sections
        this.tracks = [
            {
                name: 'SINGULARITY PROTOCOL',
                bpm: 126,
                // Cinematic hacker incursion – D minor with escalating tension
                bass: this.generateSingularityBass(512),
                melody: this.generateSingularityMelody(512),
                lead: this.generateSingularityLead(512),
                pad: this.generateSingularityPads(512),
                stabs: this.generateSingularityStabs(512)
            },
            {
                name: 'STARFORGE ASCENT',
                bpm: 120,
                // Deep-space escape sequence – B minor with heroic lifts
                bass: this.generateStarforgeBass(512),
                melody: this.generateStarforgeMelody(512),
                lead: this.generateStarforgeLead(512),
                pad: this.generateStarforgePads(512),
                stabs: this.generateStarforgeStabs(512)
            },
            {
                name: 'LASER VELOCITY',
                bpm: 135,
                // High-energy arcade synthwave - F# minor
                bass: this.generateEpicBass('F#m', 512, 'pulse'),
                melody: this.generateEpicMelody('F#m', 512, 'retro'),
                lead: this.generateLead('F#m', 512, 'arcade')
            },
            {
                name: 'MIDNIGHT RUNNER',
                bpm: 124,
                // Dark, mysterious outrun vibes - C minor
                bass: this.generateEpicBass('Cm', 512, 'outrun'),
                melody: this.generateEpicMelody('Cm', 512, 'mysterious'),
                lead: this.generateLead('Cm', 512, 'dark')
            }
        ];

        this.currentTrackIndex = 0;
        this.updateTrack();
    }

    // Generate epic bass patterns with different styles
    generateEpicBass(key, length, style) {
        const scale = this.scales[key];
        const root = scale.root;
        const pattern = [];
        
        // Chord progressions for different sections (each section is 64 steps)
        const progressions = {
            'Am': [['A1', 'A2'], ['F1', 'F2'], ['G1', 'G2'], ['E1', 'E2'], ['A1', 'A2'], ['D1', 'D2'], ['F1', 'F2'], ['G1', 'G2']],
            'Em': [['E1', 'E2'], ['C1', 'C2'], ['D1', 'D2'], ['B1', 'B2'], ['E1', 'E2'], ['A1', 'A2'], ['C1', 'C2'], ['D1', 'D2']],
            'F#m': [['F#1', 'F#2'], ['D1', 'D2'], ['E1', 'E2'], ['C#1', 'C#2'], ['F#1', 'F#2'], ['B1', 'B2'], ['D1', 'D2'], ['E1', 'E2']],
            'Cm': [['C1', 'C2'], ['G#1', 'G#2'], ['A#1', 'A#2'], ['G1', 'G2'], ['C1', 'C2'], ['F1', 'F2'], ['G#1', 'G#2'], ['A#1', 'A#2']]
        };
        
        const chords = progressions[key];
        
        for (let section = 0; section < 8; section++) {
            const [low, high] = chords[section % chords.length];
            
            for (let i = 0; i < 64; i++) {
                if (style === 'driving') {
                    // Driving octave-pumping bass
                    if (i % 4 === 0) pattern.push(low);
                    else if (i % 4 === 2) pattern.push(high);
                    else if (i % 2 === 0) pattern.push(low);
                    else pattern.push(null);
                } else if (style === 'cinematic') {
                    // Long sustained notes with occasional octave hits
                    if (i % 16 === 0) pattern.push(low);
                    else if (i % 16 === 8) pattern.push(high);
                    else if (i % 16 === 12) pattern.push(low);
                    else pattern.push(null);
                } else if (style === 'pulse') {
                    // Fast pulsing synthwave bass
                    if (i % 2 === 0) pattern.push(low);
                    else pattern.push(high);
                } else if (style === 'outrun') {
                    // Classic outrun rolling bass
                    const subPattern = [low, null, low, high, low, null, high, null];
                    pattern.push(subPattern[i % 8]);
                }
            }
        }
        
        return pattern.slice(0, length);
    }

    // Generate epic melody patterns with arpeggios and hooks
    generateEpicMelody(key, length, style) {
        const scale = this.scales[key];
        const pattern = [];
        
        // Arpeggio patterns for each key
        const arps = {
            'Am': {
                section1: ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'A3', 'E3'],
                section2: ['F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'F3', 'C3'],
                section3: ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'G3', 'D3'],
                section4: ['E3', 'G3', 'B3', 'E4', 'B3', 'G3', 'E3', 'B2'],
                hook: ['A4', null, 'C5', 'B4', 'A4', null, 'G4', 'E4', 'A4', null, 'C5', 'D5', 'E5', null, 'D5', 'C5']
            },
            'Em': {
                section1: ['E3', 'G3', 'B3', 'E4', 'B3', 'G3', 'E3', 'B2'],
                section2: ['C3', 'E3', 'G3', 'C4', 'G3', 'E3', 'C3', 'G2'],
                section3: ['D3', 'F#3', 'A3', 'D4', 'A3', 'F#3', 'D3', 'A2'],
                section4: ['B2', 'D3', 'F#3', 'B3', 'F#3', 'D3', 'B2', 'F#2'],
                hook: ['E4', null, 'G4', 'F#4', 'E4', null, 'D4', 'B3', 'E4', null, 'G4', 'A4', 'B4', null, 'A4', 'G4']
            },
            'F#m': {
                section1: ['F#3', 'A3', 'C#4', 'F#4', 'C#4', 'A3', 'F#3', 'C#3'],
                section2: ['D3', 'F#3', 'A3', 'D4', 'A3', 'F#3', 'D3', 'A2'],
                section3: ['E3', 'G#3', 'B3', 'E4', 'B3', 'G#3', 'E3', 'B2'],
                section4: ['C#3', 'E3', 'G#3', 'C#4', 'G#3', 'E3', 'C#3', 'G#2'],
                hook: ['F#4', null, 'A4', 'G#4', 'F#4', null, 'E4', 'C#4', 'F#4', null, 'A4', 'B4', 'C#5', null, 'B4', 'A4']
            },
            'Cm': {
                section1: ['C3', 'D#3', 'G3', 'C4', 'G3', 'D#3', 'C3', 'G2'],
                section2: ['G#2', 'C3', 'D#3', 'G#3', 'D#3', 'C3', 'G#2', 'D#2'],
                section3: ['A#2', 'D3', 'F3', 'A#3', 'F3', 'D3', 'A#2', 'F2'],
                section4: ['G2', 'A#2', 'D3', 'G3', 'D3', 'A#2', 'G2', 'D2'],
                hook: ['C4', null, 'D#4', 'D4', 'C4', null, 'A#3', 'G3', 'C4', null, 'D#4', 'F4', 'G4', null, 'F4', 'D#4']
            }
        };
        
        const keyArps = arps[key];
        const sections = ['section1', 'section2', 'section3', 'section4', 'section1', 'section2', 'section3', 'section4'];
        
        for (let section = 0; section < 8; section++) {
            const arp = keyArps[sections[section]];
            const hook = keyArps.hook;
            
            for (let i = 0; i < 64; i++) {
                if (style === 'arpeggio') {
                    // Fast arpeggios with occasional hooks
                    if (section % 2 === 1 && i >= 48) {
                        pattern.push(hook[i - 48] || null);
                    } else if (i % 2 === 0) {
                        pattern.push(arp[(i / 2) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (style === 'epic') {
                    // Building epic melodies with sustained notes and hooks
                    if (section >= 4 && i >= 32 && i < 48) {
                        pattern.push(hook[i - 32] || null);
                    } else if (i % 8 === 0) {
                        pattern.push(arp[(i / 8) % 8]);
                    } else if (i % 8 === 4 && section >= 2) {
                        pattern.push(arp[((i / 8) + 2) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (style === 'retro') {
                    // Classic 80s arcade game style
                    if (i % 4 === 0) {
                        pattern.push(arp[(i / 4) % 8]);
                    } else if (i % 4 === 2 && i % 8 !== 6) {
                        pattern.push(arp[((i / 4) + 4) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (style === 'mysterious') {
                    // Sparse, atmospheric with tension builds
                    if (section >= 6 && i >= 32) {
                        pattern.push(hook[(i - 32) % 16] || null);
                    } else if (i % 16 === 0) {
                        pattern.push(arp[(i / 16) % 8]);
                    } else if (i % 16 === 8 && section >= 3) {
                        pattern.push(arp[((i / 16) + 3) % 8]);
                    } else {
                        pattern.push(null);
                    }
                }
            }
        }
        
        return pattern.slice(0, length);
    }

    // Generate lead synth patterns for soaring melodies
    generateLead(key, length, style) {
        const pattern = [];
        
        // Lead melody phrases for each key
        const leads = {
            'Am': {
                phrase1: ['E5', null, null, null, 'D5', null, 'C5', null, 'A4', null, null, null, null, null, null, null],
                phrase2: ['A5', null, null, null, 'G5', null, 'E5', null, 'D5', null, 'C5', null, 'A4', null, null, null],
                climax: ['E5', 'E5', null, 'D5', 'E5', null, 'G5', null, 'A5', null, null, null, 'G5', null, 'E5', null]
            },
            'Em': {
                phrase1: ['B4', null, null, null, 'A4', null, 'G4', null, 'E4', null, null, null, null, null, null, null],
                phrase2: ['E5', null, null, null, 'D5', null, 'B4', null, 'A4', null, 'G4', null, 'E4', null, null, null],
                climax: ['B4', 'B4', null, 'A4', 'B4', null, 'D5', null, 'E5', null, null, null, 'D5', null, 'B4', null]
            },
            'F#m': {
                phrase1: ['C#5', null, null, null, 'B4', null, 'A4', null, 'F#4', null, null, null, null, null, null, null],
                phrase2: ['F#5', null, null, null, 'E5', null, 'C#5', null, 'B4', null, 'A4', null, 'F#4', null, null, null],
                climax: ['C#5', 'C#5', null, 'B4', 'C#5', null, 'E5', null, 'F#5', null, null, null, 'E5', null, 'C#5', null]
            },
            'Cm': {
                phrase1: ['G4', null, null, null, 'F4', null, 'D#4', null, 'C4', null, null, null, null, null, null, null],
                phrase2: ['C5', null, null, null, 'A#4', null, 'G4', null, 'F4', null, 'D#4', null, 'C4', null, null, null],
                climax: ['G4', 'G4', null, 'F4', 'G4', null, 'A#4', null, 'C5', null, null, null, 'A#4', null, 'G4', null]
            }
        };
        
        const keyLead = leads[key];
        
        for (let section = 0; section < 8; section++) {
            for (let i = 0; i < 64; i++) {
                if (style === 'soaring') {
                    // Soaring lead that builds through sections
                    if (section >= 6 && i < 16) {
                        pattern.push(keyLead.climax[i]);
                    } else if (section >= 4 && section < 6 && i < 16) {
                        pattern.push(keyLead.phrase2[i]);
                    } else if (section >= 2 && section < 4 && i >= 32 && i < 48) {
                        pattern.push(keyLead.phrase1[i - 32]);
                    } else {
                        pattern.push(null);
                    }
                } else if (style === 'cinematic') {
                    // Big, sweeping cinematic lead
                    if (section >= 5 && i >= 16 && i < 32) {
                        pattern.push(keyLead.climax[i - 16]);
                    } else if (section >= 3 && i >= 48 && i < 64) {
                        pattern.push(keyLead.phrase2[i - 48]);
                    } else if (section >= 1 && section < 3 && i >= 32 && i < 48) {
                        pattern.push(keyLead.phrase1[i - 32]);
                    } else {
                        pattern.push(null);
                    }
                } else if (style === 'arcade') {
                    // Punchy arcade game lead
                    if ((section === 3 || section === 7) && i < 16) {
                        pattern.push(keyLead.climax[i]);
                    } else if ((section === 1 || section === 5) && i >= 32 && i < 48) {
                        pattern.push(keyLead.phrase1[i - 32]);
                    } else if ((section === 2 || section === 6) && i >= 16 && i < 32) {
                        pattern.push(keyLead.phrase2[i - 16]);
                    } else {
                        pattern.push(null);
                    }
                } else if (style === 'dark') {
                    // Mysterious, sparse dark lead
                    if (section >= 6 && i >= 32 && i < 48) {
                        pattern.push(keyLead.climax[i - 32]);
                    } else if (section >= 4 && section < 6 && i >= 48 && i < 64) {
                        pattern.push(keyLead.phrase2[i - 48]);
                    } else {
                        pattern.push(null);
                    }
                }
            }
        }
        
        return pattern.slice(0, length);
    }

    // ========== SINGULARITY PROTOCOL - Cinematic Hacker Theme ==========
    // Dark D minor foundations with staged escalation
    generateSingularityBass(length) {
        const progression = [
            { root: 'D1', octave: 'D2', accent: 'A0', tension: 'G#1' },
            { root: 'C1', octave: 'C2', accent: 'G0', tension: 'F#1' },
            { root: 'F1', octave: 'F2', accent: 'C1', tension: 'B0' },
            { root: 'A#0', octave: 'A#1', accent: 'F0', tension: 'E1' },
            { root: 'G1', octave: 'G2', accent: 'D1', tension: 'C#2' },
            { root: 'A#1', octave: 'A#2', accent: 'F1', tension: 'E2' },
            { root: 'D1', octave: 'D2', accent: 'A0', tension: 'G#1' },
            { root: 'G1', octave: 'G2', accent: 'D1', tension: 'C#2' }
        ];
        const pattern = [];

        for (let section = 0; section < 8; section++) {
            const block = progression[section];
            const stage = Math.floor(section / 2); // intro, breach, overload, finale
            for (let i = 0; i < 64; i++) {
                const beat = i % 16;
                if (stage === 0) {
                    if (beat === 0) {
                        pattern.push(block.root);
                    } else if (beat === 8) {
                        pattern.push(block.accent);
                    } else if (beat === 12 && section === 1) {
                        pattern.push(block.tension);
                    } else if (i % 32 === 4) {
                        pattern.push(block.octave);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 1) {
                    if (beat === 0 || beat === 8 || beat === 12) {
                        pattern.push(block.root);
                    } else if (beat === 4) {
                        pattern.push(block.octave);
                    } else if (beat === 6 || beat === 14) {
                        pattern.push(block.tension);
                    } else if (beat === 10) {
                        pattern.push(block.accent);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 2) {
                    if (i % 4 === 0) {
                        pattern.push(block.root);
                    } else if (i % 4 === 2) {
                        pattern.push(block.octave);
                    } else if (beat === 6 || beat === 13) {
                        pattern.push(block.tension);
                    } else if (beat === 9) {
                        pattern.push(block.accent);
                    } else {
                        pattern.push(null);
                    }
                } else {
                    if (i % 2 === 0) {
                        pattern.push(block.root);
                    } else if (i % 4 === 1) {
                        pattern.push(block.octave);
                    } else if (beat === 7 || beat === 15) {
                        pattern.push(block.tension);
                    } else if (beat === 11) {
                        pattern.push(block.accent);
                    } else if (section === 7 && beat === 3) {
                        pattern.push('D2');
                    } else {
                        pattern.push(null);
                    }
                }
            }
        }
        return pattern.slice(0, length);
    }

    generateSingularityMelody(length) {
        const motifs = [
            ['D3', 'F3', 'A3', 'C4', 'D4', 'F4', 'A4', 'C5'],
            ['C3', 'D#3', 'G3', 'A#3', 'C4', 'D#4', 'G4', 'A#4'],
            ['F3', 'G#3', 'C4', 'D#4', 'F4', 'G#4', 'C5', 'D#5'],
            ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5']
        ];
        const climbs = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6', 'C7', 'D7'];
        const pattern = [];

        for (let section = 0; section < 8; section++) {
            const stage = Math.floor(section / 2);
            const motif = motifs[Math.min(stage, motifs.length - 1)];
            for (let i = 0; i < 64; i++) {
                const beat = i % 16;
                if (stage === 0) {
                    if (beat === 0) {
                        pattern.push(motif[(i / 16) % 8]);
                    } else if (beat === 8) {
                        pattern.push(motif[((i / 16) + 2) % 8]);
                    } else if (section === 1 && i % 32 === 20) {
                        pattern.push(motif[((i / 16) + 5) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 1) {
                    if (i % 8 === 0) {
                        pattern.push(motif[(i / 8) % 8]);
                    } else if (i % 8 === 4) {
                        pattern.push(motif[((i / 8) + 3) % 8]);
                    } else if (beat === 10) {
                        pattern.push(motif[((i / 8) + 5) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 2) {
                    if (i % 4 === 0) {
                        pattern.push(motif[(i / 4) % 8]);
                    } else if (i % 8 === 2) {
                        pattern.push(motif[((i / 4) + 4) % 8]);
                    } else if (beat === 6) {
                        pattern.push(motif[((i / 4) + 6) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else {
                    if (section === 7 && i < climbs.length) {
                        pattern.push(climbs[i]);
                    } else if (i % 2 === 0) {
                        pattern.push(motif[(i / 2) % 8]);
                    } else if (i % 8 === 5) {
                        pattern.push(climbs[(i + section * 8) % climbs.length]);
                    } else {
                        pattern.push(null);
                    }
                }
            }
        }
        return pattern.slice(0, length);
    }

    generateSingularityLead(length) {
        const pattern = [];
        const phrases = {
            intro: [null, null, null, null, 'D5', null, null, null, 'A4', null, null, null, 'C5', null, null, null],
            breach: ['D5', null, 'F5', null, 'A5', null, 'C6', null, 'D6', null, 'C6', null, 'A5', null, 'F5', null],
            pursuit: ['F5', 'F5', null, 'D5', 'C5', null, 'A4', null, 'F5', 'F5', null, 'D5', 'C5', null, 'A4', null],
            overload: ['A5', null, 'G#5', null, 'G5', null, 'F5', null, 'E5', null, 'D5', null, 'C#5', null, 'D5', null],
            finale: ['D6', null, 'F6', null, 'A6', null, 'D6', null, 'C6', null, 'A5', null, 'F5', null, 'D5', null]
        };

        for (let section = 0; section < 8; section++) {
            const stage = Math.floor(section / 2);
            for (let i = 0; i < 64; i++) {
                let note = null;
                if (stage === 0) {
                    if (i < 16) {
                        note = phrases.intro[i];
                    } else if (section === 1 && i >= 32 && i < 48) {
                        note = phrases.intro[i - 32];
                    }
                } else if (stage === 1) {
                    if (i < 16) {
                        note = phrases.breach[i];
                    } else if (i >= 32 && i < 48) {
                        note = phrases.pursuit[i - 32];
                    }
                } else if (stage === 2) {
                    if (i < 16) {
                        note = phrases.pursuit[i];
                    } else if (i >= 16 && i < 32) {
                        note = phrases.overload[i - 16];
                    } else if (i >= 48 && i < 64) {
                        note = phrases.pursuit[i - 48];
                    }
                } else {
                    if (i < 16) {
                        note = phrases.finale[i];
                    } else if (i >= 16 && i < 32) {
                        note = phrases.overload[i - 16];
                    } else if (section === 7 && i >= 32 && i < 48) {
                        note = phrases.finale[i - 32];
                    }
                }
                pattern.push(note || null);
            }
        }
        return pattern.slice(0, length);
    }

    generateSingularityPads(length) {
        const pattern = [];
        const baseChords = [
            ['D3', 'F3', 'A3', 'C4'],
            ['C3', 'D#3', 'G3', 'A#3'],
            ['F3', 'G#3', 'C4', 'D#4'],
            ['A#2', 'D3', 'F3', 'A3'],
            ['G2', 'A#2', 'D3', 'F3'],
            ['A#2', 'D3', 'F3', 'A3'],
            ['D3', 'F3', 'A3', 'C4'],
            ['G2', 'A#2', 'D3', 'F3']
        ];
        const tensionChords = [
            ['D3', 'G#3', 'C4', 'F4'],
            ['C3', 'F3', 'A3', 'D#4'],
            ['F3', 'A3', 'C4', 'E4'],
            ['A#2', 'D#3', 'G3', 'A#3'],
            ['G2', 'C3', 'D#3', 'G3'],
            ['A#2', 'D3', 'E3', 'A3'],
            ['D3', 'G#3', 'C4', 'F4'],
            ['G2', 'C3', 'D#3', 'G3']
        ];
        const liftChords = [
            ['A3', 'C4', 'D4', 'F4'],
            ['G3', 'A#3', 'C4', 'D#4'],
            ['C4', 'D#4', 'F4', 'G4'],
            ['F3', 'A3', 'C4', 'D4'],
            ['D3', 'F3', 'G3', 'A#3'],
            ['F3', 'A3', 'C4', 'D4'],
            ['A3', 'C4', 'D4', 'F4'],
            ['D3', 'F3', 'G3', 'A#3']
        ];

        for (let section = 0; section < 8; section++) {
            const base = baseChords[section];
            const tension = tensionChords[section];
            const lift = liftChords[section];
            const resolve = baseChords[(section + 1) % baseChords.length];

            const events = [
                { chord: base, duration: 18, type: 'triangle', volume: 0.05 },
                { chord: tension, duration: 12, type: 'sine', volume: 0.035 },
                { chord: lift, duration: 14, type: 'triangle', volume: 0.045 },
                { chord: resolve, duration: 12, type: 'triangle', volume: 0.05 }
            ];

            events.forEach(event => {
                pattern.push(event);
                for (let rest = 1; rest < 16; rest++) {
                    pattern.push(null);
                }
            });
        }

        return pattern.slice(0, length);
    }

    generateSingularityStabs(length) {
        const pattern = new Array(length).fill(null);
        const chords = [
            ['D4', 'F4', 'A4'],
            ['C4', 'D#4', 'G4'],
            ['F4', 'A4', 'C5'],
            ['A#3', 'D4', 'F4'],
            ['G3', 'A#3', 'D4'],
            ['A#3', 'D4', 'F4'],
            ['D4', 'F4', 'A4'],
            ['G3', 'A#3', 'D4']
        ];

        for (let section = 2; section < 8; section++) {
            const baseIndex = section * 64;
            const chord = chords[section % chords.length];
            if (baseIndex + 8 < length) {
                pattern[baseIndex + 8] = { chord, duration: 6, type: 'sawtooth', volume: 0.075 };
            }
            if (baseIndex + 24 < length) {
                pattern[baseIndex + 24] = {
                    chord: chord.map(note => this.transposeNote(note, 1)),
                    duration: 4,
                    type: 'sawtooth',
                    volume: 0.07
                };
            }
            if (section >= 5 && baseIndex + 40 < length) {
                pattern[baseIndex + 40] = {
                    chord: chord.map(note => this.transposeNote(note, 2)),
                    duration: 6,
                    type: 'square',
                    volume: 0.06
                };
            }
        }

        return pattern;
    }

    // ========== STARFORGE ASCENT - Epic Deep-Space Theme ==========
    // B minor, heroic intervals, propulsion-focused rhythm
    generateStarforgeBass(length) {
        const progression = [
            { root: 'B1', octave: 'B2', accent: 'F#1' },
            { root: 'G1', octave: 'G2', accent: 'D1' },
            { root: 'A1', octave: 'A2', accent: 'E1' },
            { root: 'F#1', octave: 'F#2', accent: 'C#1' },
            { root: 'E1', octave: 'E2', accent: 'B0' },
            { root: 'G1', octave: 'G2', accent: 'D1' },
            { root: 'A1', octave: 'A2', accent: 'E1' },
            { root: 'B1', octave: 'B2', accent: 'F#1' }
        ];
        const pattern = [];

        for (let section = 0; section < 8; section++) {
            const block = progression[section];
            const stage = Math.floor(section / 2); // launch, ignition, warp, pursuit
            for (let i = 0; i < 64; i++) {
                const beat = i % 16;
                if (stage === 0) {
                    if (beat === 0) {
                        pattern.push(block.root);
                    } else if (beat === 12 && section === 1) {
                        pattern.push(block.octave);
                    } else if (beat === 8) {
                        pattern.push(block.accent);
                    } else if (i % 32 === 20) {
                        pattern.push(block.octave);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 1) {
                    if (beat === 0 || beat === 8) {
                        pattern.push(block.root);
                    } else if (beat === 4 || beat === 12) {
                        pattern.push(block.octave);
                    } else if (beat === 6 || beat === 14) {
                        pattern.push(block.accent);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 2) {
                    if (i % 4 === 0) {
                        pattern.push(block.root);
                    } else if (i % 4 === 2) {
                        pattern.push(block.octave);
                    } else if (beat === 10) {
                        pattern.push(block.accent);
                    } else if (beat === 6) {
                        pattern.push(block.octave);
                    } else {
                        pattern.push(null);
                    }
                } else {
                    if (i % 2 === 0) {
                        pattern.push(block.root);
                    } else if (i % 4 === 1) {
                        pattern.push(block.octave);
                    } else if (beat === 6 || beat === 14) {
                        pattern.push(block.accent);
                    } else if (section === 7 && beat === 15) {
                        pattern.push('B0');
                    } else {
                        pattern.push(null);
                    }
                }
            }
        }
        return pattern.slice(0, length);
    }

    generateStarforgeMelody(length) {
        const motifs = [
            ['B3', 'D4', 'F#4', 'A4', 'B4', 'D5', 'F#5', 'A5'],
            ['G3', 'B3', 'D4', 'F#4', 'G4', 'A4', 'B4', 'D5'],
            ['A3', 'C#4', 'E4', 'F#4', 'A4', 'B4', 'C#5', 'E5'],
            ['B3', 'D4', 'F#4', 'A4', 'B4', 'D5', 'F#5', 'B5']
        ];
        const ascents = ['B4', 'D5', 'F#5', 'A5', 'B5', 'D6', 'F#6', 'A6', 'B6', 'D7', 'F#7', 'A7', 'B7', 'D8', 'F#8', 'A8'];
        const pattern = [];

        for (let section = 0; section < 8; section++) {
            const stage = Math.floor(section / 2);
            const motif = motifs[Math.min(stage, motifs.length - 1)];
            for (let i = 0; i < 64; i++) {
                const beat = i % 16;
                if (stage === 0) {
                    if (beat === 0) {
                        pattern.push(motif[(i / 16) % 8]);
                    } else if (beat === 8) {
                        pattern.push(motif[((i / 16) + 4) % 8]);
                    } else if (section === 1 && beat === 12) {
                        pattern.push(motif[((i / 16) + 6) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 1) {
                    if (i % 8 === 0) {
                        pattern.push(motif[(i / 8) % 8]);
                    } else if (i % 8 === 4) {
                        pattern.push(motif[((i / 8) + 3) % 8]);
                    } else if (beat === 10) {
                        pattern.push(motif[((i / 8) + 5) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else if (stage === 2) {
                    if (i % 4 === 0) {
                        pattern.push(motif[(i / 4) % 8]);
                    } else if (i % 8 === 2) {
                        pattern.push(motif[((i / 4) + 4) % 8]);
                    } else if (beat === 6) {
                        pattern.push(motif[((i / 4) + 6) % 8]);
                    } else {
                        pattern.push(null);
                    }
                } else {
                    if (section === 7 && i < ascents.length) {
                        pattern.push(ascents[i]);
                    } else if (i % 2 === 0) {
                        pattern.push(motif[(i / 2) % 8]);
                    } else if (i % 8 === 5) {
                        pattern.push(ascents[(i + section * 5) % ascents.length]);
                    } else {
                        pattern.push(null);
                    }
                }
            }
        }
        return pattern.slice(0, length);
    }

    generateStarforgeLead(length) {
        const pattern = [];
        const phrases = {
            horizon: [null, null, null, null, 'B5', null, null, null, 'F#5', null, null, null, 'D5', null, null, null],
            burn: ['B5', null, 'D6', null, 'F#6', null, 'A6', null, 'B6', null, 'A6', null, 'F#6', null, 'D6', null],
            pursuit: ['F#6', 'F#6', null, 'E6', 'D6', null, 'B5', null, 'F#6', 'F#6', null, 'E6', 'D6', null, 'B5', null],
            nova: ['B6', null, 'A6', null, 'F#6', null, 'D6', null, 'B5', null, 'D6', null, 'F#6', null, 'A6', null],
            victory: ['B6', null, 'F#7', null, 'B7', null, 'F#7', null, 'D7', null, 'B6', null, 'F#6', null, 'D6', null]
        };

        for (let section = 0; section < 8; section++) {
            const stage = Math.floor(section / 2);
            for (let i = 0; i < 64; i++) {
                let note = null;
                if (stage === 0) {
                    if (i < 16) {
                        note = phrases.horizon[i];
                    } else if (section === 1 && i >= 32 && i < 48) {
                        note = phrases.horizon[i - 32];
                    }
                } else if (stage === 1) {
                    if (i < 16) {
                        note = phrases.burn[i];
                    } else if (i >= 32 && i < 48) {
                        note = phrases.pursuit[i - 32];
                    }
                } else if (stage === 2) {
                    if (i < 16) {
                        note = phrases.pursuit[i];
                    } else if (i >= 16 && i < 32) {
                        note = phrases.nova[i - 16];
                    } else if (i >= 48 && i < 64) {
                        note = phrases.pursuit[i - 48];
                    }
                } else {
                    if (i < 16) {
                        note = phrases.victory[i];
                    } else if (i >= 16 && i < 32) {
                        note = phrases.nova[i - 16];
                    } else if (section === 7 && i >= 32 && i < 48) {
                        note = phrases.victory[i - 32];
                    }
                }
                pattern.push(note || null);
            }
        }
        return pattern.slice(0, length);
    }

    generateStarforgePads(length) {
        const pattern = [];
        const baseChords = [
            ['B3', 'D4', 'F#4', 'A4'],
            ['G3', 'B3', 'D4', 'F#4'],
            ['A3', 'C#4', 'E4', 'G4'],
            ['F#3', 'A3', 'C#4', 'E4'],
            ['E3', 'G#3', 'B3', 'D4'],
            ['G3', 'B3', 'D4', 'F#4'],
            ['A3', 'C#4', 'E4', 'G4'],
            ['B3', 'D4', 'F#4', 'A4']
        ];
        const sparkleChords = [
            ['D4', 'F#4', 'A4', 'C5'],
            ['B3', 'D4', 'G4', 'A4'],
            ['C#4', 'E4', 'G4', 'A4'],
            ['A3', 'C#4', 'E4', 'G#4'],
            ['F#3', 'A3', 'C#4', 'E4'],
            ['B3', 'D4', 'F#4', 'A4'],
            ['C#4', 'E4', 'G4', 'B4'],
            ['D4', 'F#4', 'A4', 'C5']
        ];
        const liftChords = [
            ['F#4', 'A4', 'B4', 'D5'],
            ['D4', 'F#4', 'A4', 'B4'],
            ['E4', 'G4', 'A4', 'C#5'],
            ['B3', 'D4', 'F#4', 'A4'],
            ['A3', 'C#4', 'E4', 'G4'],
            ['D4', 'F#4', 'A4', 'C5'],
            ['E4', 'G4', 'B4', 'D5'],
            ['F#4', 'A4', 'B4', 'D5']
        ];

        for (let section = 0; section < 8; section++) {
            const base = baseChords[section];
            const sparkle = sparkleChords[section];
            const lift = liftChords[section];
            const resolve = baseChords[(section + 1) % baseChords.length];

            const events = [
                { chord: base, duration: 18, type: 'triangle', volume: 0.05 },
                { chord: sparkle, duration: 12, type: 'sine', volume: 0.04 },
                { chord: lift, duration: 16, type: 'triangle', volume: 0.05 },
                { chord: resolve, duration: 12, type: 'triangle', volume: 0.05 }
            ];

            events.forEach(event => {
                pattern.push(event);
                for (let rest = 1; rest < 16; rest++) {
                    pattern.push(null);
                }
            });
        }

        return pattern.slice(0, length);
    }

    generateStarforgeStabs(length) {
        const pattern = new Array(length).fill(null);
        const chords = [
            ['B4', 'D5', 'F#5'],
            ['G4', 'B4', 'D5'],
            ['A4', 'C#5', 'E5'],
            ['F#4', 'A4', 'C#5'],
            ['E4', 'G#4', 'B4'],
            ['G4', 'B4', 'D5'],
            ['A4', 'C#5', 'E5'],
            ['B4', 'D5', 'F#5']
        ];

        for (let section = 3; section < 8; section++) {
            const baseIndex = section * 64;
            const chord = chords[section % chords.length];
            if (baseIndex + 4 < length) {
                pattern[baseIndex + 4] = { chord, duration: 6, type: 'sawtooth', volume: 0.08 };
            }
            if (baseIndex + 20 < length) {
                pattern[baseIndex + 20] = {
                    chord: chord.map(note => this.transposeNote(note, 1)),
                    duration: 4,
                    type: 'square',
                    volume: 0.07
                };
            }
            if (section >= 5 && baseIndex + 36 < length) {
                pattern[baseIndex + 36] = {
                    chord: chord.map(note => this.transposeNote(note, 2)),
                    duration: 6,
                    type: 'sawtooth',
                    volume: 0.065
                };
            }
        }

        return pattern;
    }

    updateTrack() {
        const track = this.tracks[this.currentTrackIndex];
        this.bpm = track.bpm;
        this.noteDuration = 60 / this.bpm / 4;
        this.sequenceBass = track.bass;
        this.sequenceMelody = track.melody;
        this.sequenceLead = track.lead || [];
        this.sequencePad = track.pad || [];
        this.sequenceStabs = track.stabs || [];
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

    transposeNote(note, octaves = 1) {
        if (!note) return note;
        const match = note.match(/^([A-G]#?)(-?\d)$/);
        if (!match) return note;
        const [, pitch, octaveStr] = match;
        const octave = parseInt(octaveStr, 10) + octaves;
        return `${pitch}${octave}`;
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

    playChord(notes, type, startTime, duration, vol = 0.05) {
        if (!notes) return;
        const chord = Array.isArray(notes) ? notes : [notes];
        chord.forEach((note, index) => {
            if (!note) return;
            const freq = this.noteToFreq(note);
            if (freq <= 0) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            // Slight detune per voice to feel wider
            osc.detune.value = (index - (chord.length - 1) / 2) * 6;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, startTime);
            gain.gain.linearRampToValueAtTime(vol * 0.6, startTime + duration * 0.4);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    playNoise(time) {
        // Open hi-hat with metallic character
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        // Highpass for brightness
        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 8000;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        
        noise.connect(highpass);
        highpass.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(time);
    }

    playKick(time) {
        // Punchy synthwave kick with body
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const gain2 = this.ctx.createGain();
        
        // Main kick
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.2);
        
        // Click layer for attack
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(800, time);
        osc2.frequency.exponentialRampToValueAtTime(100, time + 0.02);
        gain2.gain.setValueAtTime(0.15, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(time);
        osc2.stop(time + 0.05);
    }

    playSnare(time) {
        // Punchy 80s-style snare
        const osc = this.ctx.createOscillator();
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
        const noise = this.ctx.createBufferSource();
        const noiseData = noiseBuffer.getChannelData(0);
        
        // Generate noise
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        // Noise part
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(time);
        
        // Tonal body
        const oscGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(120, time + 0.05);
        oscGain.gain.setValueAtTime(0.2, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    playCrash(time) {
        // Bright crash cymbal
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 6000;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
        
        noise.connect(highpass);
        highpass.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(time);
    }

    scheduleNote() {
        const time = this.nextNoteTime;

        // Bass - punchy synthwave bass
        const bassNote = this.sequenceBass[this.currentNote % this.sequenceBass.length];
        if (bassNote) {
            this.playTone(this.noteToFreq(bassNote), 'sawtooth', time, 0.15, 0.18);
            // Add sub-bass layer
            this.playTone(this.noteToFreq(bassNote) * 0.5, 'sine', time, 0.2, 0.12);
        }

        // Melody - shimmering arpeggios
        const melodyNote = this.sequenceMelody[this.currentNote % this.sequenceMelody.length];
        if (melodyNote) {
            this.playTone(this.noteToFreq(melodyNote), 'square', time, 0.08, 0.06);
            // Add slight detuned layer for thickness
            this.playTone(this.noteToFreq(melodyNote) * 1.005, 'triangle', time, 0.1, 0.04);
        }

        // Lead synth - soaring leads with longer sustain
        if (this.sequenceLead && this.sequenceLead.length > 0) {
            const leadNote = this.sequenceLead[this.currentNote % this.sequenceLead.length];
            if (leadNote) {
                this.playTone(this.noteToFreq(leadNote), 'sawtooth', time, 0.25, 0.1);
                // Add octave layer for epic feel
                this.playTone(this.noteToFreq(leadNote) * 2, 'sine', time, 0.2, 0.05);
            }
        }

        // Pad layer - sustained harmonic bed
        if (this.sequencePad && this.sequencePad.length > 0) {
            const padEvent = this.sequencePad[this.currentNote % this.sequencePad.length];
            if (padEvent) {
                const padChord = padEvent.chord || padEvent;
                const padDuration = (padEvent.duration || 12) * this.noteDuration;
                const padType = padEvent.type || 'triangle';
                const padVolume = padEvent.volume || 0.045;
                this.playChord(padChord, padType, time, padDuration, padVolume);
            }
        }

        // Stabs / brass hits for impact
        if (this.sequenceStabs && this.sequenceStabs.length > 0) {
            const stabEvent = this.sequenceStabs[this.currentNote % this.sequenceStabs.length];
            if (stabEvent) {
                const stabChord = stabEvent.chord || stabEvent;
                const stabDuration = (stabEvent.duration || 4) * this.noteDuration;
                const stabType = stabEvent.type || 'sawtooth';
                const stabVolume = stabEvent.volume || 0.08;
                this.playChord(stabChord, stabType, time, stabDuration, stabVolume);
            }
        }

        // Drums - punchy synthwave drums
        const section = Math.floor(this.currentNote / 64) % 8;
        const inSection = this.currentNote % 64;
        
        // Kick drum pattern - four on the floor with variations
        if (this.currentNote % 4 === 0) {
            this.playKick(time);
        }
        // Additional kick hits for drive
        if ((this.currentNote % 16 === 14 || this.currentNote % 32 === 30) && section >= 2) {
            this.playKick(time);
        }
        
        // Snare on 2 and 4
        if (this.currentNote % 8 === 4) {
            this.playSnare(time);
        }
        
        // Open hi-hat
        if (this.currentNote % 4 === 2) {
            this.playNoise(time);
        }
        
        // Closed hi-hat - driving 8th or 16th notes depending on section
        if (section >= 4) {
            // Fast 16th note hats for energy
            this.playTone(10000, 'square', time, 0.015, 0.015);
        } else if (this.currentNote % 2 === 0) {
            // 8th note hats
            this.playTone(8000, 'square', time, 0.02, 0.02);
        }

        // Crash on section changes
        if (inSection === 0 && section > 0) {
            this.playCrash(time);
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
            response = 'USER: PRANSHUL | CLASS: SYSTEMS ARCH-MAGE | LVL: 26XX | STATUS: QUANTUM-UNLOCKED';
            break;
        case 'skills':
            response = 'Unity3D, Unreal Engine, C#, C++, Python, WebGL, XR Ops, AI Pipelines';
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
