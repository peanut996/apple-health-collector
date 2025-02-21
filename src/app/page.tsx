'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

import { parse, format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthDataPoint {
  date: string;
  steps?: string;
  weight?: string;
  heartRate?: string;
}

interface ChartDataProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '健康数据可视化',
    },
  },
};

export default function HomePage() {
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/health-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: HealthDataPoint[] = await response.json();
        setHealthData(data);
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      }
    };

    fetchData();
  }, []);

  // 数据预处理 - 步数图表数据
  const stepData: ChartDataProps = {
    labels: healthData.map(item => {
      const date = parse(item.date, 'yyyy-MM-dd', new Date());
      if (isNaN(date.getTime())) {
        console.error('Invalid Date:', item.date);
        return 'Invalid Date';
      }
      return format(date, 'yyyy-MM-dd'); //  修改这里，格式化为 yyyy-MM-dd 日期格式
    }),
    datasets: [
      {
        label: '步数',
        data: healthData.map(item => parseInt(item.steps || '0')),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // 数据预处理 - 体重图表数据
  const weightData: ChartDataProps = {
    labels: healthData.map(item => {
      const date = parse(item.date, 'yyyy-MM-dd', new Date());
      if (isNaN(date.getTime())) {
        console.error('Invalid Date:', item.date);
        return 'Invalid Date';
      }
      return format(date, 'yyyy-MM-dd'); // 修改这里，格式化为 yyyy-MM-dd 日期格式
    }),
    datasets: [
      {
        label: '体重',
        data: healthData.map(item => parseFloat(item.weight || '0')),
        fill: false,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h1>Apple 健康数据可视化</h1>

      <h2>步数</h2>
      {healthData.length > 0 && stepData.datasets[0].data.length > 0 ? (
        <Line data={stepData as ChartData<'line'>} options={chartOptions} />
      ) : (
        <p>没有步数数据</p>
      )}

      <h2>体重</h2>
      {healthData.length > 0 && weightData.datasets[0].data.length > 0 ? (
        <Line data={weightData as ChartData<'line'>} options={chartOptions} />
      ) : (
        <p>没有体重数据</p>
      )}
    </div>
  );
}
