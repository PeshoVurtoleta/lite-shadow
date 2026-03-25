export class VisibilityCaster {
    constructor(maxEdges: number);
    cast(originX: number, originY: number, segments: Float32Array, outPoly: Float32Array): number;
    destroy(): void;
}
export default VisibilityCaster;
