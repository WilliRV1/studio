'use client';

import { TrendingUp, Users } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";

interface CategoryDistributionChartProps {
  data: {
    category: string;
    athletes: number;
    fill: string;
  }[];
}

const chartConfig = {} as ChartConfig;

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  
  data.forEach(item => {
    chartConfig[item.category] = {
      label: item.category,
      color: item.fill,
    };
  });
  
  const totalAthletes = data.reduce((acc, curr) => acc + curr.athletes, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Distribución por Categoría</CardTitle>
        <CardDescription>Atletas inscritos y aprobados</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="athletes"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
             <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total de {totalAthletes} atletas aprobados <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando la distribución de atletas en todas las categorías.
        </div>
      </CardFooter>
    </Card>
  );
}