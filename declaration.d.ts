// filetypes
declare module "*.scss";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";

// data
interface hasKeyMap<T> {
  map: {
    [key: number]: T;
  };
}

declare type OrderedMap<T> = hasKeyMap<T> & {
  set: (key: number, value: T) => void;
  get: (key: number) => T;
  remove: (key: number) => void;
  forEach: (fn: (item: T, key: number) => void) => void;
};

// board 
declare type Coordinates = {
  x: number;
  y: number;
};

declare type OccupantType = "actor" | "object" | "terrain";

declare type TileData = Coordinates & { isOccupied: boolean; occupantId?: number; occupantType?: OccupantType };

declare type TileLookup = { [xKey: number]: { [yKey: number]: TileData } };

// entity
declare type Actor = {
  id: number;
  name: string;
  size: Size;
};

declare type Size = "Small" | "Medium" | "Large";

declare type SizeValues = {
  x: number;
  y: number;
};


