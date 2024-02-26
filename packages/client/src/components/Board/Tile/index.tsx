import React, { ReactNode } from "react";
import { useDrop } from "react-dnd";

import Overlay from "../../Overlay";
import { useBoard, useMouse, useSocket } from "../../../contexts";

import itemTypes from "../../../constants/DnD-ItemTypes";

import styles from "./Tile.module.scss";

type TileProps = {
  x: number;
  y: number;
  children?: ReactNode;
  id: number;
};

interface DraggedToken extends Coordinates {
  id: number;
  type: string;
  tileId: number;
}

export default function Tile({ x, y, children, id }: TileProps) {
  const { popMenu } = useMouse();
  const { attemptMove } = useSocket();
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: itemTypes.TOKEN,
      canDrop: (item: DraggedToken) => {
        const absX = Math.abs(item.x - x);
        const absY = Math.abs(item.y - y);
        const tan = Math.sqrt(absX * absX + absY * absY);
        return tan < 5;
      },
      drop: (item: DraggedToken) => {
        attemptMove?.({ ...(item as Coordinates) }, { x, y });
      }, // game.move
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    []
  );

  return (
    <div
      className={styles.tile}
      ref={dropRef}
      role="Tile"
      onContextMenu={(event) => {
        popMenu(event, {
          type: "tile",
          values: {
            x,
            y,
            id,
          },
        });
      }}
    >
      {children}
      {isOver && !canDrop && <Overlay type="illegal" />}
      {!isOver && canDrop && <Overlay type="possible" />}
      {isOver && canDrop && <Overlay type="valid" />}
    </div>
  );
}
