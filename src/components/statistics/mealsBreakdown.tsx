"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import styles from "./statsModules.module.css";

export type MealSlice = {
  key: string;
  label: string;
  kcal: number;
  percent: number;
  color: string;
};

type Props = {
  title: string;
  unit: string;
  locale: string;
  totalKcal: number;
  slices: MealSlice[];
};

const MealsBreakdown = ({ title, unit, locale, totalKcal, slices }: Props) => (
  <section className={styles["card"]}>
    <h2 className={styles["card-title"]}>{title}</h2>

    <div className={styles["donut-wrap"]}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="kcal"
            nameKey="label"
            innerRadius={56}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className={styles["donut-center"]}>
        <span className={styles["donut-total"]}>{totalKcal.toLocaleString(locale)}</span>
        <span className={styles["donut-unit"]}>{unit}</span>
      </div>
    </div>

    <div className={styles["legend"]}>
      {slices.map((slice) => (
        <div key={slice.key} className={styles["legend-row"]}>
          <span className={styles["legend-dot"]} style={{ background: slice.color }} />
          <span className={styles["legend-name"]}>{slice.label}</span>
          <span className={styles["legend-value"]}>
            {slice.kcal.toLocaleString(locale)} {unit}
          </span>
          <span className={styles["legend-percent"]}>{slice.percent}%</span>
        </div>
      ))}
    </div>
  </section>
);

export default MealsBreakdown;
