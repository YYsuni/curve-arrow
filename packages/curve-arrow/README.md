# curve-arrow

用纯 TypeScript 生成 SVG **`<path>` 的 `d` 字符串**：沿三次 Bézier 加宽的箭柄 + 三角箭头头部，闭合路径。**零运行时依赖**。

## `buildCurvedArrowPathD` 用法说明

```ts
import { buildCurvedArrowPathD } from 'curve-arrow'

const d = buildCurvedArrowPathD({ x: 100, y: 200 }, { x: 400, y: 300 })
// <path d={d} fill="currentColor" />
```

| 参数               | 面板文案            | 范围              |
| ------------------ | ------------------- | ----------------- |
| `bendStrength`     | 弯曲                | `0～10`           |
| `bendArch`         | 朝向（向上 / 向下） | `'up'` / `'down'` |
| `handleScaleX`     | X 轴缩放            | `0.2～1.5`        |
| `handleScaleY`     | Y 轴缩放            | `0.2～1.5`        |
| `segments`         | 细分                | `1～160`          |
| `startWidth`       | 起点宽度            | `4～96`           |
| `endWidth`         | 终点宽度            | `4～96`           |
| `startClearance`   | 起点偏移            | `0～120`          |
| `tipClearance`     | 终点偏移            | `0～120`          |
| `arrowBaseExtraPx` | 箭头宽度            | `0～64`           |
| `arrowTipScale`    | 箭头长度            | `1～2.5`，`0.05`  |

## 许可证

MIT
