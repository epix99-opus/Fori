"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, FileCheck2, LineChart, ShieldCheck } from "lucide-react";

import { Button } from "@/components/Button";

type IntroSlide = {
  title: string;
  subtitle: string;
  icon: typeof Building2;
  accent: string;
};

const ONBOARDING_DONE_KEY = "onboardingDone";

const introSlides: IntroSlide[] = [
  {
    title: "全国楼盘数据共建共享",
    subtitle: "经纪人协同维护，买卖双方共享真实数据",
    icon: Building2,
    accent: "from-primary-300 to-white",
  },
  {
    title: "科学定价，透明可拆解",
    subtitle: "在地分层价格体系，告别盲目定价",
    icon: LineChart,
    accent: "from-secondary-200 to-white",
  },
  {
    title: "全链路公证保障",
    subtitle: "第三方存证，合规极简，交易无后顾之忧",
    icon: FileCheck2,
    accent: "from-primary-100 to-white",
  },
];

export default function SplashPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"splash" | "onboarding">("splash");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.localStorage.getItem(ONBOARDING_DONE_KEY) === "true") {
        router.replace("/home");
        return;
      }

      setPhase("onboarding");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [router]);

  const slide = introSlides[activeSlide];
  const Illustration = slide.icon;
  const isLastSlide = activeSlide === introSlides.length - 1;

  const dots = useMemo(
    () =>
      introSlides.map((item, index) => (
        <button
          key={item.title}
          type="button"
          aria-label={`查看第 ${index + 1} 页引导`}
          className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-6 bg-primary-700" : "w-2 bg-neutral-200"}`}
          onClick={() => setActiveSlide(index)}
        />
      )),
    [activeSlide],
  );

  function finishOnboarding() {
    window.localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    router.replace("/home");
  }

  if (phase === "splash") {
    return (
      <main className="mobile-shell flex min-h-dvh items-center justify-center bg-primary-900 px-8 text-white">
        <section className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <ShieldCheck className="size-12" />
          </div>
          <h1 className="mt-6 text-display tracking-normal">Fori</h1>
          <p className="mt-3 text-[18px] leading-7 text-primary-100">真实·合规·共赢的房产新生态</p>
          <div className="mx-auto mt-8 h-1 w-16 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-full animate-[shimmer_1.4s_infinite] rounded-full bg-white/80" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-shell flex min-h-dvh flex-col bg-white px-6 py-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={finishOnboarding}>
          跳过
        </Button>
      </div>

      <section className="flex flex-1 flex-col justify-between pb-4">
        <div className="pt-8">
          <div className={`flex h-[360px] items-center justify-center rounded-2xl bg-gradient-to-b ${slide.accent}`}>
            <div className="relative flex h-56 w-44 items-center justify-center rounded-[28px] bg-primary-900 text-white shadow-card">
              <div className="absolute -left-6 top-10 h-14 w-14 rounded-2xl bg-white/15" />
              <div className="absolute -right-5 bottom-12 h-16 w-16 rounded-full bg-white/10" />
              <Illustration className="size-24" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-caption font-semibold text-primary-700">{activeSlide + 1}/3</p>
            <h2 className="mt-2 text-h1">{slide.title}</h2>
            <p className="mx-auto mt-3 max-w-[290px] text-body-l text-neutral-500">{slide.subtitle}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex justify-center gap-2">{dots}</div>
          <Button
            className="h-12 w-full rounded-xl"
            onClick={() => (isLastSlide ? finishOnboarding() : setActiveSlide((value) => value + 1))}
          >
            {isLastSlide ? "立即开始" : "下一步"}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>
    </main>
  );
}
