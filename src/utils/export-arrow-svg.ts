import {
	buildCurvedArrowPathD,
	getCurvedArrowPathBoundingBox,
	type BoundingBox,
	type Point
} from 'curve-arrow'

export type ExportArrowSvgParams = {
	p1: Point
	p2: Point
	bendStrength: number
	startWidth: number
	endWidth: number
	startClearance: number
	tipClearance: number
	arrowBaseExtraPx: number
	arrowTipScale: number
	bendArch: 'up' | 'down'
	handleScaleX: number
	handleScaleY: number
	segments: number
	fillColor: string
	fillGradient: boolean
	fillColorStart: string
	fillColorEnd: string
	/** 裁剪区域外扩（与 path 同源用户单位） */
	padding?: number
}

function padBox(box: BoundingBox, pad: number): { minX: number; minY: number; w: number; h: number } {
	return {
		minX: box.minX - pad,
		minY: box.minY - pad,
		w: box.maxX - box.minX + 2 * pad,
		h: box.maxY - box.minY + 2 * pad
	}
}

function escapeXmlAttr(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/**
 * 按箭头 path 的轴对齐边界（可含外扩）裁剪，生成独立 SVG 文档字符串。
 */
export function buildCroppedArrowSvgString(p: ExportArrowSvgParams): string | null {
	const {
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
		fillColorEnd,
		padding = 2
	} = p

	const args = [
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
	] as Parameters<typeof buildCurvedArrowPathD>

	const d = buildCurvedArrowPathD(...args)
	if (!d) return null

	const box = getCurvedArrowPathBoundingBox(...args)
	if (!box) return null

	const { minX, minY, w, h } = padBox(box, padding)
	const viewBox = `${minX} ${minY} ${w} ${h}`

	const defs = fillGradient
		? `<defs><linearGradient id="arrow-fill-gradient" gradientUnits="userSpaceOnUse" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"><stop offset="0%" stop-color="${escapeXmlAttr(fillColorStart)}"/><stop offset="100%" stop-color="${escapeXmlAttr(fillColorEnd)}"/></linearGradient></defs>`
		: ''

	const fillAttr = fillGradient ? 'url(#arrow-fill-gradient)' : escapeXmlAttr(fillColor)

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">${defs}<path d="${escapeXmlAttr(d)}" fill="${fillAttr}" stroke="none"/></svg>`
}

export function downloadSvgFile(svg: string, filename = 'arrow.svg') {
	const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}
