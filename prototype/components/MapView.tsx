"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { Layers, LocateFixed, SlidersHorizontal, X } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { Button } from "@/components/Button";
import { Toast } from "@/components/Toast";
import {
  CITIES,
  CITY_CENTERS,
  CITY_DISTRICTS,
  type City,
  type CommunityPin,
  getTotalPriceWan,
  mockMapCommunities,
} from "@/lib/mock-map";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<CommunityPin["tier"], string> = {
  A: "#1A4B82",
  B: "#2563EB",
  C: "#D97706",
  D: "#6B7280",
};

const tierLabels: Record<CommunityPin["tier"], string> = {
  A: "改善",
  B: "中端",
  C: "刚需",
  D: "老旧",
};

function createPinIcon(pin: CommunityPin, isSelected: boolean) {
  const price = `${Math.round(pin.priceMin / 1000)}k-${Math.round(pin.priceMax / 1000)}k`;
  return L.divIcon({
    html: `<div style="background:white;border:2px solid ${TIER_COLORS[pin.tier]};border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.16);line-height:1.35;${isSelected ? "transform:scale(1.08)" : ""}">
      ${pin.name}<br><span style="color:${TIER_COLORS[pin.tier]}">${pin.tier}层 · ${price}</span><span style="color:#6B7280"> · ${pin.listingCount}套</span>
    </div>`,
    className: "",
    iconAnchor: [28, 12],
  });
}

function CityFlyTo({ city }: { city: City }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(CITY_CENTERS[city], city === "重庆" ? 11 : 12, { duration: 0.6 });
  }, [city, map]);
  return null;
}

export function MapView() {
  const [selectedCity, setSelectedCity] = useState<City>("北京");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<CommunityPin["tier"][]>(["A", "B", "C", "D"]);
  const [maxTotalPriceWan, setMaxTotalPriceWan] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityPin | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filteredPins = useMemo(
    () =>
      mockMapCommunities.filter(
        (pin) =>
          pin.city === selectedCity &&
          (selectedDistricts.length === 0 || selectedDistricts.includes(pin.district)) &&
          selectedTiers.includes(pin.tier) &&
          (maxTotalPriceWan === null || getTotalPriceWan(pin) <= maxTotalPriceWan),
      ),
    [maxTotalPriceWan, selectedCity, selectedDistricts, selectedTiers],
  );

  function handleCityChange(city: City) {
    setSelectedCity(city);
    setSelectedDistricts([]);
    setSelectedCommunity(null);
  }

  function toggleDistrict(district: string) {
    setSelectedDistricts((current) =>
      current.includes(district) ? current.filter((item) => item !== district) : [...current, district],
    );
  }

  function toggleTier(tier: CommunityPin["tier"]) {
    setSelectedTiers((current) => {
      if (current.includes(tier)) return current.length === 1 ? current : current.filter((item) => item !== tier);
      return [...current, tier];
    });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <div className="relative">
      <div className="relative h-[calc(100dvh-156px)] min-h-[560px] overflow-hidden">
        <MapContainer center={CITY_CENTERS[selectedCity]} zoom={12} scrollWheelZoom className="h-full w-full">
          <CityFlyTo city={selectedCity} />
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredPins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={createPinIcon(pin, selectedCommunity?.id === pin.id)}
              eventHandlers={{ click: () => setSelectedCommunity(pin) }}
            />
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-center gap-2">
          <div className="pointer-events-auto flex-1 rounded-xl bg-white px-3 py-3 text-body-s text-neutral-600 shadow-card">
            搜索城市/小区/地址 · 当前 {selectedCity}
          </div>
          <button
            type="button"
            className="pointer-events-auto flex size-11 items-center justify-center rounded-xl bg-primary-700 text-white shadow-card"
            onClick={() => setFilterOpen(true)}
            aria-label="筛选"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        </div>

        <div className="absolute bottom-44 left-3 z-[500] rounded-xl bg-white/95 p-3 text-caption shadow-card">
          {(Object.keys(tierLabels) as CommunityPin["tier"][]).map((tier) => (
            <div key={tier} className="flex items-center gap-2 py-0.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] }} />
              {tier}={tierLabels[tier]}
            </div>
          ))}
        </div>

        <div className="absolute bottom-44 right-3 z-[500] flex flex-col gap-2">
          <button
            className="flex size-11 items-center justify-center rounded-full bg-white text-primary-700 shadow-card"
            type="button"
            onClick={() => handleCityChange("北京")}
            aria-label="定位"
          >
            <LocateFixed className="size-5" />
          </button>
          <button
            className="flex size-11 items-center justify-center rounded-full bg-white text-primary-700 shadow-card"
            type="button"
            onClick={() => showToast("生产版可切换底图/热力层")}
            aria-label="图层"
          >
            <Layers className="size-5" />
          </button>
        </div>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-[510] rounded-t-2xl border border-neutral-200 bg-white p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-caption text-neutral-500">城市：{selectedCity} · 找到 {filteredPins.length} 个小区</p>
            <h2 className="text-h3">{selectedCommunity?.name ?? "点击地图 Pin 查看小区详情"}</h2>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setFilterOpen(true)}>筛选</Button>
        </div>
        {selectedCommunity ? (
          <div className="mt-3 rounded-xl bg-neutral-100 p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full px-2 py-1 text-caption font-semibold text-white" style={{ backgroundColor: TIER_COLORS[selectedCommunity.tier] }}>
                {selectedCommunity.tier}层 · {tierLabels[selectedCommunity.tier]}
              </span>
              <span className="price-nums text-body-s font-semibold">{Math.round(getTotalPriceWan(selectedCommunity))} 万参考总价</span>
            </div>
            <p className="mt-2 text-body-s text-neutral-700">
              {selectedCommunity.district} · ¥{selectedCommunity.priceMin.toLocaleString()}-{selectedCommunity.priceMax.toLocaleString()}/㎡ · {selectedCommunity.listingCount} 套在售 · {selectedCommunity.maintainerCount} 位维护人
            </p>
            <Link href={`/explore/dict/${selectedCommunity.id}`} className="mt-3 block">
              <Button className="w-full">查看小区详情</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filteredPins.slice(0, 8).map((pin) => (
              <button key={pin.id} type="button" className="shrink-0 rounded-xl bg-neutral-100 px-3 py-2 text-left" onClick={() => setSelectedCommunity(pin)}>
                <p className="text-caption font-semibold text-neutral-900">{pin.name}</p>
                <p className="text-[11px] text-neutral-500">{pin.tier} · {Math.round(getTotalPriceWan(pin))}万 · {pin.listingCount}套</p>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 border-t border-neutral-200 pt-2 text-center text-[11px] text-neutral-400">
          原型使用 OpenStreetMap + Mock 坐标；生产接入高德地图 JS API 2.0 + 开源底图业务数据层
        </p>
      </section>

      {filterOpen ? (
        <div className="fixed inset-0 z-[700] bg-black/30" role="dialog" aria-modal="true">
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[430px] rounded-t-2xl bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h3">地图筛选</h2>
              <button type="button" className="flex size-9 items-center justify-center rounded-full bg-neutral-100" onClick={() => setFilterOpen(false)} aria-label="关闭">
                <X className="size-5" />
              </button>
            </div>
            <FilterGroup title="城市">
              {CITIES.map((city) => (
                <Chip key={city} active={selectedCity === city} onClick={() => handleCityChange(city)}>{city}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup title="区域（不选为全部）">
              {CITY_DISTRICTS[selectedCity].map((district) => (
                <Chip key={district} active={selectedDistricts.includes(district)} onClick={() => toggleDistrict(district)}>{district}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup title="层级">
              {(["A", "B", "C", "D"] as CommunityPin["tier"][]).map((tier) => (
                <Chip key={tier} active={selectedTiers.includes(tier)} onClick={() => toggleTier(tier)}>{tier} · {tierLabels[tier]}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup title="参考总价上限">
              {[null, 200, 300, 500, 800, 1200].map((price) => (
                <Chip key={price ?? "all"} active={maxTotalPriceWan === price} onClick={() => setMaxTotalPriceWan(price)}>
                  {price === null ? "不限" : `${price}万内`}
                </Chip>
              ))}
            </FilterGroup>
            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setSelectedDistricts([]);
                  setSelectedTiers(["A", "B", "C", "D"]);
                  setMaxTotalPriceWan(null);
                }}
              >
                重置
              </Button>
              <Button className="flex-1" onClick={() => setFilterOpen(false)}>确认查看 {filteredPins.length} 个小区</Button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <Toast title={toast} /> : null}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-caption font-semibold text-neutral-500">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn("rounded-full px-3 py-2 text-caption font-semibold", active ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
