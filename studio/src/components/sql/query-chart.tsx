import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMemo, useState } from 'react'
import type { ChartConfig } from '@/components/ui/chart'

interface QueryChartProps {
  data: Array<Record<string, any>>
}

export function QueryChart({ data }: QueryChartProps) {
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  // Find a numeric column to use as default Y-axis
  const defaultYKey = useMemo(() => {
    if (columns.length === 0) return ''
    const numericCol = columns.find((col) => {
      const val = data[0][col]
      return (
        val !== null &&
        val !== undefined &&
        !isNaN(Number(val)) &&
        typeof val !== 'boolean'
      )
    })
    return numericCol || columns[1] || columns[0]
  }, [columns, data])

  const [xKey, setXKey] = useState<string>(columns[0] || '')
  const [yKey, setYKey] = useState<string>(defaultYKey || '')
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar')

  // Parse Y values safely to ensure they are numeric
  const chartData = useMemo(() => {
    return data.map((row) => {
      const val = row[yKey]
      const parsedVal =
        val === null || val === undefined || isNaN(Number(val))
          ? 0
          : Number(val)
      return {
        ...row,
        [yKey]: parsedVal,
      }
    })
  }, [data, yKey])

  const chartConfig = useMemo(() => {
    return {
      [yKey]: {
        label: yKey,
        color: 'var(--primary)',
      },
    } as ChartConfig
  }, [yKey])

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground p-8">
        No data available to chart
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-xl bg-card shrink-0">
        {/* Chart Type */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Chart Type
          </span>
          <Select
            value={chartType}
            onValueChange={(val) =>
              setChartType((val as 'bar' | 'line' | 'area') || 'bar')
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* X Axis */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            X-Axis Column
          </span>
          <Select value={xKey} onValueChange={(val) => setXKey(val || '')}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="X-Axis" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Y Axis */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Y-Axis Column (Numeric)
          </span>
          <Select value={yKey} onValueChange={(val) => setYKey(val || '')}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Y-Axis" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[300px] border rounded-xl p-6 bg-card flex flex-col justify-center overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="w-full h-full max-h-[350px]"
        >
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="fill-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey={yKey}
                fill="var(--color-bg)"
                className="fill-primary rounded-t-sm"
              />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="fill-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="var(--color-bg)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-bg)', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="fill-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="var(--color-bg)" stopOpacity={0.3} />
                  <stop stopColor="var(--color-bg)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={yKey}
                stroke="var(--color-bg)"
                strokeWidth={2}
                fill="url(#areaColor)"
              />
            </AreaChart>
          )}
        </ChartContainer>
      </div>
    </div>
  )
}
