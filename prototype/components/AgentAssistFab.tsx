"use client";

import { useState } from "react";
import { Bot, Camera, Mic, Send, Type } from "lucide-react";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

type AgentAssistFabProps = {
  pageContext: string;
  suggestedPrompts?: string[];
};

/** Agent 原生交互壳：语音/文字/拍摄输入入口（原型占位） */
export function AgentAssistFab({ pageContext, suggestedPrompts = [] }: AgentAssistFabProps) {
  const [open, setOpen] = useState(false);
  const defaults = suggestedPrompts.length
    ? suggestedPrompts
    : ["帮我解读这页信息", "下一步我该做什么？", "用买家视角总结风险"];

  return (
    <>
      <button
        type="button"
        aria-label="打开 Fori 智能助手"
        className="fixed bottom-20 right-[calc(50%-205px)] z-30 flex size-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-card"
        onClick={() => setOpen(true)}
      >
        <Bot className="size-7" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Fori 智能助手">
        <p className="text-caption text-neutral-500">当前页面：{pageContext}</p>
        <p className="mt-2 text-body-s text-neutral-700">
          支持文字、语音与拍摄输入。助手将基于 OpenClaw Agent 编排，返回可执行建议与下一步操作。
        </p>

        <div className="mt-4 flex gap-2">
          <button type="button" className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-neutral-100 py-3 text-caption font-semibold">
            <Mic className="size-5 text-primary-700" />
            语音
          </button>
          <button type="button" className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-neutral-100 py-3 text-caption font-semibold">
            <Camera className="size-5 text-primary-700" />
            拍摄
          </button>
          <button type="button" className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-neutral-100 py-3 text-caption font-semibold">
            <Type className="size-5 text-primary-700" />
            文字
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {defaults.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-left text-body-s text-neutral-800"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Input className="flex-1" placeholder="输入问题或指令…" aria-label="Agent 输入" />
          <Button className="shrink-0 px-4">
            <Send className="size-4" />
          </Button>
        </div>

        <div className="mt-4 rounded-xl bg-primary-50 p-3 text-caption text-primary-800">
          示例输出：已根据您的浏览身份（未登录）隐藏房号与成交价；建议先完成手机验证以查看挂牌价参考。
        </div>
      </BottomSheet>
    </>
  );
}
