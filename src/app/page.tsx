"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler,
} from "chart.js";
import { parse, format, subMonths, subDays } from "date-fns";
import { zhCN } from "date-fns/locale";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface HealthDataPoint {
  date: string;
  steps?: string;
  weight?: string;
  heartRate?: string;
}

interface ChartProps {
  data: ChartData<"line">;
  options: ChartOptions<"line">;
  title: string;
  subtitle?: string;
  loading: boolean;
  isEmpty: boolean;
}

const appleColors = {
  red: "rgb(255, 59, 48)",
  orange: "rgb(255, 149, 0)",
  yellow: "rgb(255, 204, 0)",
  green: "rgb(52, 199, 89)",
  tealBlue: "rgb(90, 200, 250)",
  blue: "rgb(0, 122, 255)",
  purple: "rgb(175, 82, 222)",
  pink: "rgb(255, 45, 85)",
  gray: "rgb(142, 142, 147)",
  lightGray: "rgb(229, 229, 234)",
  background: "rgb(242, 242, 247)",
  cardBackground: "rgb(255, 255, 255)",
};

// Time period options
const TIME_PERIODS = {
  WEEK: "7D",
  MONTH: "1M",
  THREE_MONTHS: "3M",
  SIX_MONTHS: "6M",
  YEAR: "1Y",
  ALL: "ALL",
};

// Example data generator
const generateExampleData = (): HealthDataPoint[] => {
  const data: HealthDataPoint[] = [];
  const today = new Date();

  // Generate 180 days of data (approximately 6 months)
  for (let i = 180; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, "yyyy-MM-dd");

    // Generate realistic step counts (with weekday variation and some randomness)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseSteps = isWeekend ? 8500 : 7000; // More steps on weekends
    const randomVariation = Math.floor(Math.random() * 4000) - 2000; // -2000 to +2000
    const steps = Math.max(1000, baseSteps + randomVariation);

    // Generate realistic weight data (slight variations with a small trend)
    const trendFactor = Math.sin(i / 30) * 0.8; // Slight sinusoidal variation over time
    const baseWeight = 70.5; // Base weight in kg
    const randomWeightVariation = Math.random() * 0.6 - 0.3; // -0.3 to +0.3 kg
    const weight = (baseWeight + trendFactor + randomWeightVariation).toFixed(
      1
    );

    // Generate realistic heart rate data
    const baseHeartRate = 72; // Base resting heart rate
    const heartRateVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5 BPM
    // Add some "exercise days" with higher heart rates
    const exerciseDay = Math.random() > 0.7;
    const exerciseBonus = exerciseDay ? Math.floor(Math.random() * 20) + 10 : 0;
    const heartRate = Math.max(
      55,
      baseHeartRate + heartRateVariation + exerciseBonus
    );

    // Occasionally add missing data to make it more realistic
    const includeMissing = Math.random() > 0.95;

    data.push({
      date: dateString,
      steps: includeMissing ? undefined : steps.toString(),
      weight: includeMissing ? undefined : weight,
      heartRate: includeMissing ? undefined : heartRate.toString(),
    });
  }

  return data;
};

// Apple-style Chart Component
const AppleStyleChart: React.FC<ChartProps> = ({
  data,
  options,
  title,
  subtitle,
  loading,
  isEmpty,
}) => {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke={appleColors.gray}
              strokeWidth="2"
            />
            <path
              d="M9 9H9.01M15 9H15.01M9 15.5C10 16.5 11.5 17 12.5 16.5C13.5 16 14 15.5 15 15.5"
              stroke={appleColors.gray}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-body">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

// Time Period Selector Component
const TimePeriodSelector: React.FC<{
  activePeriod: string;
  onChange: (period: string) => void;
}> = ({ activePeriod, onChange }) => {
  return (
    <div className="time-period-selector">
      {Object.values(TIME_PERIODS).map((period) => (
        <button
          key={period}
          className={`period-button ${activePeriod === period ? "active" : ""}`}
          onClick={() => onChange(period)}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

// Main Component
export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>(TIME_PERIODS.MONTH);
  const [activeTab, setActiveTab] = useState<"steps" | "weight" | "heartRate">(
    "steps"
  );

  useEffect(() => {
    // Simulate API call with example data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Use example data instead of API call
        const exampleData = generateExampleData();
        setHealthData(exampleData);
      } catch (error) {
        console.error("Failed to load example data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    if (!healthData.length) return [];

    const now = new Date();
    let cutoffDate;

    switch (timePeriod) {
      case TIME_PERIODS.WEEK:
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case TIME_PERIODS.MONTH:
        cutoffDate = subMonths(new Date(), 1);
        break;
      case TIME_PERIODS.THREE_MONTHS:
        cutoffDate = subMonths(new Date(), 3);
        break;
      case TIME_PERIODS.SIX_MONTHS:
        cutoffDate = subMonths(new Date(), 6);
        break;
      case TIME_PERIODS.YEAR:
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return healthData;
    }

    return healthData.filter((item) => {
      const itemDate = parse(item.date, "yyyy-MM-dd", new Date());
      return itemDate >= cutoffDate;
    });
  }, [healthData, timePeriod]);

  // 在chartData useMemo中修改数据集颜色
  const chartData = useMemo(() => {
    if (!filteredData.length) return null;

    // Sort data by date
    const sortedData = [...filteredData].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const labels = sortedData.map((item) => {
      const date = parse(item.date, "yyyy-MM-dd", new Date());
      return format(date, "MMM d", { locale: zhCN });
    });

    const datasets = {
      steps: {
        label: "步数",
        data: sortedData.map((item) => parseInt(item.steps || "0")),
        borderColor: appleColors.green,
        backgroundColor: `rgba(52, 199, 89, 0.15)`, // 更透明的绿色
      },
      weight: {
        label: "体重 (kg)",
        data: sortedData.map((item) => parseFloat(item.weight || "0")),
        borderColor: appleColors.blue,
        backgroundColor: `rgba(0, 122, 255, 0.15)`, // 更透明的蓝色
      },
      heartRate: {
        label: "心率 (BPM)",
        data: sortedData.map((item) => parseFloat(item.heartRate || "0")),
        borderColor: appleColors.red,
        backgroundColor: `rgba(255, 59, 48, 0.15)`, // 更透明的红色
      },
    };

    return {
      labels,
      datasets: [
        {
          ...datasets[activeTab],
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          pointBackgroundColor: "#FFFFFF", // 白色点
          pointBorderColor: datasets[activeTab].borderColor, // 与线条颜色相同的边框
          pointBorderWidth: 1.5,
        },
      ],
    };
  }, [filteredData, activeTab]);

  // Chart options
  // 修改图表选项
  // 修改图表选项中的scales部分
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (activeTab === "steps") {
                label += context.parsed.y.toLocaleString();
              } else if (activeTab === "weight") {
                label += context.parsed.y.toFixed(1) + " kg";
              } else {
                label += context.parsed.y + " BPM";
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false, // 控制x轴边框
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          color: "#666", // 更改刻度颜色
        },
      },
      y: {
        beginAtZero: activeTab !== "weight",
        grid: {
          color: "rgba(0, 0, 0, 0.03)", // 更淡的网格线
        },
        border: {
          display: false, // 控制y轴边框
        },
        ticks: {
          font: {
            size: 10,
          },
          color: "#666", // 更改刻度颜色
          callback: function (value: string | number) {
            if (activeTab === "steps" && Number(value) >= 1000) {
              return Number(value) / 1000 + "k";
            }
            return value;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderJoinStyle: "round",
        borderCapStyle: "round",
      },
      point: {
        hitRadius: 10,
        hoverBorderWidth: 2,
      },
    },
    animation: {
      duration: 1000,
    },
  };

  // Get unit and average value based on active tab
  const getMetricInfo = () => {
    if (!filteredData.length) return { unit: "", average: 0 };

    switch (activeTab) {
      case "steps":
        const stepsValues = filteredData
          .map((d) => parseInt(d.steps || "0"))
          .filter((v) => v > 0);
        return {
          unit: "步",
          average: Math.round(
            stepsValues.reduce((sum, val) => sum + val, 0) /
              (stepsValues.length || 1)
          ),
        };
      case "weight":
        const weightValues = filteredData
          .map((d) => parseFloat(d.weight || "0"))
          .filter((v) => v > 0);
        return {
          unit: "kg",
          average: weightValues.length
            ? parseFloat(
                (
                  weightValues.reduce((sum, val) => sum + val, 0) /
                  weightValues.length
                ).toFixed(1)
              )
            : 0,
        };
      case "heartRate":
        const hrValues = filteredData
          .map((d) => parseFloat(d.heartRate || "0"))
          .filter((v) => v > 0);
        return {
          unit: "BPM",
          average: hrValues.length
            ? Math.round(
                hrValues.reduce((sum, val) => sum + val, 0) / hrValues.length
              )
            : 0,
        };
    }
  };

  // Get min and max values for the current dataset
  const getMinMaxValues = () => {
    if (!filteredData.length) return { min: 0, max: 0 };

    let values: number[] = [];

    switch (activeTab) {
      case "steps":
        values = filteredData
          .map((d) => parseInt(d.steps || "0"))
          .filter((v) => v > 0);
        break;
      case "weight":
        values = filteredData
          .map((d) => parseFloat(d.weight || "0"))
          .filter((v) => v > 0);
        break;
      case "heartRate":
        values = filteredData
          .map((d) => parseFloat(d.heartRate || "0"))
          .filter((v) => v > 0);
        break;
    }

    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
    };
  };

  const metricInfo = getMetricInfo();
  const minMaxValues = getMinMaxValues();
  const isDataEmpty =
    !filteredData.length ||
    (activeTab === "steps" &&
      !filteredData.some((d) => parseInt(d.steps || "0") > 0)) ||
    (activeTab === "weight" &&
      !filteredData.some((d) => parseFloat(d.weight || "0") > 0)) ||
    (activeTab === "heartRate" &&
      !filteredData.some((d) => parseFloat(d.heartRate || "0") > 0));

  return (
    <div className="health-dashboard">
      <header className="dashboard-header">
        <h1>Apple 健康数据</h1>
        <p className="header-subtitle">个人健康数据可视化</p>
      </header>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "steps" ? "active" : ""}`}
          onClick={() => setActiveTab("steps")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 5.5C19 7.98528 16.9853 10 14.5 10C12.0147 10 10 7.98528 10 5.5C10 3.01472 12.0147 1 14.5 1C16.9853 1 19 3.01472 19 5.5Z"
              fill={
                activeTab === "steps" ? appleColors.green : appleColors.gray
              }
            />
            <path
              d="M9.5 13C9.5 15.4853 7.48528 17.5 5 17.5C2.51472 17.5 0.5 15.4853 0.5 13C0.5 10.5147 2.51472 8.5 5 8.5C7.48528 8.5 9.5 10.5147 9.5 13Z"
              fill={
                activeTab === "steps" ? appleColors.green : appleColors.gray
              }
            />
            <path
              d="M24 13.5C24 15.9853 21.9853 18 19.5 18C17.0147 18 15 15.9853 15 13.5C15 11.0147 17.0147 9 19.5 9C21.9853 9 24 11.0147 24 13.5Z"
              fill={
                activeTab === "steps" ? appleColors.green : appleColors.gray
              }
            />
            <path
              d="M14.5 23C14.5 20.5147 12.4853 18.5 10 18.5C7.51472 18.5 5.5 20.5147 5.5 23C5.5 25.4853 7.51472 27.5 10 27.5C12.4853 27.5 14.5 25.4853 14.5 23Z"
              fill={
                activeTab === "steps" ? appleColors.green : appleColors.gray
              }
            />
          </svg>
          步数
        </button>
        <button
          className={`tab-button ${activeTab === "weight" ? "active" : ""}`}
          onClick={() => setActiveTab("weight")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill={
                activeTab === "weight" ? appleColors.blue : appleColors.gray
              }
            />
            <path
              d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
              fill={
                activeTab === "weight" ? appleColors.blue : appleColors.gray
              }
            />
          </svg>
          体重
        </button>
        <button
          className={`tab-button ${activeTab === "heartRate" ? "active" : ""}`}
          onClick={() => setActiveTab("heartRate")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
              fill={
                activeTab === "heartRate" ? appleColors.red : appleColors.gray
              }
            />
          </svg>
          心率
        </button>
      </div>

      <div className="time-period-container">
        <TimePeriodSelector
          activePeriod={timePeriod}
          onChange={setTimePeriod}
        />
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <span className="metric-title">
            平均
            {activeTab === "steps"
              ? "步数"
              : activeTab === "weight"
              ? "体重"
              : "心率"}
          </span>
          <span className="metric-value">
            {loading
              ? "加载中..."
              : isDataEmpty
              ? "无数据"
              : activeTab === "weight"
              ? `${metricInfo.average} ${metricInfo.unit}`
              : metricInfo.average.toLocaleString() + " " + metricInfo.unit}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-title">最低值</span>
          <span className="metric-value">
            {loading
              ? "加载中..."
              : isDataEmpty
              ? "无数据"
              : activeTab === "weight"
              ? `${minMaxValues.min} ${metricInfo.unit}`
              : minMaxValues.min.toLocaleString() + " " + metricInfo.unit}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-title">最高值</span>
          <span className="metric-value">
            {loading
              ? "加载中..."
              : isDataEmpty
              ? "无数据"
              : activeTab === "weight"
              ? `${minMaxValues.max} ${metricInfo.unit}`
              : minMaxValues.max.toLocaleString() + " " + metricInfo.unit}
          </span>
        </div>
      </div>

      <div className="chart-section">
        <AppleStyleChart
          data={chartData || { labels: [], datasets: [] }}
          options={chartOptions}
          title={
            activeTab === "steps"
              ? "步数趋势"
              : activeTab === "weight"
              ? "体重趋势"
              : "心率趋势"
          }
          subtitle={`${
            timePeriod === TIME_PERIODS.ALL ? "全部时间" : `最近${timePeriod}`
          }`}
          loading={loading}
          isEmpty={isDataEmpty}
        />
      </div>

      <footer className="dashboard-footer">
        <p>数据更新时间: {format(new Date(), "yyyy年MM月dd日 HH:mm")}</p>
        <p className="footer-note">示例数据 - 仅用于演示目的</p>
      </footer>

      <style jsx global>{`
        :root {
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: var(--font-sans);
          background-color: ${appleColors.background};
          color: #111;
          line-height: 1.5;
        }

        .health-dashboard {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .dashboard-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .header-subtitle {
          color: #666;
          font-size: 1rem;
        }

        .tab-navigation {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #555;
        }

        .tab-button.active {
          background-color: white;
          color: #000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab-button:hover:not(.active) {
          background-color: rgba(255, 255, 255, 0.5);
        }

        .time-period-container {
          margin-bottom: 1.5rem;
        }

        .time-period-selector {
          display: flex;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 10px;
          padding: 0.25rem;
          width: fit-content;
          margin: 0 auto;
        }

        .period-button {
          background: none;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #555;
        }

        .period-button.active {
          background-color: white;
          color: #000;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metrics-summary {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .metric-card {
          flex: 1;
          background-color: ${appleColors.cardBackground};
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        .metric-title {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .chart-section {
          background-color: ${appleColors.cardBackground};
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }

        .chart-container {
          width: 100%;
        }

        .chart-header {
          margin-bottom: 1rem;
        }

        .chart-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #333; /* 更深的标题颜色 */
        }

        .chart-subtitle {
          font-size: 0.875rem;
          color: #666;
        }

        .chart-body {
          height: 300px;
          position: relative;
          padding: 0.5rem 0;
        }

        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #666;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: ${appleColors.blue};
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #666;
        }

        .empty-state svg {
          margin-bottom: 1rem;
        }

        .dashboard-footer {
          text-align: center;
          margin-top: 2rem;
          color: #666;
          font-size: 0.875rem;
        }

        .footer-note {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #999;
        }

        @media (max-width: 768px) {
          .metrics-summary {
            flex-direction: column;
            gap: 0.75rem;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .metric-card {
            padding: 1rem;
          }

          .metric-value {
            font-size: 1.25rem;
          }

          .chart-section {
            padding: 1rem;
          }

          .chart-body {
            height: 250px;
          }

          .dashboard-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
