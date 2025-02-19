// pages/index.tsx
import React, { useEffect, useState } from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// 定义健康数据类型接口 (与 API 路由中保持一致)
interface HealthDataPoint {
    timestamp: string;
    步数?: string;
    心率?: string;
    // ... 其他健康数据类型
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


const chartOptions: ChartOptions<'line'> = { //  明确 ChartOptions 的类型为 'line'
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


export default function Home() {
    const [healthData, setHealthData] = useState<HealthDataPoint[]>([]); //  使用泛型指定 state 类型为 HealthDataPoint[]

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/health-data');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: HealthDataPoint[] = await response.json(); //  类型断言或类型注解 fetch 返回的数据类型
                setHealthData(data);
            } catch (error) {
                console.error('Failed to fetch health data:', error);
            }
        };

        fetchData();
    }, []);

    // 数据预处理
    const stepData: ChartDataProps = { //  类型注解 stepData
        labels: healthData.map(item => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: '步数',
                data: healthData.map(item => parseInt(item.步数 || '0')), //  使用类型守卫或默认值确保类型安全
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const heartRateData: ChartDataProps = { //  类型注解 heartRateData
        labels: healthData.map(item => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: '心率',
                data: healthData.map(item => parseInt(item.心率 || '0')), // 使用类型守卫或默认值确保类型安全
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
            },
        ],
    };


    return (
        <div>
            <h1>Apple 健康数据可视化</h1>

            {/* 步数图表 */}
            <h2>步数</h2>
            {healthData.length > 0 ? (
                <Line data={stepData as ChartData<'line'>} options={chartOptions} /> //  类型断言 ChartData 类型
            ) : (
                <p>没有步数数据</p>
            )}

            {/* 心率图表 */}
            <h2>心率</h2>
            {healthData.length > 0 ? (
                <Line data={heartRateData as ChartData<'line'>} options={chartOptions} /> //  类型断言 ChartData 类型
            ) : (
                <p>没有心率数据</p>
            )}
        </div>
    );
}
