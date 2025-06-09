import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import csvData from "../assets/Petri Lahdelma Time Bob-Omb(Pete).csv";
import Select from "../components/Select/Select";
import styles from "./WorkingHours.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Entry {
  date: Date;
  dayType: string;
  lunch: number;
  hours: number;
  overUnder: number;
  banked: number;
  note: string;
}

const parseTime = (t: string) => {
  const s = t.trim();
  if (!s) return 0;
  const [h, m] = s.split(":");
  return parseInt(h || "0", 10) + (parseInt(m || "0", 10) / 60);
};

const parseDate = (s: string) => {
  const [d, m, y] = s.split(".");
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
};

const parseCSV = (text: string): Entry[] => {
  const lines = text.trim().split(/\r?\n/);
  lines.shift();
  return lines.map((l) => {
    const c = l.split(",");
    return {
      date: parseDate(c[0]),
      dayType: c[1],
      lunch: parseTime(c[5] || ""),
      hours: parseFloat(c[10]) || 0,
      overUnder: parseFloat(c[11]) || 0,
      banked: parseFloat(c[15]) || 0,
      note: c[8] || "",
    } as Entry;
  });
};

const uniqueYears = (data: Entry[]) => {
  const years = Array.from(new Set(data.map((d) => d.date.getFullYear())));
  return years.sort((a, b) => a - b).map((y) => ({ label: y.toString(), value: y.toString() }));
};

const months = [
  { label: "All", value: "all" },
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const WorkingHours = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [year, setYear] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<string>("");
  const dayChartRef = useRef<ChartJS<"bar"> | null>(null);

  useEffect(() => {
    setEntries(parseCSV(csvData));
  }, []);

  const yearOptions = [{ label: "All", value: "all" }, ...uniqueYears(entries)];

  const filtered = entries.filter((e) => {
    const matchYear = year === "all" || e.date.getFullYear().toString() === year;
    const matchMonth =
      month === "all" || (e.date.getMonth() + 1).toString() === month;
    return matchYear && matchMonth;
  });

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startNextYear = new Date(now.getFullYear() + 1, 0, 1);

  const sumHours = (data: Entry[]) => data.reduce((s, e) => s + e.hours, 0);
  const sumLunch = (data: Entry[]) => data.reduce((s, e) => s + e.lunch, 0);

  const weekHours = sumHours(
    filtered.filter((e) => e.date >= startOfWeek && e.date < endOfWeek)
  );
  const monthHours = sumHours(
    filtered.filter((e) => e.date >= startOfMonth && e.date < startNextMonth)
  );
  const yearHours = sumHours(
    filtered.filter((e) => e.date >= startOfYear && e.date < startNextYear)
  );
  const totalHours = sumHours(filtered);

  const vacationDays = filtered.filter((e) => e.dayType === "Vacation").length;
  const holidayDays = filtered.filter((e) => e.dayType === "Holiday").length;
  const sickDays = filtered.filter((e) => e.dayType === "Sick").length;
  const lunchHours = sumLunch(filtered);
  const currentBanked =
    filtered.length > 0 ? filtered[filtered.length - 1].banked : 0;

  const hoursChart = {
    labels: ["This week", "This month", "This year", "Total"],
    datasets: [
      {
        label: "Hours",
        data: [weekHours, monthHours, yearHours, totalHours],
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const bankedChart = {
    labels: filtered.map((e) => e.date.toLocaleDateString()),
    datasets: [
      {
        label: "Banked Hours",
        data: filtered.map((e) => e.banked),
        fill: false,
        borderColor: "rgba(153,102,255,1)",
      },
    ],
  };

  const dayChart = {
    labels: filtered.map((e) => e.date.toLocaleDateString()),
    datasets: [
      {
        label: "Daily Hours",
        data: filtered.map((e) => e.hours),
        backgroundColor: "rgba(54,162,235,0.6)",
      },
    ],
  };

  const handleDayClick = (ele: any) => {
    if (!ele.length) return;
    const idx = ele[0].index;
    const note = filtered[idx].note;
    setSelectedNote(
      note ? `${filtered[idx].date.toLocaleDateString()}: ${note}` : "No notes for this day"
    );
  };

  return (
    <div className={styles.page}>
      <h1>Working Hours</h1>
      <div className={styles.filters}>
        <Select
          label="Year"
          options={yearOptions}
          value={year}
          onChange={(v) => setYear(v)}
        />
        <Select
          label="Month"
          options={months}
          value={month}
          onChange={(v) => setMonth(v)}
        />
      </div>
      <div className={styles.chart}>
        <Bar data={hoursChart} />
      </div>
      <div className={styles.chart}>
        <Line data={bankedChart} />
      </div>
      <div className={styles.chart}>
        <Bar
          ref={dayChartRef}
          data={dayChart}
          onClick={(event) => {
            const chart = dayChartRef.current;
            if (!chart) return;
            const elements = chart.getElementsAtEventForMode(
              event.nativeEvent as unknown as Event,
              "nearest",
              { intersect: true },
              false
            );
            handleDayClick(elements);
          }}
        />
      </div>
      <div className={styles.notes}>{selectedNote}</div>
      <div className={styles.notes}>
        <p>Vacation days: {vacationDays}</p>
        <p>Holiday days: {holidayDays}</p>
        <p>Sick days: {sickDays}</p>
        <p>Lunch hours: {lunchHours.toFixed(1)}</p>
        <p>Current banked hours: {currentBanked.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default WorkingHours;
