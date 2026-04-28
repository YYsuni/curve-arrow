import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { buildCurvedArrowPathD, type Point } from '../utils/curved-arrow-path'

type CurveCanvasProps = {
	p1: Point
	p2: Point
	onP1Change: (p: Point) => void
	onP2Change: (p: Point) => void
	endWidth: number
	fillColor: string
	bendStrength: number
	bendArch: 'up' | 'down'
	tipClearance: number
	arrowBaseExtraPx: number
	arrowTipScale: number
}

export function CurveCanvas({
	p1,
	p2,
	onP1Change,
	onP2Change,
	endWidth,
	fillColor,
	bendStrength,
	bendArch,
	tipClearance,
	arrowBaseExtraPx,
	arrowTipScale
}: CurveCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const svgRef = useRef<SVGSVGElement>(null)
	const [drag, setDrag] = useState<1 | 2 | null>(null)
	const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })

	const syncSvgSize = useCallback(() => {
		const el = containerRef.current
		if (!el) return
		const w = Math.round(el.clientWidth)
		const h = Math.round(el.clientHeight)
		setSvgSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }))
	}, [])

	useLayoutEffect(() => {
		syncSvgSize()
		const el = containerRef.current
		if (!el) return
		const ro = new ResizeObserver(() => syncSvgSize())
		ro.observe(el)
		return () => ro.disconnect()
	}, [syncSvgSize])

	const arrowD = useMemo(
		() => buildCurvedArrowPathD(p1, p2, bendStrength, endWidth, tipClearance, arrowBaseExtraPx, arrowTipScale, bendArch),
		[p1, p2, bendStrength, bendArch, endWidth, tipClearance, arrowBaseExtraPx, arrowTipScale]
	)

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (drag == null || !svgRef.current) return
			const next = { x: e.clientX, y: e.clientY }
			if (drag === 1) onP1Change(next)
			else onP2Change(next)
		},
		[drag, onP1Change, onP2Change]
	)

	const endDrag = useCallback(() => setDrag(null), [])

	useEffect(() => {
		if (drag == null) return
		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', endDrag)
		window.addEventListener('pointercancel', endDrag)
		return () => {
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', endDrag)
			window.removeEventListener('pointercancel', endDrag)
		}
	}, [drag, onPointerMove, endDrag])

	return (
		<div ref={containerRef} className='flex-1'>
			<svg
				ref={svgRef}
				role='img'
				aria-label='Draggable curve between two points'
				width={svgSize.w}
				height={svgSize.h}
				className='block touch-none bg-slate-100'
				viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
				preserveAspectRatio='xMidYMid meet'>
				<defs>
					<pattern id='grid' width='32' height='32' patternUnits='userSpaceOnUse'>
						<path d='M 32 0 L 0 0 0 32' fill='none' className='stroke-slate-300/70' strokeWidth='1' />
					</pattern>
				</defs>
				<rect width='100%' height='100%' fill='url(#grid)' />

				{arrowD ? <path d={arrowD} fill={fillColor} stroke='none' /> : null}

				<circle
					cx={p1.x}
					cy={p1.y}
					r={12}
					className='fill-white stroke-[2px] stroke-indigo-500'
					style={{ cursor: drag === 1 ? 'grabbing' : 'grab' }}
					onPointerDown={e => {
						e.currentTarget.setPointerCapture(e.pointerId)
						setDrag(1)
					}}
				/>
				<circle
					cx={p2.x}
					cy={p2.y}
					r={12}
					className='fill-white stroke-[2px] stroke-amber-500'
					style={{ cursor: drag === 2 ? 'grabbing' : 'grab' }}
					onPointerDown={e => {
						e.currentTarget.setPointerCapture(e.pointerId)
						setDrag(2)
					}}
				/>
			</svg>
		</div>
	)
}
