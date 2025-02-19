// app/api/health-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义健康数据类型 (根据你的实际数据结构调整)
interface HealthDataPoint {
    timestamp: string;
    steps?: string; // 可选属性，如果某些数据类型可能不存在
    weight?: string
    // ... 其他健康数据类型
}

export async function POST(req: Request) {
    try {
        const healthDataPoint: HealthDataPoint = await req.json();

        // 文件路径
        const dataDir = path.join(process.cwd(), 'data'); // data 文件夹路径
        const filePath = path.join(dataDir, 'health-data.json'); // 完整文件路径

        // 检查 data 文件夹是否存在，如果不存在则创建
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true }); //  recursive: true 确保父目录被创建
        }

        // 读取现有数据 (如果文件存在)
        let existingData: HealthDataPoint[] = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }

        // 添加新的健康数据点
        existingData.push(healthDataPoint);

        // 将更新后的数据写回 data.json 文件
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

        return NextResponse.json({ message: 'Health data saved successfully!' }, { status: 200 });

    } catch (error: any) {
        console.error('Error saving health data to JSON file:', error);
        return NextResponse.json({ message: 'Failed to save health data.', error: error.message }, { status: 500 });
    }
}
