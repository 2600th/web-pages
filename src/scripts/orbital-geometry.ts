export type Bounds = { x: number; y: number; width: number; height: number };

export type OrbitalGeometry = {
  center: { x: number; y: number };
  orbit: { radiusX: number; radiusY: number; left: number; right: number };
  ground: { x: number; y: number; radius: number };
};

export function getOrbitalGeometry(canvas: Pick<Bounds, 'width' | 'height'>, portrait: Bounds, mobile: boolean): OrbitalGeometry {
  const center = {
    x: portrait.x + portrait.width / 2,
    y: portrait.y + portrait.height * 0.53,
  };
  const horizontalRoom = Math.max(0, Math.min(center.x - 12, canvas.width - center.x - 12));
  const radiusX = mobile
    ? Math.min(portrait.width * 0.43, horizontalRoom)
    : Math.min(portrait.width * 0.66, horizontalRoom);
  const radiusY = portrait.height * (mobile ? 0.4 : 0.35);
  const groundY = Math.min(portrait.y + portrait.height - 10, canvas.height - 26);

  return {
    center,
    orbit: { radiusX, radiusY, left: center.x - radiusX, right: center.x + radiusX },
    ground: { x: center.x, y: groundY, radius: mobile ? radiusX : portrait.width * 0.78 },
  };
}
