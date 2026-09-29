"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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
  referenceKcal: number | null;
  referenceLabel: string;
  tickInterval: number;
};

const CaloriesChart = ({
  title,
  seriesName,
  unit,
  locale,
  data,
  referenceKcal,
  referenceLabel,
  tickInterval,
}: Props) => (
  <section className={styles["card"]}>
    <h2 className={styles["card-title"]}>{title}</h2>

    {/* Explicit height: ResponsiveContainer collapses to 0 inside some WebViews otherwise */}
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
        {referenceKcal != null && (
          <ReferenceLine
            y={referenceKcal}
            stroke="#ff7a5c"
            strokeDasharray="4 4"
            label={{ value: referenceLabel, position: "insideTopRight", fontSize: 10, fill: "#ff7a5c" }}
          />
        )}
        <Bar
          dataKey="kcal"
          name={seriesName}
          fill="#91c788"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  </section>
);

export default CaloriesChart;
