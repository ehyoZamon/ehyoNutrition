"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayStat } from "@/lib/statistics";
import styles from "./statsModules.module.css";

type Props = {
  title: string;
  seriesName: string;
  unit: string;
  locale: string;
  data: DayStat[];
  goalMl: number | null;
  goalLabel: string;
  tickInterval: number;
};

const REACHED = "#5aa6dc";
const NOT_REACHED = "#bfdcf1";

const WaterChart = ({
  title,
  seriesName,
  unit,
  locale,
  data,
  goalMl,
  goalLabel,
  tickInterval,
}: Props) => (
  <section className={styles["card"]}>
    <h2 className={styles["card-title"]}>{title}</h2>

    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eee" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          tick={{ fontSize: 11, fill: "#999" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fontSize: 11, fill: "#999" }}
          tickFormatter={(v: number) => v.toLocaleString(locale)}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          labelFormatter={(_label, payload) =>
            payload && payload[0] ? String((payload[0].payload as DayStat).fullLabel) : ""
          }
          formatter={(value) => `${Number(value).toLocaleString(locale)} ${unit}`}
        />
        {goalMl != null && (
          <ReferenceLine
            y={goalMl}
            stroke="#5aa6dc"
            strokeDasharray="4 4"
            label={{ value: goalLabel, position: "insideTopRight", fontSize: 10, fill: "#5aa6dc" }}
          />
        )}
        <Bar dataKey="waterMl" name={seriesName} radius={[6, 6, 0, 0]} maxBarSize={28}>
          {data.map((day) => (
            <Cell
              key={day.date}
              fill={goalMl != null && day.waterMl >= goalMl ? REACHED : NOT_REACHED}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </section>
);

export default WaterChart;
