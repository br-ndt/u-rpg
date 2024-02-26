import React from "react";

import Tile from "../Tile";
import { Token } from "../..";
import { useBoard } from "../../../contexts";

import styles from "./TilesMap.module.scss";

type TilesMapProps = {};

export default function TilesMap({}: TilesMapProps) {
  const { tiles } = useBoard();
  let tileId = -1;
  return (
    <>
      {Object.keys(tiles).map((row) => {
        const y = parseInt(row);
        return (
          <div className={styles.tileRow}>
            {Object.keys(tiles[y]).map((column) => {
              ++tileId;
              const x = parseInt(column);
              return (
                <Tile x={x} y={y} id={tileId}>
                  {tiles[x][y]?.occupantId && (
                    <Token
                      id={tiles[x][y]?.occupantId!}
                      tileId={tileId}
                      x={x}
                      y={y}
                    />
                  )}
                </Tile>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
