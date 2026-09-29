"use client";

import { useState } from "react";
import styles from "./statsModules.module.css";

export type NutrientRow = {
  key: string;
  label: string;
  percent: number; // 0..100
  delta: number | null; // п.п. к предыдущему периоду
};

type Props = {
  title: string;
  overallPercent: number;
  overallDelta: number | null;
  trendLabel: string; // "vs previous 7 days"
  rows: NutrientRow[]; // уже отсортированы по убыванию
  caption: string; // "Based on 5 of 7 days with entries"
  hintLabel: string; // "Needs attention:"
  hintNames: string[]; // самые слабые нутриенты
  hintTip: string | null; // "Try eggs, chicken breast, avocado…"
  allGoodLabel: string;
  showAllLabel: string;
  showLessLabel: string;
};

type Level = "high" | "mid" | "low";

const COLLAPSED_COUNT = 7;
const HEAD_COUNT = 4; // строки рядом со шкалой-индикатором
const ARC_LEN = Math.PI * 50; // длина полуокружности радиуса 50

const levelOf = (p: number): Level => (p >= 70 ? "high" : p >= 40 ? "mid" : "low");

const formatDelta = (d: number) => (d > 0 ? `+${d}` : `${d}`);

const Gauge = ({ percent }: { percent: number }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const level = levelOf(clamped);
  const arc = "M10 60 A50 50 0 0 1 110 60";

  return (
    <svg
      viewBox="0 0 120 64"
      className={styles["gauge"]}
      role="img"
      aria-label={`${clamped}%`}
    >
      <path d={arc} className={styles["gauge-track"]} />
      <path
        d={arc}
        className={`${styles["gauge-fill"]} ${styles[`level--${level}`]}`}
        style={{ strokeDasharray: `${(clamped / 100) * ARC_LEN} ${ARC_LEN}` }}
      />
      <text x="60" y="54" textAnchor="middle" className={styles["gauge-text"]}>
        {clamped}%
      </text>
    </svg>
  );
};

const Row = ({ row }: { row: NutrientRow }) => {
  const level = levelOf(row.percent);
  const width = row.percent > 0 ? Math.max(3, Math.min(100, row.percent)) : 0;

  return (
    <div className={`${styles["nutrient-row"]} ${styles[`level--${level}`]}`}>
      <div className={styles["nutrient-head"]}>
        <span className={styles["nutrient-name"]}>{row.label}</span>
        {row.delta !== null && row.delta !== 0 && (
          <span
            className={`${styles["nutrient-delta"]} ${
              row.delta > 0 ? styles["delta--up"] : styles["delta--down"]
            }`}
          >
            {row.delta > 0 ? "▲" : "▼"} {formatDelta(row.delta)}
          </span>
        )}
        <span className={styles["nutrient-percent"]}>{row.percent}%</span>
      </div>
      <div className={styles["nutrient-bar"]}>
        <div className={styles["nutrient-bar-fill"]} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const NutrientSection = ({
  title,
  overallPercent,
  overallDelta,
  trendLabel,
  rows,
  caption,
  hintLabel,
  hintNames,
  hintTip,
  allGoodLabel,
  showAllLabel,
  showLessLabel,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const canCollapse = rows.length > COLLAPSED_COUNT;
  const visible = expanded || !canCollapse ? rows : rows.slice(0, COLLAPSED_COUNT);
  const head = visible.slice(0, HEAD_COUNT);
  const tail = visible.slice(HEAD_COUNT);

  return (
    <section className={styles["card"]}>
      <h2 className={styles["card-title"]}>{title}</h2>

      <div className={styles["nutrient-top"]}>
        <div className={styles["nutrient-list"]}>
          {head.map((row) => (
            <Row key={row.key} row={row} />
          ))}
        </div>

        <div className={styles["gauge-box"]}>
          <Gauge percent={overallPercent} />
          {overallDelta !== null && (
            <div
              className={`${styles["trend"]} ${
                overallDelta > 0
                  ? styles["delta--up"]
                  : overallDelta < 0
                    ? styles["delta--down"]
                    : styles["trend--flat"]
              }`}
            >
              <span>{overallDelta > 0 ? "▲" : overallDelta < 0 ? "▼" : "•"}</span>{" "}
              {formatDelta(overallDelta)}% {trendLabel}
            </div>
          )}
        </div>
      </div>

      {tail.length > 0 && (
        <div className={styles["nutrient-list"]}>
          {tail.map((row) => (
            <Row key={row.key} row={row} />
          ))}
        </div>
      )}

      {canCollapse && (
        <button
          type="button"
          className={styles["nutrient-toggle"]}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? showLessLabel : showAllLabel}
        </button>
      )}

      <p className={styles["nutrient-hint"]}>
        {hintNames.length > 0 ? (
          <>
            <strong>{hintLabel}</strong> {hintNames.join(", ")}
            {hintTip ? `. ${hintTip}` : ""}
          </>
        ) : (
          allGoodLabel
        )}
      </p>
      <p className={styles["nutrient-caption"]}>{caption}</p>
    </section>
  );
};

export default NutrientSection;
