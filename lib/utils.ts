import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {Camera, Color, Layer, Point, Side, XYWH} from "@/types/canvas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const colors = [
  "#007BFF",
  "#6C757D",
  "#28A745",
  "#DC3545",
  "#FFC107",
  "#17A2B8",
  "#343A40",
];


export const connectionIdToColor = (connectionId: number): string => {
  return colors[connectionId % colors.length]
}

export const pointerEventToCanvasPoint = (e: PointerEvent, camera: Camera) => {
  return {
    x: Math.round(e.clientX - camera.x),
    y: Math.round(e.clientY - camera.y),
  }
}

export const colorToCss = (color: Color) => {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`
}

export const resizeBounds = (
    bounds: XYWH,
    corner: Side,
    point: Point
): XYWH => {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  }

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width)
    result.width = Math.abs(bounds.x + bounds.width - point.x)
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x)
    result.width = Math.abs(point.x - bounds.x)
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height)
    result.height = Math.abs(bounds.y + bounds.height - point.y)
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y)
    result.height = Math.abs(point.y - bounds.y)
  }

  return result
}


export function findInterceptingLayersWithRectangle(
    layersIds: readonly string[],
    layers: ReadonlyMap<string, Layer>,
    a: Point,
    b: Point
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y)
  }

  const ids = []

  for (const layerId of layersIds) {
    const layer = layers.get(layerId)

    if (layer == null) {
      continue
    }

    const {x, y, height, width} = layer

    if (
        rect.x + rect.width > x &&
        rect.x < x + width &&
        rect.y + rect.height > y &&
        rect.y < y + height
    ) {
      ids.push(layerId)
    }
  }

  return ids
}


export function getContrastingTextColor(color: Color) {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance > 182 ? "black" : "white";
}