import { FONT_FAMILY, FONT_SIZE, LABEL_PAD } from './gantt-layout'

export type LabelPlacement = 'inside' | 'outsideLeft' | 'outsideRight'

export type LabelLayout = {
  placement: LabelPlacement
  x: number
  y: number
  fill: string
  textAnchor: 'middle' | 'start' | 'end'
}

let measureCanvas: CanvasRenderingContext2D | null = null

function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    const canvas = document.createElement('canvas')
    measureCanvas = canvas.getContext('2d')
  }
  if (!measureCanvas) {
    throw new Error('Could not create canvas context for text measurement')
  }
  measureCanvas.font = `500 ${FONT_SIZE}px ${FONT_FAMILY}`
  return measureCanvas
}

export function measureTextWidth(text: string): number {
  return getMeasureContext().measureText(text).width
}

export function computeLabelLayout(
  text: string,
  barX: number,
  barY: number,
  barWidth: number,
  barHeight: number,
  chartRight: number,
): LabelLayout {
  const textWidth = measureTextWidth(text)
  const centerY = barY + barHeight / 2
  const insideFits = textWidth + LABEL_PAD * 2 <= barWidth

  if (insideFits) {
    return {
      placement: 'inside',
      x: barX + barWidth / 2,
      y: centerY,
      fill: '#ffffff',
      textAnchor: 'middle',
    }
  }

  const rightSpace = chartRight - (barX + barWidth) - LABEL_PAD
  if (rightSpace >= textWidth) {
    return {
      placement: 'outsideRight',
      x: barX + barWidth + LABEL_PAD,
      y: centerY,
      fill: '#64748b',
      textAnchor: 'start',
    }
  }

  return {
    placement: 'outsideLeft',
    x: barX - LABEL_PAD,
    y: centerY,
    fill: '#64748b',
    textAnchor: 'end',
  }
}
