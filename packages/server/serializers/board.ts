export default function actorMoveSerializer(actor: Actor, board: TileLookup, coords: Coordinates): boolean {
  return !board[coords.x][coords.y].isOccupied;
}
