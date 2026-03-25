/** @zakkster/lite-shadow — 2D Visibility Polygon */
export class VisibilityCaster {
    constructor(maxEdges) {
        this.maxRays = maxEdges * 6;

        this.angles = new Float32Array(this.maxRays);
        this.pointsX = new Float32Array(this.maxRays);
        this.pointsY = new Float32Array(this.maxRays);
        this.sortIndex = new Uint16Array(this.maxRays);

        this._uniqueAngles = new Float32Array(maxEdges * 2);
    }

    /**
     * Cast visibility polygon from origin against wall segments.
     * @param {number}       originX
     * @param {number}       originY
     * @param {Float32Array} segments Flat: [x1, y1, x2, y2, ...]
     * @param {Float32Array} outPoly  Pre-allocated: [x, y, x, y, ...]
     * @returns {number} Number of vertices written
     *
     * Usage:
     *   const n = caster.cast(px, py, walls, polyBuf);
     *   ctx.beginPath();
     *   ctx.moveTo(polyBuf[0], polyBuf[1]);
     *   for (let i = 2; i < n * 2; i += 2) ctx.lineTo(polyBuf[i], polyBuf[i+1]);
     *   ctx.closePath(); ctx.fill();
     */
    cast(originX, originY, segments, outPoly) {
        let rawAngleCount = 0;
        const numValues = segments.length;

        for (let i = 0; i < numValues; i += 2) {
            this._uniqueAngles[rawAngleCount++] = Math.fround(Math.atan2(segments[i + 1] - originY, segments[i] - originX));
        }

        // Insertion sort (zero-GC)
        for (let i = 1; i < rawAngleCount; i++) {
            const key = this._uniqueAngles[i];
            let j = i - 1;
            while (j >= 0 && this._uniqueAngles[j] > key) {
                this._uniqueAngles[j + 1] = this._uniqueAngles[j];
                j--;
            }
            this._uniqueAngles[j + 1] = key;
        }

        let rayCount = 0;
        let lastAngle = -999;

        for (let i = 0; i < rawAngleCount; i++) {
            const baseAngle = this._uniqueAngles[i];

            if (Math.abs(baseAngle - lastAngle) < 0.00001) continue;
            lastAngle = baseAngle;

            for (let j = -1; j <= 1; j++) {
                if (rayCount >= this.maxRays) break;
                const angle = baseAngle + j * 0.00001;
                this.angles[rayCount] = angle;

                const r_dx = Math.cos(angle);
                const r_dy = Math.sin(angle);

                let minT = Infinity;
                let hitX = originX;
                let hitY = originY;

                for (let s = 0; s < numValues; s += 4) {
                    const s_px1 = segments[s];
                    const s_py1 = segments[s + 1];
                    const s_px2 = segments[s + 2];
                    const s_py2 = segments[s + 3];

                    // AABB rejection (FIX: handles edge-aligned rays correctly)
                    const minX = s_px1 < s_px2 ? s_px1 : s_px2;
                    const maxX = s_px1 > s_px2 ? s_px1 : s_px2;
                    const minY = s_py1 < s_py2 ? s_py1 : s_py2;
                    const maxY = s_py1 > s_py2 ? s_py1 : s_py2;

                    if (originX < minX && r_dx <= 0) continue;
                    if (originX > maxX && r_dx >= 0) continue;
                    if (originY < minY && r_dy <= 0) continue;
                    if (originY > maxY && r_dy >= 0) continue;

                    const s_dx = s_px2 - s_px1;
                    const s_dy = s_py2 - s_py1;

                    const den = r_dx * s_dy - r_dy * s_dx;
                    if (den === 0) continue;

                    const diff_x = s_px1 - originX;
                    const diff_y = s_py1 - originY;

                    const t = (diff_x * s_dy - diff_y * s_dx) / den;
                    if (t < 0 || t >= minT) continue;

                    const u = (diff_x * r_dy - diff_y * r_dx) / den;
                    if (u < 0 || u > 1) continue;

                    minT = t;
                    hitX = originX + r_dx * t;
                    hitY = originY + r_dy * t;
                }

                this.pointsX[rayCount] = hitX;
                this.pointsY[rayCount] = hitY;
                this.sortIndex[rayCount] = rayCount;
                rayCount++;
            }
        }

        // Sort by angle
        for (let i = 1; i < rayCount; i++) {
            const keyIdx = this.sortIndex[i];
            const keyAngle = this.angles[keyIdx];
            let j = i - 1;

            while (j >= 0 && this.angles[this.sortIndex[j]] > keyAngle) {
                this.sortIndex[j + 1] = this.sortIndex[j];
                j--;
            }
            this.sortIndex[j + 1] = keyIdx;
        }

        // FIX: Bounds check must verify space for BOTH x and y writes
        let writeLen = 0;
        for (let i = 0; i < rayCount; i++) {
            if (writeLen + 2 > outPoly.length) break; // FIX: was `writeLen >= outPoly.length`
            const sortedIdx = this.sortIndex[i];
            outPoly[writeLen++] = this.pointsX[sortedIdx];
            outPoly[writeLen++] = this.pointsY[sortedIdx];
        }

        return writeLen / 2;
    }

    /** Release all typed arrays. */
    destroy() {
        this.angles = this.pointsX = this.pointsY = null;
        this.sortIndex = this._uniqueAngles = null;
    }
}

export default VisibilityCaster;

