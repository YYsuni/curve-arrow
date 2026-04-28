export type Point = { x: number; y: number }

const EPS = 1e-6

type CubicHandles = {
	c1: Point
	c2: Point
	/** 终点处切向单位向量（指向终点内侧，与箭头方向一致） */
	endTangent: Point
}

/** 拱起侧单位法向：SVG y 向下时 up = 弦左侧法向，down = 取反 */
function bulgeNormal(ux: number, uy: number, bendArch: 'up' | 'down'): Point {
	const nx = bendArch === 'up' ? uy : -uy
	const ny = bendArch === 'up' ? -ux : ux
	const L = Math.hypot(nx, ny) || 1
	return { x: nx / L, y: ny / L }
}

/** bendStrength ∈ [0,1]：拱起与沿弦伸出量 */
function cubicHandlesDoubleBend(a: Point, b: Point, bendStrength: number, bendArch: 'up' | 'down'): CubicHandles {
	const dx = b.x - a.x
	const dy = b.y - a.y
	const len = Math.hypot(dx, dy)
	if (len < EPS) {
		const c = { x: a.x + 1, y: a.y }
		return {
			c1: c,
			c2: { x: b.x - 1, y: b.y },
			endTangent: { x: 1, y: 0 }
		}
	}

	const t = Math.min(1, Math.max(0, bendStrength))
	const ux = dx / len
	const uy = dy / len
	const n = bulgeNormal(ux, uy, bendArch)
	const basis = 0.5 * (Math.abs(dx) + Math.abs(dy))

	const BULGE_PER_SPAN = 0.24
	const bulge = Math.min(t * BULGE_PER_SPAN * basis, len * 0.48)

	const alongMax = Math.min(len * 0.42, 270)
	const along = alongMax * (0.2 + 0.8 * t)

	const c1: Point = {
		x: a.x + ux * along + n.x * bulge,
		y: a.y + uy * along + n.y * bulge
	}
	const c2: Point = {
		x: b.x - ux * along + n.x * bulge,
		y: b.y - uy * along + n.y * bulge
	}

	const tx = b.x - c2.x
	const ty = b.y - c2.y
	const tlen = Math.hypot(tx, ty) || 1
	return { c1, c2, endTangent: { x: tx / tlen, y: ty / tlen } }
}

function normalize(v: Point): Point {
	const L = Math.hypot(v.x, v.y) || 1
	return { x: v.x / L, y: v.y / L }
}

/** 三次贝塞尔上一点及其导数（同一套 Bernstein 系数） */
function cubicPointDerivative(a: Point, c1: Point, c2: Point, b: Point, t: number): { p: Point; d: Point } {
	const u = 1 - t
	const u2 = u * u
	const u3 = u2 * u
	const t2 = t * t
	const t3 = t2 * t
	return {
		p: {
			x: u3 * a.x + 3 * u2 * t * c1.x + 3 * u * t2 * c2.x + t3 * b.x,
			y: u3 * a.y + 3 * u2 * t * c1.y + 3 * u * t2 * c2.y + t3 * b.y
		},
		d: {
			x: 3 * u2 * (c1.x - a.x) + 6 * u * t * (c2.x - c1.x) + 3 * t2 * (b.x - c2.x),
			y: 3 * u2 * (c1.y - a.y) + 6 * u * t * (c2.y - c1.y) + 3 * t2 * (b.y - c2.y)
		}
	}
}

function smoothstep01(t: number) {
	const x = Math.min(1, Math.max(0, t))
	return x * x * (3 - 2 * x)
}

/**
 * 单一路径：沿三次贝塞尔变宽的箭柄 + 三角形箭头（闭合 `d`）。
 *
 * **端点坐标**
 * @param a 起点
 * @param b 终点
 * @param bendStrength 弯曲强度，数学上用于 `cubicHandlesDoubleBend`，内部夹在 `[0, 1]`。
 * @param endWidth 箭柄末端总宽度（px），影响宽度插值与尖端基础伸出长度。**4～96**（「终点宽度」）。
 * @param tipClearance 几何终点沿切向往回缩的量（px），使箭头与控制点保持距离。**0～120**（「终点留白」）。
 * @param arrowBaseExtraPx 箭头底边相对柄端「嘴角」沿法向外扩（单侧 px）。**0～64**（「箭头底边外扩」）。
 * @param arrowTipScale 尖端长度在基础上的倍率；实现中取 `Math.max(0.35, arrowTipScale)`。
 * @param bendArch 拱向弦线的哪一侧：'up' = 弦在屏幕坐标左侧法向朝上；'down' = 反向。
 * @param segments 贝塞尔离散段数（影响柄缘折线逼近）。
 */
export function buildCurvedArrowPathD(
	a: Point,
	b: Point,
	bendStrength = 0.8,
	endWidth = 32,
	tipClearance = 50,
	arrowBaseExtraPx = 18,
	arrowTipScale = 1.5,
	bendArch: 'up' | 'down',
	segments = 20
): string {
	if (Math.hypot(b.x - a.x, b.y - a.y) < EPS) return ''

	const gap = Math.max(0, tipClearance)
	const { endTangent: tToB } = cubicHandlesDoubleBend(a, b, bendStrength, bendArch)
	const bDraw: Point = {
		x: b.x - tToB.x * gap,
		y: b.y - tToB.y * gap
	}

	const { c1, c2, endTangent } = cubicHandlesDoubleBend(a, bDraw, bendStrength, bendArch)

	const w0 = Math.max(1.2, endWidth * 0.05)
	const w1 = Math.max(w0 + 1.5, endWidth)
	const tipExt = Math.max(6, endWidth * 0.53 + 12) * Math.max(0.35, arrowTipScale)
	const flare = Math.max(0, arrowBaseExtraPx)

	const left: Point[] = []
	const right: Point[] = []
	let prevN: Point | null = null
	let nEnd: Point = { x: 0, y: 1 }

	for (let i = 0; i <= segments; i++) {
		const t = i / segments
		const { p, d } = cubicPointDerivative(a, c1, c2, bDraw, t)
		let T = normalize(d)
		if (Math.hypot(T.x, T.y) < EPS) T = endTangent

		let N: Point = { x: -T.y, y: T.x }
		if (prevN && N.x * prevN.x + N.y * prevN.y < 0) {
			N = { x: -N.x, y: -N.y }
		}
		prevN = N
		if (i === segments) nEnd = N

		const half = 0.5 * (w0 + (w1 - w0) * smoothstep01(t))
		left.push({ x: p.x + N.x * half, y: p.y + N.y * half })
		right.push({ x: p.x - N.x * half, y: p.y - N.y * half })
	}

	const xy = (p: Point) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`

	const n = segments
	const mouthL = left[n]!
	const mouthR = right[n]!
	const headBaseL: Point = {
		x: mouthL.x + nEnd.x * flare,
		y: mouthL.y + nEnd.y * flare
	}
	const headBaseR: Point = {
		x: mouthR.x - nEnd.x * flare,
		y: mouthR.y - nEnd.y * flare
	}
	const tip: Point = {
		x: bDraw.x + endTangent.x * tipExt,
		y: bDraw.y + endTangent.y * tipExt
	}

	const parts: string[] = [`M ${xy(left[0]!)}`]
	for (let i = 1; i <= n; i++) parts.push(`L ${xy(left[i]!)}`)
	parts.push(`L ${xy(headBaseL)}`, `L ${xy(tip)}`, `L ${xy(headBaseR)}`, `L ${xy(mouthR)}`)
	for (let i = n - 1; i >= 0; i--) parts.push(`L ${xy(right[i]!)}`)
	parts.push('Z')
	return parts.join(' ')
}
