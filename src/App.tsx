import { useCallback, useState } from 'react'
import { CurveCanvas } from './components/curve-canvas'
import { ControlPanel } from './components/control-panel'
import { DEFAULT_BEND_STRENGTH, DEFAULT_HANDLE_SCALE_X, DEFAULT_HANDLE_SCALE_Y, DEFAULT_SEGMENTS, type Point } from './utils/curved-arrow-path'
import { buildCroppedArrowSvgString, downloadSvgFile } from './utils/export-arrow-svg'

export default function App() {
	const [p1, setP1] = useState<Point>({ x: 0.45 * window.innerWidth - 280, y: 0.55 * window.innerHeight })
	const [p2, setP2] = useState<Point>({ x: 0.6 * window.innerWidth - 280, y: 0.45 * window.innerHeight })

	const [startWidth, setStartWidth] = useState(0)
	const [endWidth, setEndWidth] = useState(32)
	const [bendStrength, setBendStrength] = useState(DEFAULT_BEND_STRENGTH)
	const [bendArch, setBendArch] = useState<'up' | 'down'>('up')
	const [startClearance, setStartClearance] = useState(0)
	const [tipClearance, setTipClearance] = useState(48)
	const [arrowBaseExtraPx, setArrowBaseExtraPx] = useState(18)
	const [arrowTipScale, setArrowTipScale] = useState(1.5)
	const [handleScaleX, setHandleScaleX] = useState(DEFAULT_HANDLE_SCALE_X)
	const [handleScaleY, setHandleScaleY] = useState(DEFAULT_HANDLE_SCALE_Y)
	const [segments, setSegments] = useState(DEFAULT_SEGMENTS)
	const [fillColor, setFillColor] = useState('#50beb7')
	const [fillGradient, setFillGradient] = useState(false)
	const [fillColorStart, setFillColorStart] = useState('#6366f1')
	const [fillColorEnd, setFillColorEnd] = useState('#ab0af5')

	const onP1Change = useCallback((p: Point) => setP1(p), [])
	const onP2Change = useCallback((p: Point) => setP2(p), [])

	const onExportSvg = useCallback(() => {
		const svg = buildCroppedArrowSvgString({
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
			segments,
			fillColor,
			fillGradient,
			fillColorStart,
			fillColorEnd
		})
		if (svg) downloadSvgFile(svg, 'curve-arrow.svg')
	}, [
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
		segments,
		fillColor,
		fillGradient,
		fillColorStart,
		fillColorEnd
	])

	return (
		<div className='flex min-h-dvh w-full bg-slate-50 text-slate-800'>
			<CurveCanvas
				p1={p1}
				p2={p2}
				onP1Change={onP1Change}
				onP2Change={onP2Change}
				startWidth={startWidth}
				endWidth={endWidth}
				fillColor={fillColor}
				fillGradient={fillGradient}
				fillColorStart={fillColorStart}
				fillColorEnd={fillColorEnd}
				bendStrength={bendStrength}
				bendArch={bendArch}
				startClearance={startClearance}
				tipClearance={tipClearance}
				arrowBaseExtraPx={arrowBaseExtraPx}
				arrowTipScale={arrowTipScale}
				handleScaleX={handleScaleX}
				handleScaleY={handleScaleY}
				segments={segments}
			/>
			<ControlPanel
				startWidth={startWidth}
				onStartWidthChange={setStartWidth}
				endWidth={endWidth}
				onEndWidthChange={setEndWidth}
				bendStrength={bendStrength}
				onBendStrengthChange={setBendStrength}
				bendArch={bendArch}
				onBendArchChange={setBendArch}
				fillColor={fillColor}
				onFillColorChange={setFillColor}
				fillGradient={fillGradient}
				onFillGradientChange={setFillGradient}
				fillColorStart={fillColorStart}
				onFillColorStartChange={setFillColorStart}
				fillColorEnd={fillColorEnd}
				onFillColorEndChange={setFillColorEnd}
				startClearance={startClearance}
				onStartClearanceChange={setStartClearance}
				tipClearance={tipClearance}
				onTipClearanceChange={setTipClearance}
				arrowBaseExtraPx={arrowBaseExtraPx}
				onArrowBaseExtraPxChange={setArrowBaseExtraPx}
				arrowTipScale={arrowTipScale}
				onArrowTipScaleChange={setArrowTipScale}
				handleScaleX={handleScaleX}
				onHandleScaleXChange={setHandleScaleX}
				handleScaleY={handleScaleY}
				onHandleScaleYChange={setHandleScaleY}
				segments={segments}
				onSegmentsChange={setSegments}
				onExportSvg={onExportSvg}
			/>
		</div>
	)
}
