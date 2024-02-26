export function clearOccupied(grid: TileLookup, coords: Coordinates) {
  grid[coords.x][coords.y].occupantId = undefined;
}

export function setOccupied(
  actor: Actor,
  grid: TileLookup,
  coords: Coordinates
) {
  grid[coords.x][coords.y].occupantId = actor.id;
}
