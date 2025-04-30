
import React from 'react';
import { HeartPulse } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface VitalDataPoint {
  time: string;
  value: number;
}

interface VitalsChartProps {
  title: string;
  data: VitalDataPoint[];
  unit: string;
  normalRange?: {
    min: number;
    max: number;
  };
  color?: string;
  className?: string;
}

const VitalsChart: React.FC<VitalsChartProps> = ({
  title,
  data,
  unit,
  normalRange,
  color = "#ef4444",
  className
}) => {
  // Get the most recent value
  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
  
  // Check if the current value is outside normal range
  const isAbnormal = normalRange && 
    (currentValue < normalRange.min || currentValue > normalRange.max);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <HeartPulse 
              className={cn("h-4 w-4", isAbnormal ? "text-red-500" : "text-muted-foreground")} 
            />
            {title}
          </div>
          <span className={cn(
            "text-xl font-bold", 
            isAbnormal ? "text-red-500" : ""
          )}>
            {currentValue} {unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                tickMargin={5}
                tickFormatter={(value) => value}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                domain={normalRange ? [normalRange.min - 10, normalRange.max + 10] : ['auto', 'auto']} 
                tickCount={5}
              />
              <Tooltip 
                formatter={(value) => [`${value} ${unit}`, title]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={true}
              />
              {normalRange && (
                <>
                  <Line
                    type="monotone"
                    dataKey={() => normalRange.max}
                    stroke="#9ca3af"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => normalRange.min}
                    stroke="#9ca3af"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalsChart;
