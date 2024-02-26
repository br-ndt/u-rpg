import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "../SocketContext";

export type BoardMovementContextType = {
  getTile: ({ x, y }: Coordinates) => TileData;
  tiles: TileLookup;
};

export type BoardMovementProviderProps = {
  children?: ReactNode;
  height: number;
  width: number;
};

export const BoardMovementContext = createContext<BoardMovementContextType>({
  getTile: ({ x, y }) => ({ x, y, isOccupied: false }),
  tiles: {},
});

export function BoardMovementProvider({
  children,
  height,
  width,
}: BoardMovementProviderProps) {
  const { socket } = useSocket();
  const [map, setMap] = useState<TileLookup>({});
  const getTile = useCallback(({ x, y }: Coordinates) => map[x][y], [map]);
  // const remove = useCallback(
  //   ({ x, y }: Coordinates) => {
  //     const index = array.indexOf({ x, y });
  //     if (index === -1) throw new Error("key does not exist)");
  //     setArray(array.splice(index, 1));
  //     let state = map;
  //     delete state[x][y];
  //     setMap(state);
  //   },
  //   [array, map]

  useEffect(() => {
    socket?.on("board update", (tiles: TileLookup) => setMap(tiles));
    socket?.emit("load board");

    return () => {
      socket?.off("board update");
    }
  }, []);

  return (
    <BoardMovementContext.Provider
      value={{ getTile, tiles: map }}
    >
      {children}
    </BoardMovementContext.Provider>
  );
}

export function useBoard() {
  if (!BoardMovementContext) {
    throw new Error("BoardMovementContext must be defined!");
  }
  return useContext<BoardMovementContextType>(BoardMovementContext);
}
