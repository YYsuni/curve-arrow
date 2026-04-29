export type Point = { x: number; y: number }

const EPS = 1e-6

export const BEND_STRENGTH_MAX = 10
export const DEFAULT_BEND_STRENGTH = 0.8

function bendStrengthToInternalT(raw: number): number {
	const s = Math.min(BEND_STRENGTH_MAX, Math.max(0, raw))
	if (s <= 1) return s
	const T_AT_MAX = 5
	return 1 + ((s - 1) / (BEND_STRENGTH_MAX - 1)) * (T_AT_MAX - 1)
}

type CubicHandles = {
	c1: Point
	c2: Point
	endTangent: Point
}

/** 拱起侧单位法向：SVG y 向下时 up = 弦左侧法向，down = 取反 */
function bulgeNormal(ux: number, uy: number, bendArch: 'up' | 'down'): Point {
	const nx = bendArch === 'up' ? uy : -uy
	const ny = bendArch === 'up' ? -ux : ux
	const L = Math.hypot(nx, ny) || 1
	return { x: nx / L, y: ny / L }
}

export const DEFAULT_HANDLE_SCALE_X = 1
export const DEFAULT_HANDLE_SCALE_Y = 1
/** 贝塞尔离散段数默认（柄缘折线逼近） */
export const DEFAULT_SEGMENTS = 16

/** `bendStrength` ∈ `[0, BEND_STRENGTH_MAX]`：拱起与沿弦伸出量，`<=1` 与历史行为一致 */
function cubicHandlesDoubleBend(a: Point, b: Point, bendStrength: number, bendArch: 'up' | 'down', handleScaleX: number, handleScaleY: number): CubicHandles {
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

	const ux = dx / len
	const uy = dy / len

	const t = bendStrengthToInternalT(bendStrength)
	/** 强度为 0 时若仍用非 1 的弦向 X/Y 缩放，控制点不与弦共线，切向偏离弦方向，带宽条会自交或法向乱翻 */
	if (t <= EPS) {
		const third = len / 3
		return {
			c1: { x: a.x + ux * third, y: a.y + uy * third },
			c2: { x: b.x - ux * third, y: b.y - uy * third },
			endTangent: { x: ux, y: uy }
		}
	}
	const n = bulgeNormal(ux, uy, bendArch)
	const basis = 0.5 * (Math.abs(dx) + Math.abs(dy))

	const BULGE_PER_SPAN = 0.24
	const bulgeCap = len * Math.min(0.9, 0.48 + 0.044 * Math.max(0, t - 1))
	const bulge = Math.min(t * BULGE_PER_SPAN * basis, bulgeCap)

	const alongMax = Math.min(len * 0.42, 270)
	const alongLead = 0.2 + 0.8 * Math.min(t, 1)
	const alongBoost = Math.max(0, t - 1) * 0.065
	const alongRaw = alongMax * Math.min(alongLead + alongBoost, 1.75)

	// 【曲率柔顺】内部 t>1 时略拉长弦向柄、略减拱高，减轻贝塞尔中段的尖棱感
	const stiff = Math.max(0, t - 1)
	const alongSm = alongRaw * (1 + 0.072 * stiff)
	const bulgeSm = bulge * Math.max(0.73, 1 - 0.052 * stiff)

	const archBx = n.x * bulgeSm
	const archBy = n.y * bulgeSm

	const sx = handleScaleX
	const sy = handleScaleY

	const c1: Point = {
		x: a.x + (ux * alongSm + archBx) * sx,
		y: a.y + (uy * alongSm + archBy) * sy
	}
	const c2: Point = {
		x: b.x - (ux * alongSm + archBx) * sx,
		y: b.y + (-uy * alongSm + archBy) * sy
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

function verticesToPathD(vertices: Point[]): string {
	if (vertices.length < 3) return ''
	const xy = (p: Point) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`
	const parts: string[] = [`M ${xy(vertices[0]!)}`]
	for (let i = 1; i < vertices.length; i++) parts.push(`L ${xy(vertices[i]!)}`)
	parts.push('Z')
	return parts.join(' ')
}

export type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number }

function boundingBoxOfVertices(vertices: Point[]): BoundingBox {
	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity
	for (const { x, y } of vertices) {
		minX = Math.min(minX, x)
		minY = Math.min(minY, y)
		maxX = Math.max(maxX, x)
		maxY = Math.max(maxY, y)
	}
	return { minX, minY, maxX, maxY }
}

/**
 * 与 {@link buildCurvedArrowPathD} 同源的多边形顶点（闭合路径顶点序），用于裁剪边界。
 */
export function getCurvedArrowPathVertices(
	a: Point,
	b: Point,
	bendStrength = DEFAULT_BEND_STRENGTH,
	startWidth = 0,
	endWidth = 32,
	startClearance = 0,
	tipClearance = 48,
	arrowBaseExtraPx = 8,
	arrowTipScale = 1.5,
	bendArch: 'up' | 'down' = 'up',
	handleScaleX = DEFAULT_HANDLE_SCALE_X,
	handleScaleY = DEFAULT_HANDLE_SCALE_Y,
	segments = DEFAULT_SEGMENTS
): Point[] | null {
	if (Math.hypot(b.x - a.x, b.y - a.y) < EPS) return null

	const seg = Math.max(4, Math.min(256, Math.round(segments)))

	const sx = handleScaleX
	const sy = handleScaleY

	const tipGap = Math.max(0, tipClearance)
	const startGap = Math.max(0, startClearance)
	const handlesNominal = cubicHandlesDoubleBend(a, b, bendStrength, bendArch, sx, sy)
	const tFromA = normalize({ x: handlesNominal.c1.x - a.x, y: handlesNominal.c1.y - a.y })
	const tToB = handlesNominal.endTangent

	const aDraw: Point = {
		x: a.x + tFromA.x * startGap,
		y: a.y + tFromA.y * startGap
	}
	const bDraw: Point = {
		x: b.x - tToB.x * tipGap,
		y: b.y - tToB.y * tipGap
	}

	const { c1, c2, endTangent } = cubicHandlesDoubleBend(aDraw, bDraw, bendStrength, bendArch, sx, sy)

	const wStartTotal = typeof startWidth === 'number' ? Math.max(1.2, startWidth) : Math.max(1.2, endWidth * 0.05)
	const wEndTotal = Math.max(wStartTotal + 1.5, endWidth)
	const tipExt = Math.max(6, endWidth * 0.53 + 12) * Math.max(0.35, arrowTipScale)
	const flare = Math.max(0, arrowBaseExtraPx)

	const left: Point[] = []
	const right: Point[] = []
	let prevN: Point | null = null
	let nEnd: Point = { x: 0, y: 1 }

	for (let i = 0; i <= seg; i++) {
		const t = i / seg
		const { p, d } = cubicPointDerivative(aDraw, c1, c2, bDraw, t)
		let T = normalize(d)
		if (Math.hypot(T.x, T.y) < EPS) T = endTangent

		let N: Point = { x: -T.y, y: T.x }
		if (prevN && N.x * prevN.x + N.y * prevN.y < 0) {
			N = { x: -N.x, y: -N.y }
		}
		prevN = N
		if (i === seg) nEnd = N

		const half = 0.5 * (wStartTotal + (wEndTotal - wStartTotal) * smoothstep01(t))
		left.push({ x: p.x + N.x * half, y: p.y + N.y * half })
		right.push({ x: p.x - N.x * half, y: p.y - N.y * half })
	}

	const n = seg
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

	return [...left, headBaseL, tip, headBaseR, ...[...right].reverse()]
}

/**
 * 单一路径：沿三次贝塞尔变宽的箭柄 + 三角形箭头（闭合 `d`）。
 *
 * **端点坐标**
 * @param a 起点
 * @param b 终点
 * @param bendStrength 弯曲强度，数学上用于 `cubicHandlesDoubleBend`。**0～10**：`0～1` 与旧版（原先夹在 `[0,1]`）一致，`>1` 拱起更强（见文件内 `BEND_STRENGTH_MAX`）。
 * @param startWidth 箭柄起点总宽度（px）；省略时与原先行为一致，取 `max(1.2, endWidth * 0.05)`。**4～96**（「起点宽度」）。
 * @param endWidth 箭柄末端总宽度（px），影响宽度插值与尖端基础伸出长度。**4～96**（「终点宽度」）。
 * @param startClearance 起点沿 nominal 曲线在 `a` 处切向从 `a` 向内侧偏移（px），与起点节点保持距离。**0～120**（「起点留白」，语义同 `tipClearance`）。
 * @param tipClearance 终点沿切向内缩（px），使箭身、箭头与控制点保持距离。**0～120**（「终点留白」）。
 * @param arrowBaseExtraPx 箭头底边相对柄端「嘴角」沿法向外扩（单侧 px）。**0～64**（「箭头底边外扩」）。
 * @param arrowTipScale 尖端长度在基础上的倍率；实现中取 `Math.max(0.35, arrowTipScale)`。
 * @param bendArch 拱向弦线的哪一侧：'up' = 弦在屏幕坐标左侧法向朝上；'down' = 反向。
 * @param handleScaleX 控制柄在 x 上对标量 `(ux·沿弦 + 拱起 x)` 的倍率；**弯曲强度为 0** 时退化为直线三等分柄，不乘此项。
 * @param handleScaleY 控制柄在 y 上对标量 `(uy·沿弦 + 拱起 y)` 的倍率（`c2` 用 `-uy·沿弦 + 拱起 y`）；强度为 0 时同上。
 * @param segments 贝塞尔离散段数（影响柄缘折线逼近）。
 */
export function buildCurvedArrowPathD(
	a: Point,
	b: Point,
	bendStrength = DEFAULT_BEND_STRENGTH,
	startWidth = 12,
	endWidth = 12,
	startClearance = 30,
	tipClearance = 52,
	arrowBaseExtraPx = 8,
	arrowTipScale = 1.2,
	bendArch: 'up' | 'down' = 'up',
	handleScaleX = DEFAULT_HANDLE_SCALE_X,
	handleScaleY = DEFAULT_HANDLE_SCALE_Y,
	segments = DEFAULT_SEGMENTS
): string {
	const v = getCurvedArrowPathVertices(
		a,
		b,
		bendStrength,
		startWidth,
		endWidth,
		startClearance,
		tipClearance,
		arrowBaseExtraPx,
		arrowTipScale,
		bendArch,
		handleScaleX,
		handleScaleY,
		segments
	)
	return v ? verticesToPathD(v) : ''
}

export function getCurvedArrowPathBoundingBox(...args: Parameters<typeof getCurvedArrowPathVertices>): BoundingBox | null {
	const v = getCurvedArrowPathVertices(...args)
	if (!v || v.length < 3) return null
	return boundingBoxOfVertices(v)
}
