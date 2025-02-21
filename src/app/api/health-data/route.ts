// app/api/health-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义健康数据类型 (根据你的实际数据结构调整)
interface HealthDataPoint {
    date: string;
    steps?: string; // 可选属性，如果某些数据类型可能不存在
    weight?: string
    // ... 其他健康数据类型
}


function generateTestData(startDate: Date, days: number) {
  const data = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const dateString = currentDate.toISOString().slice(0, 10); // Format date as YYYY-MM-DD
    const steps = Math.floor(Math.random() * (12000 - 5000 + 1)) + 5000; // Generate random steps between 5000 and 12000

    const dataPoint: HealthDataPoint = {
      date: dateString,
      steps: String(steps),
    };

    const weight = (75 - i * 0.1 + Math.random() * 2 - 1).toFixed(2); // Generate decreasing weight with some random variation
    dataPoint.weight = String(weight);

    data.push(dataPoint);
    currentDate.setDate(currentDate.getDate() + 1); // Increment date by one day
  }
  return data;
}

function gen() {
  // 配置数据生成参数
  const startDate = new Date('2025-01-02'); // 设置起始日期
  const numberOfDays = 30;                // 生成数据的天数

  const testData = generateTestData(startDate, numberOfDays);

  // 将数据转换为 JSON 字符串，并格式化
  const jsonData = JSON.stringify(testData, null, 2);

  // 定义输出文件路径
  const filePath = path.join(process.cwd(), 'health-data.json')

  // 将 JSON 数据写入文件
  fs.writeFileSync(filePath, jsonData);

}

export async function POST(req: Request) {
    try {
        const healthDataPoint: HealthDataPoint = await req.json();

        // 文件路径
        const filePath = path.join(process.cwd(), 'health-data.json'); // 完整文件路径

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

    } catch (error) {
        console.error('Error saving health data to JSON file:', error);
        return NextResponse.json({ message: 'Failed to save health data.', error: error.message }, { status: 500 });
    }
}


export async function GET() { // 确保导出的是 GET 函数
    try {
        gen()
        // ... (读取 data.json 文件的代码) ...
        const filePath = path.join(process.cwd(), 'health-data.json');
        let healthData: HealthDataPoint[] = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            healthData = JSON.parse(fileContent);
        }
        return NextResponse.json(healthData, { status: 200 });

    } catch (error) {
        console.error('Error reading health data from JSON file:', error);
        return NextResponse.json({ message: 'Failed to read health data.', error: error.message }, { status: 500 });
    }
}
