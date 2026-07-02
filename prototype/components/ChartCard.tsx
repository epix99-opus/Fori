"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <Skeleton className="h-56 rounded-xl" />,
});

export function ChartCard({
  title,
  eyebrow,
  option,
  height = 240,
}: {
  title: string;
  eyebrow?: string;
  option: EChartsOption;
  height?: number;
}) {
  return (
    <Card
      header={
        <div>
          {eyebrow ? <p className="text-caption text-neutral-500">{eyebrow}</p> : null}
          <h2 className="text-h3">{title}</h2>
        </div>
      }
    >
      <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />
    </Card>
  );
}
