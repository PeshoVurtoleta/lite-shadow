import { describe, it, expect } from 'vitest';
import { VisibilityCaster } from './VisibilityCaster.js';

describe('VisibilityCaster', () => {
    it('constructs with correct buffer sizes', () => {
        const vc = new VisibilityCaster(100);
        expect(vc.maxRays).toBe(600);
        expect(vc.angles.length).toBe(600);
    });

    it('casts against a box and returns vertices', () => {
        // 4 walls forming a box
        const walls = new Float32Array([
            0, 0, 100, 0,     // top
            100, 0, 100, 100,  // right
            100, 100, 0, 100,  // bottom
            0, 100, 0, 0,      // left
        ]);
        const vc = new VisibilityCaster(4);
        const out = new Float32Array(200);
        const n = vc.cast(50, 50, walls, out);
        expect(n).toBeGreaterThan(0);
    });

    it('returns 0 vertices for no segments', () => {
        const vc = new VisibilityCaster(10);
        const out = new Float32Array(100);
        const n = vc.cast(50, 50, new Float32Array(0), out);
        expect(n).toBe(0);
    });

    it('output buffer bounds check works', () => {
        const walls = new Float32Array([0, 0, 100, 0, 100, 0, 100, 100]);
        const vc = new VisibilityCaster(2);
        const tinyOut = new Float32Array(4); // Very small buffer
        const n = vc.cast(50, 50, walls, tinyOut);
        expect(n).toBeLessThanOrEqual(2); // Can't write more than fits
    });

    it('hit points are within world bounds', () => {
        const walls = new Float32Array([0, 0, 200, 0, 200, 0, 200, 200, 200, 200, 0, 200, 0, 200, 0, 0]);
        const vc = new VisibilityCaster(4);
        const out = new Float32Array(500);
        const n = vc.cast(100, 100, walls, out);
        for (let i = 0; i < n * 2; i += 2) {
            expect(out[i]).toBeGreaterThanOrEqual(-1);
            expect(out[i]).toBeLessThanOrEqual(201);
        }
    });

    it('destroy nulls typed arrays', () => {
        const vc = new VisibilityCaster(10);
        vc.destroy();
        expect(vc.angles).toBeNull();
        expect(vc.pointsX).toBeNull();
    });
});
