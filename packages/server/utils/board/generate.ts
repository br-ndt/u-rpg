export function generateArray(width: number, height: number): Coordinates[] {
  return [...Array(width * height)].map((empt, i) => ({
    x: i % width,
    y: Math.floor(i / width),
  }));
}

export function generateMap(width: number, height: number): TileLookup {
  return generateArray(width, height).reduce((obj: TileLookup, item) => {
    return {
      ...obj,
      [item.x]: {
        ...obj[item.x],
        [item.y]: {
          x: item.x,
          y: item.y,
          isOccupied: false,
        },
      },
    };
  }, {});
}
