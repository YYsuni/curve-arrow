type ControlPanelProps = {
	endWidth: number
	onEndWidthChange: (v: number) => void
	/** 0～100，展示为百分比，内部换算为弯曲强度 */
	bendStrengthPercent: number
	onBendStrengthPercentChange: (v: number) => void
	bendArch: 'up' | 'down'
	onBendArchChange: (v: 'up' | 'down') => void
	fillColor: string
	onFillColorChange: (v: string) => void
	tipClearance: number
	onTipClearanceChange: (v: number) => void
	arrowBaseExtraPx: number
	onArrowBaseExtraPxChange: (v: number) => void
	/** 100～250 表示尖端长度为基础值的 1.0～2.5 倍 */
	arrowTipScalePercent: number
	onArrowTipScalePercentChange: (v: number) => void
}

export function ControlPanel({
	endWidth,
	onEndWidthChange,
	bendStrengthPercent,
	onBendStrengthPercentChange,
	bendArch,
	onBendArchChange,
	fillColor,
	onFillColorChange,
	tipClearance,
	onTipClearanceChange,
	arrowBaseExtraPx,
	onArrowBaseExtraPxChange,
	arrowTipScalePercent,
	onArrowTipScalePercentChange
}: ControlPanelProps) {
	return (
		<aside className='flex w-[280px] shrink-0 flex-col gap-4 border-l border-slate-200 bg-white px-5 py-5 shadow-sm'>
			<h1 className='m-0 text-base font-semibold text-slate-900'>Curve demo</h1>
			<p className='m-0 text-sm leading-snug text-slate-600'>单一路径一体填充；箭头额外大小由「底边外扩」「尖端倍率」控制。「终点留白」避开控制点。</p>

			<label className='flex flex-col gap-1.5 text-sm text-slate-700'>
				<span className='font-medium text-slate-800'>弯曲比例</span>
				<input
					type='range'
					min={0}
					max={100}
					step={1}
					value={bendStrengthPercent}
					onChange={e => onBendStrengthPercentChange(Number(e.target.value))}
					className='w-full accent-teal-600'
				/>
				<span className='text-xs text-slate-500'>{bendStrengthPercent}%（相对 |Δx|、|Δy|）</span>
			</label>

			<fieldset className='flex flex-col gap-2 rounded-md border border-slate-200 p-3'>
				<legend className='px-1 text-sm font-medium text-slate-800'>拱起方向</legend>
				<div className='flex gap-3 text-sm'>
					<label className='flex cursor-pointer items-center gap-2 text-slate-700'>
						<input type='radio' name='bendArch' checked={bendArch === 'up'} onChange={() => onBendArchChange('up')} className='accent-teal-600' />
						<span>向上拱</span>
					</label>
					<label className='flex cursor-pointer items-center gap-2 text-slate-700'>
						<input type='radio' name='bendArch' checked={bendArch === 'down'} onChange={() => onBendArchChange('down')} className='accent-teal-600' />
						<span>向下拱</span>
					</label>
				</div>
			</fieldset>

			<label className='flex flex-col gap-1.5 text-sm text-slate-700'>
				<span className='font-medium text-slate-800'>终点宽度</span>
				<input
					type='range'
					min={4}
					max={96}
					step={1}
					value={endWidth}
					onChange={e => onEndWidthChange(Number(e.target.value))}
					className='w-full accent-teal-600'
				/>
				<span className='text-xs text-slate-500'>{endWidth}px（宽端总宽度，箭头长度随其增大）</span>
			</label>

			<label className='flex flex-col gap-1.5 text-sm text-slate-700'>
				<span className='font-medium text-slate-800'>终点留白</span>
				<input
					type='range'
					min={0}
					max={120}
					step={1}
					value={tipClearance}
					onChange={e => onTipClearanceChange(Number(e.target.value))}
					className='w-full accent-teal-600'
				/>
				<span className='text-xs text-slate-500'>{tipClearance}px（箭头与终点控制点间距）</span>
			</label>

			<label className='flex flex-col gap-1.5 text-sm text-slate-700'>
				<span className='font-medium text-slate-800'>箭头底边外扩</span>
				<input
					type='range'
					min={0}
					max={64}
					step={1}
					value={arrowBaseExtraPx}
					onChange={e => onArrowBaseExtraPxChange(Number(e.target.value))}
					className='w-full accent-teal-600'
				/>
				<span className='text-xs text-slate-500'>{arrowBaseExtraPx}px（相对柄端嘴角，每侧沿法向加宽）</span>
			</label>

			<label className='flex flex-col gap-1.5 text-sm text-slate-700'>
				<span className='font-medium text-slate-800'>箭头尖端倍率</span>
				<input
					type='range'
					min={100}
					max={250}
					step={5}
					value={arrowTipScalePercent}
					onChange={e => onArrowTipScalePercentChange(Number(e.target.value))}
					className='w-full accent-teal-600'
				/>
				<span className='text-xs text-slate-500'>×{(arrowTipScalePercent / 100).toFixed(2)}（在基础伸出长度上乘算）</span>
			</label>

			<label className='flex flex-col gap-1.5 text-sm text-slate-700'>
				<span className='font-medium text-slate-800'>填充色</span>
				<input type='color' value={fillColor} onChange={e => onFillColorChange(e.target.value)} className='h-9 w-full cursor-pointer border-0 p-0' />
			</label>
		</aside>
	)
}
