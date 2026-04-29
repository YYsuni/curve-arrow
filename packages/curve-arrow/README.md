# curve-arrow

[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)

用纯 TypeScript 生成 SVG **`<path>` 的 `d` 字符串**：沿三次 Bézier 加宽的箭柄 + 三角箭头头部，闭合路径。**零运行时依赖**。提供完整的 TypeScript 类型与 JSDoc。

## 安装

```bash
pnpm add curve-arrow
# npm i curve-arrow
# yarn add curve-arrow
```

## 用法

坐标系与常见 SVG 视图一致：**x 向右，y 向下**。

```ts
import { buildCurvedArrowPathD } from 'curve-arrow'

const d = buildCurvedArrowPathD({ x: 100, y: 200 }, { x: 400, y: 300 })
// <path d={d} fill="currentColor" /> — 闭合路径，适合 fill
```

## API

| 名称 | 说明 |
|------|------|
| `buildCurvedArrowPathD` | 返回闭合路径的 **`d`** 字符串 |
| `getCurvedArrowPathVertices` | 与上面同源的多边形顶点，便于裁剪或与几何计算结合 |
| `getCurvedArrowPathBoundingBox` | 与 `getCurvedArrowPathVertices` 相同参数，返回包围盒或 `null` |
| `Point`、`BoundingBox` | 类型 |
| `BEND_STRENGTH_MAX`、`DEFAULT_BEND_STRENGTH`、`DEFAULT_HANDLE_SCALE_*`、`DEFAULT_SEGMENTS` | 常量默认值与弯曲强度上限 |

弯曲强度、`bendArch`（`up`/`down`）、起终点宽度、`startClearance`、`tipClearance` 等行为以 **安装的包内 `*.d.ts` / JSDoc** 为准（参数较多，编辑器悬停可查）。

## 许可证

MIT
