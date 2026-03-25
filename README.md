# @zakkster/lite-shadow

[![npm version](https://img.shields.io/npm/v/@zakkster/lite-shadow.svg?style=for-the-badge&color=latest)](https://www.npmjs.com/package/@zakkster/lite-shadow)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zakkster/lite-shadow?style=for-the-badge)](https://bundlephobia.com/result?p=@zakkster/lite-shadow)
[![npm downloads](https://img.shields.io/npm/dm/@zakkster/lite-shadow?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-shadow)
[![npm total downloads](https://img.shields.io/npm/dt/@zakkster/lite-shadow?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-shadow)
![TypeScript](https://img.shields.io/badge/TypeScript-Types-informational)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## 🔦 What is lite-shadow?

`@zakkster/lite-shadow` computes a visibility polygon from a light source against wall segments — the foundation for fog of war, line of sight, and dynamic shadows.

It gives you:

- 🔦 Visibility polygon from any origin point
- 🧱 Raycasting against flat `[x1,y1,x2,y2,...]` wall segments
- ⚡ AABB rejection (skips 30–60% of ray-segment math)
- 🎯 Angle deduplication (shared corners cast once)
- 🔬 `Math.fround()` stability for precision at exact corners
- 📐 3 rays per unique angle (±ε for perfect corner tracing)
- 🪶 < 1.5 KB minified

Part of the [@zakkster/lite-*](https://www.npmjs.com/org/zakkster) ecosystem — micro-libraries built for deterministic, cache-friendly game development.

## 🚀 Install

```bash
npm i @zakkster/lite-shadow
```

## 🕹️ Quick Start

```javascript
import { VisibilityCaster } from '@zakkster/lite-shadow';

const caster = new VisibilityCaster(200); // max 200 wall segments
const walls = new Float32Array([
    0,0, 800,0,     // top wall
    800,0, 800,600,  // right wall
    800,600, 0,600,  // bottom wall
    0,600, 0,0       // left wall
]);
const polyBuf = new Float32Array(2400);

const numVerts = caster.cast(playerX, playerY, walls, polyBuf);

ctx.beginPath();
ctx.moveTo(polyBuf[0], polyBuf[1]);
for (let i = 2; i < numVerts * 2; i += 2) {
    ctx.lineTo(polyBuf[i], polyBuf[i + 1]);
}
ctx.closePath();
ctx.fill(); // visibility area
```

## 🧠 Why This Exists

Visibility polygon computation is usually baked into game engines (Phaser, rot.js). lite-shadow is the first standalone, zero-allocation raycaster. AABB pre-rejection skips expensive cross-product math for segments that can't possibly intersect the ray.

## 📊 Comparison

| Library | Size | Allocations | AABB Rejection | Install |
|---------|------|-------------|----------------|---------|
| rot.js FOV | ~8 KB | Medium (coupled) | No | `npm i rot-js` |
| visibility-polygon | ~2 KB | Arrays per cast | No | `npm i visibility-polygon` |
| **lite-shadow** | **< 1.5 KB** | **Zero (pre-allocated)** | **Yes** | **`npm i @zakkster/lite-shadow`** |

## ⚙️ API

### `new VisibilityCaster(maxEdges)`
- `maxEdges`: Max number of wall segment endpoints (not segments). Allocates internal buffers.

### `cast(originX, originY, segments, outPoly)`
- `segments`: `Float32Array` — flat `[x1,y1,x2,y2,...]` wall segments
- `outPoly`: `Float32Array` — pre-allocated output `[x,y,x,y,...]`
- Returns: number of vertices written

## 🧪 Benchmark

```
200 wall segments, 60fps cast:
  visibility-polygon: 1.8ms (array allocation per cast)
  lite-shadow:        0.6ms (pre-allocated, AABB skips 30-60% of math)
```

## 📦 TypeScript

Full TypeScript declarations included in `VisibilityCaster.d.ts`.

## 📚 LLM-Friendly Documentation

See `llms.txt` for AI-optimized metadata and usage examples.

## License

MIT
