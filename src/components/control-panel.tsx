import { type CSSProperties, type ReactNode, useId } from 'react'
import { BEND_STRENGTH_MAX } from 'curve-arrow'

const BEND_ARCH_ITEMS = [
	{ value: 'up' as const, label: '向上' },
	{ value: 'down' as const, label: '向下' }
]

const BEND_RADIO_ITEM_CLASS =
	'flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 bg-transparent px-2.5 py-1.5 text-[13px] font-medium text-slate-600 transition-colors has-[:checked]:border-teal-400/50 has-[:checked]:bg-teal-500/[0.12] has-[:checked]:text-slate-800'

function ColorSwatch({ value, onChange, minFullWidth }: { value: string; onChange: (v: string) => void; minFullWidth?: boolean }) {
	return (
		<label className='control-panel-color-chip block overflow-hidden rounded-lg ring-1 ring-slate-200/70'>
			<input
				type='color'
				value={value}
				onChange={e => onChange(e.target.value)}
				className={`control-panel-color-input block h-[1.875rem] w-full cursor-pointer${minFullWidth ? 'min-w-full' : ''}`}
			/>
		</label>
	)
}

type ControlPanelProps = {
	startWidth: number
	onStartWidthChange: (v: number) => void
	endWidth: number
	onEndWidthChange: (v: number) => void
	bendStrength: number
	onBendStrengthChange: (v: number) => void
	bendArch: 'up' | 'down'
	onBendArchChange: (v: 'up' | 'down') => void
	fillColor: string
	onFillColorChange: (v: string) => void
	fillGradient: boolean
	onFillGradientChange: (v: boolean) => void
	fillColorStart: string
	onFillColorStartChange: (v: string) => void
	fillColorEnd: string
	onFillColorEndChange: (v: string) => void
	startClearance: number
	onStartClearanceChange: (v: number) => void
	tipClearance: number
	onTipClearanceChange: (v: number) => void
	arrowBaseExtraPx: number
	onArrowBaseExtraPxChange: (v: number) => void
	arrowTipScale: number
	onArrowTipScaleChange: (v: number) => void
	handleScaleX: number
	onHandleScaleXChange: (v: number) => void
	handleScaleY: number
	onHandleScaleYChange: (v: number) => void
	segments: number
	onSegmentsChange: (v: number) => void
	onExportSvg: () => void
}

type SliderRowProps = {
	label: string
	min: number
	max: number
	step?: number
	value: number
	onChange: (v: number) => void
}

function SliderRow({ label, min, max, step, value, onChange }: SliderRowProps) {
	const rangeId = useId()
	const fillPct = max === min ? 0 : ((value - min) / (max - min)) * 100

	return (
		<div className='group flex min-h-7 items-center gap-2 text-[13px] text-slate-600'>
			<label htmlFor={rangeId} className='w-[4.5rem] shrink-0 cursor-pointer leading-snug font-medium text-slate-500'>
				{label}
			</label>
			<input
				id={rangeId}
				type='range'
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => onChange(Number(e.target.value))}
				style={{ '--slider-fill': `${fillPct}%` } as CSSProperties}
				className='control-panel-range min-w-0 flex-1'
			/>
			<input
				type='number'
				step={step}
				value={value}
				aria-label={`${label} 数值`}
				onChange={e => {
					const raw = e.target.value
					if (raw.trim() === '') return
					const n = Number(raw)
					if (!Number.isFinite(n)) return
					onChange(n)
				}}
				className='control-panel-number-input w-[3.25rem] shrink-0 text-right tabular-nums'
			/>
		</div>
	)
}

function PanelSection({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
	return (
		<section className={`flex flex-col gap-2 border-t border-slate-200/70 pt-3 first:border-0 first:pt-0 ${className}`}>
			<h2 className='m-0 text-[11px] font-semibold tracking-wider text-teal-600/90 uppercase'>{title}</h2>
			{children}
		</section>
	)
}

export function ControlPanel({
	startWidth,
	onStartWidthChange,
	endWidth,
	onEndWidthChange,
	bendStrength,
	onBendStrengthChange,
	bendArch,
	onBendArchChange,
	fillColor,
	onFillColorChange,
	fillGradient,
	onFillGradientChange,
	fillColorStart,
	onFillColorStartChange,
	fillColorEnd,
	onFillColorEndChange,
	startClearance,
	onStartClearanceChange,
	tipClearance,
	onTipClearanceChange,
	arrowBaseExtraPx,
	onArrowBaseExtraPxChange,
	arrowTipScale,
	onArrowTipScaleChange,
	handleScaleX,
	onHandleScaleXChange,
	handleScaleY,
	onHandleScaleYChange,
	segments,
	onSegmentsChange,
	onExportSvg
}: ControlPanelProps) {
	return (
		<aside className='flex h-screen w-[296px] shrink-0 flex-col gap-4 overflow-auto border-l border-teal-200/25 bg-linear-to-br from-white via-slate-50/90 to-teal-50/35 px-5 py-4 shadow-[inset_1px_0_0_rgb(255_255_255/0.9)]'>
			<header className='flex flex-col gap-0.5'>
				<h1 className='m-0 bg-linear-to-br from-slate-800 via-slate-700 to-teal-800 bg-clip-text text-[15px] font-semibold tracking-tight text-transparent'>
					弧线箭头
				</h1>
				<p className='m-0 text-[12px] leading-relaxed text-slate-400'>拖动参数预览曲线，导出裁剪后的 SVG</p>
			</header>

			<div className='flex flex-col gap-0'>
				<PanelSection title='弧度'>
					<div className='flex flex-col gap-2'>
						<SliderRow label='弯曲' min={0} max={BEND_STRENGTH_MAX} step={0.05} value={bendStrength} onChange={onBendStrengthChange} />
						<div className='flex items-center gap-2 text-[13px] text-slate-600'>
							<span className='w-18 shrink-0 leading-snug font-medium text-slate-500'>朝向</span>
							<div className='flex min-w-0 flex-1 items-center gap-2'>
								{BEND_ARCH_ITEMS.map(({ value, label }) => (
									<label key={value} className={BEND_RADIO_ITEM_CLASS}>
										<input type='radio' name='bendArch' checked={bendArch === value} onChange={() => onBendArchChange(value)} className='sr-only' />
										<span>{label}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				</PanelSection>

				<PanelSection title='手柄与采样' className='mt-3'>
					<div className='flex flex-col gap-2'>
						<SliderRow label='X轴缩放' min={0.2} max={1.5} step={0.05} value={handleScaleX} onChange={onHandleScaleXChange} />
						<SliderRow label='Y轴缩放' min={0.2} max={1.5} step={0.05} value={handleScaleY} onChange={onHandleScaleYChange} />
						<SliderRow label='细分' min={1} max={160} step={1} value={segments} onChange={onSegmentsChange} />
					</div>
				</PanelSection>

				<PanelSection title='宽度与留白'>
					<div className='flex flex-col gap-2'>
						<SliderRow label='起点宽度' min={4} max={96} step={1} value={startWidth} onChange={onStartWidthChange} />
						<SliderRow label='终点宽度' min={4} max={96} step={1} value={endWidth} onChange={onEndWidthChange} />
						<SliderRow label='起点偏移' min={0} max={120} step={1} value={startClearance} onChange={onStartClearanceChange} />
						<SliderRow label='终点偏移' min={0} max={120} step={1} value={tipClearance} onChange={onTipClearanceChange} />
					</div>
				</PanelSection>

				<PanelSection title='箭头'>
					<div className='flex flex-col gap-2'>
						<SliderRow label='箭头宽度' min={0} max={64} step={1} value={arrowBaseExtraPx} onChange={onArrowBaseExtraPxChange} />
						<SliderRow label='箭头长度' min={1} max={2.5} step={0.05} value={arrowTipScale} onChange={onArrowTipScaleChange} />
					</div>
				</PanelSection>

				<PanelSection title='颜色'>
					<div className='flex min-w-0 flex-col gap-2.5'>
						<label className='flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/80 px-2 py-1.5 text-[13px] font-medium text-slate-600 transition-colors has-[:checked]:border-teal-400/45 has-[:checked]:bg-teal-500/[0.1]'>
							<input
								type='checkbox'
								checked={fillGradient}
								onChange={e => onFillGradientChange(e.target.checked)}
								className='control-panel-checkbox-input accent-brand size-[0.9375rem] shrink-0 cursor-pointer'
							/>
							<span>渐变填充</span>
						</label>
						{fillGradient ? (
							<div className='flex flex-col gap-2'>
								<div className='flex flex-col gap-1'>
									<span className='text-[11px] font-medium tracking-wide text-slate-400 uppercase'>起点色</span>
									<ColorSwatch value={fillColorStart} onChange={onFillColorStartChange} minFullWidth />
								</div>
								<div className='flex flex-col gap-1'>
									<span className='text-[11px] font-medium tracking-wide text-slate-400 uppercase'>终点色</span>
									<ColorSwatch value={fillColorEnd} onChange={onFillColorEndChange} minFullWidth />
								</div>
							</div>
						) : (
							<ColorSwatch value={fillColor} onChange={onFillColorChange} />
						)}
					</div>
				</PanelSection>

				<div className='border-t border-slate-200/70 pt-3'>
					<button
						type='button'
						onClick={onExportSvg}
						className='via-brand w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-teal-500/20 transition hover:brightness-[1.03] active:brightness-95'>
						导出 SVG（裁剪至箭头边界）
					</button>
				</div>
			</div>
		</aside>
	)
}
