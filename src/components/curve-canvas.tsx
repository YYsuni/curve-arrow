import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { buildCurvedArrowPathD, type Point } from 'curve-arrow'

type CurveCanvasProps = {
	p1: Point
	p2: Point
	onP1Change: (p: Point) => void
	onP2Change: (p: Point) => void
	startWidth: number
	endWidth: number
	/** 非渐变时的实心填充 */
	fillColor: string
	fillGradient: boolean
	/** 渐变起点色（沿 p1） */
	fillColorStart: string
	/** 渐变终点色（沿 p2） */
	fillColorEnd: string
	bendStrength: number
	bendArch: 'up' | 'down'
	startClearance: number
	tipClearance: number
	arrowBaseExtraPx: number
	arrowTipScale: number
	handleScaleX: number
	handleScaleY: number
	segments: number
}

export function CurveCanvas({
	p1,
	p2,
	onP1Change,
	onP2Change,
	startWidth,
	endWidth,
	fillColor,
	fillGradient,
	fillColorStart,
	fillColorEnd,
	bendStrength,
	bendArch,
	startClearance,
	tipClearance,
	arrowBaseExtraPx,
	arrowTipScale,
	handleScaleX,
	handleScaleY,
	segments
}: CurveCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [drag, setDrag] = useState<1 | 2 | 'path' | null>(null)
	const pathDragRef = useRef<{ cx: number; cy: number; p1: Point; p2: Point } | null>(null)
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
		window.addEventListener('resize', syncSvgSize)
		const el = containerRef.current
		if (!el) {
			return () => window.removeEventListener('resize', syncSvgSize)
		}
		const ro = new ResizeObserver(() => syncSvgSize())
		ro.observe(el)
		return () => {
			window.removeEventListener('resize', syncSvgSize)
			ro.disconnect()
		}
	}, [syncSvgSize])

	const arrowD = useMemo(
		() =>
			buildCurvedArrowPathD(
				p1,
				p2,
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
			),
		[p1, p2, bendStrength, bendArch, startWidth, endWidth, startClearance, tipClearance, arrowBaseExtraPx, arrowTipScale, handleScaleX, handleScaleY, segments]
	)

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (drag == null) return
			if (drag === 'path') {
				const snap = pathDragRef.current
				if (!snap) return
				const dx = e.clientX - snap.cx
				const dy = e.clientY - snap.cy
				onP1Change({ x: snap.p1.x + dx, y: snap.p1.y + dy })
				onP2Change({ x: snap.p2.x + dx, y: snap.p2.y + dy })
				return
			}
			const next = { x: e.clientX, y: e.clientY }
			if (drag === 1) onP1Change(next)
			else onP2Change(next)
		},
		[drag, onP1Change, onP2Change]
	)

	const endDrag = useCallback(() => {
		pathDragRef.current = null
		setDrag(null)
	}, [])

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
		<div ref={containerRef} className='relative flex-1 overflow-hidden'>
			<svg
				role='img'
				aria-label='Draggable curve between two points'
				width={svgSize.w}
				height={svgSize.h}
				className='absolute inset-0 block touch-none bg-slate-100'
				viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
				preserveAspectRatio='xMidYMid meet'>
				<defs>
					<pattern id='grid' width='32' height='32' patternUnits='userSpaceOnUse'>
						<path d='M 32 0 L 0 0 0 32' fill='none' className='stroke-slate-300/70' strokeWidth='1' />
					</pattern>
					{fillGradient ? (
						<linearGradient id='arrow-fill-gradient' gradientUnits='userSpaceOnUse' x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}>
							<stop offset='0%' stopColor={fillColorStart} />
							<stop offset='100%' stopColor={fillColorEnd} />
						</linearGradient>
					) : null}
				</defs>
				<rect width='100%' height='100%' fill='url(#grid)' />

				{arrowD ? (
					<>
						<path
							d={arrowD}
							fill='transparent'
							stroke='transparent'
							strokeWidth={16}
							strokeLinejoin='round'
							strokeLinecap='round'
							className='pointer-events-auto'
							style={{ cursor: drag === 'path' ? 'grabbing' : 'grab' }}
							onPointerDown={e => {
								e.currentTarget.setPointerCapture(e.pointerId)
								pathDragRef.current = { cx: e.clientX, cy: e.clientY, p1: { ...p1 }, p2: { ...p2 } }
								setDrag('path')
							}}
						/>
						<path d={arrowD} fill={fillGradient ? 'url(#arrow-fill-gradient)' : fillColor} stroke='none' pointerEvents='none' />
					</>
				) : null}

				<circle
					cx={p1.x}
					cy={p1.y}
					r={12}
					className='fill-white stroke-[2px]'
					stroke={fillGradient ? fillColorStart : fillColor}
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
					className='fill-white stroke-[2px]'
					stroke={fillGradient ? fillColorEnd : fillColor}
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
