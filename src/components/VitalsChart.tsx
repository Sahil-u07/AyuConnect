
import React from 'react';
import { HeartPulse } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
        <Tabs defaultValue="line" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent mb-0">
            <TabsTrigger 
              value="line" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs py-1 shadow-none"
            >
              Line View
            </TabsTrigger>
            <TabsTrigger 
              value="area" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs py-1 shadow-none"
            >
              Area View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="h-[150px] w-full mt-0">
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
          </TabsContent>
          
          <TabsContent value="area" className="h-[150px] w-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }} 
                  tickMargin={5}
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
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
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
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VitalsChart;
