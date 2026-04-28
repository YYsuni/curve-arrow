import { useCallback, useState } from 'react'
import { CurveCanvas } from './components/curve-canvas'
import { ControlPanel } from './components/control-panel'
import type { Point } from './utils/curved-arrow-path'

export default function App() {
	const [p1, setP1] = useState<Point>({ x: 0.45 * window.innerWidth - 280, y: 0.55 * window.innerHeight })
	const [p2, setP2] = useState<Point>({ x: 0.7 * window.innerWidth - 280, y: 0.45 * window.innerHeight })

	const [endWidth, setEndWidth] = useState(32)
	const [bendStrengthPercent, setBendStrengthPercent] = useState(80)
	const [bendArch, setBendArch] = useState<'up' | 'down'>('up')
	const [tipClearance, setTipClearance] = useState(55)
	const [arrowBaseExtraPx, setArrowBaseExtraPx] = useState(18)
	const [arrowTipScalePercent, setArrowTipScalePercent] = useState(150)
	const [fillColor, setFillColor] = useState('#0d9488')

	const onP1Change = useCallback((p: Point) => setP1(p), [])
	const onP2Change = useCallback((p: Point) => setP2(p), [])

	return (
		<div className='flex min-h-dvh w-full  bg-slate-50 text-slate-800'>
			<CurveCanvas
				p1={p1}
				p2={p2}
				onP1Change={onP1Change}
				onP2Change={onP2Change}
				endWidth={endWidth}
				fillColor={fillColor}
				bendStrength={bendStrengthPercent / 100}
				bendArch={bendArch}
				tipClearance={tipClearance}
				arrowBaseExtraPx={arrowBaseExtraPx}
				arrowTipScale={arrowTipScalePercent / 100}
			/>
			<ControlPanel
				endWidth={endWidth}
				onEndWidthChange={setEndWidth}
				bendStrengthPercent={bendStrengthPercent}
				onBendStrengthPercentChange={setBendStrengthPercent}
				bendArch={bendArch}
				onBendArchChange={setBendArch}
				fillColor={fillColor}
				onFillColorChange={setFillColor}
				tipClearance={tipClearance}
				onTipClearanceChange={setTipClearance}
				arrowBaseExtraPx={arrowBaseExtraPx}
				onArrowBaseExtraPxChange={setArrowBaseExtraPx}
				arrowTipScalePercent={arrowTipScalePercent}
				onArrowTipScalePercentChange={setArrowTipScalePercent}
			/>
		</div>
	)
}
