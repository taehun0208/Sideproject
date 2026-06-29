"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Customer, Treatment, Coupon, TREATMENT_TYPES } from "@/types";
import { Loader2 } from "lucide-react";

const TREATMENT_ICONS: Record<string, string> = {
  "다운펌": "〰️",
  "염색": "🎨",
  "클리닉": "✨",
  "커트": "✂️",
};

function StampRow({ stamps, isCoupon }: { stamps: number; isCoupon: boolean }) {
  const filled = isCoupon ? 5 : stamps;
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < filled;
        const isLast = i === 4;
        return (
          <div
            key={i}
            className={`
              flex-1 aspect-square rounded-full flex items-center justify-center transition-all duration-300
              ${isFilled
                ? isLast
                  ? "bg-[#1A2855] ring-2 ring-[#C17B73] ring-offset-1"
                  : "bg-[#1A2855]"
                : isLast
                  ? "border-2 border-dashed border-[#C17B73]/60"
                  : "border-2 border-slate-200"
              }
            `}
          >
            {isFilled && (
              <span className="text-[#FAF8F4]" style={{ fontSize: "0.55rem" }}>✂</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerPublicPage() {
  const params = useParams();
  const token = params.token as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPublicData();
  }, [token]);

  async function loadPublicData() {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from("tokens")
        .select("customer_id")
        .eq("token", token)
        .single();

      if (tokenError || !tokenData) {
        setError("유효하지 않은 링크입니다");
        setIsLoading(false);
        return;
      }

      const customerId = tokenData.customer_id;

      const [
        { data: customerData, error: customerError },
        { data: treatmentData, error: treatmentError },
        { data: couponData, error: couponError },
      ] = await Promise.all([
        supabase.from("customers").select("*").eq("id", customerId).single(),
        supabase.from("treatments").select("*").eq("customer_id", customerId).order("treated_at", { ascending: false }),
        supabase.from("coupons").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
      ]);

      if (customerError) throw customerError;
      if (treatmentError) throw treatmentError;
      if (couponError) throw couponError;

      setCustomer(customerData);
      setTreatments(treatmentData || []);
      setCoupons(couponData || []);
    } catch {
      setError("데이터를 불러올 수 없습니다");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A2855] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#FAF8F4]/30 animate-spin" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-[#1A2855] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-4xl mb-4">🔗</p>
          <p className="text-[#FAF8F4] font-bold mb-1">링크를 찾을 수 없어요</p>
          <p className="text-[#FAF8F4]/40 text-sm">{error || "미용사에게 새 링크를 요청하세요"}</p>
        </div>
      </div>
    );
  }

  const treatmentCounts = TREATMENT_TYPES.map((type) => {
    const total = treatments.filter((t) => t.treatment_type === type).length;
    const cycleStamps = total % 5;
    const stamps = total > 0 && cycleStamps === 0 ? 5 : cycleStamps;
    const isCoupon = total > 0 && total % 5 === 0;
    return { type, total, stamps, isCoupon };
  });

  const activeCoupons = coupons.filter((c) => c.status === "active");
  const usedCoupons = coupons.filter((c) => c.status === "used");

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 네이비 헤더 */}
      <div className="bg-[#1A2855] px-5 pt-10 pb-14">
        <div className="max-w-[480px] mx-auto text-center">
          <p
            className="text-[#E8A0AD] leading-none mb-[-6px] select-none"
            style={{ fontFamily: "var(--font-dancing)", fontSize: "2rem" }}
          >
            mio
          </p>
          <p
            className="text-[#FAF8F4] font-black leading-none tracking-[0.12em] uppercase select-none"
            style={{ fontSize: "3rem" }}
          >
            STAMP
          </p>
          <div className="mt-5">
            <p className="text-[#FAF8F4] font-bold text-xl">{customer.name}님</p>
            <p className="text-[#FAF8F4]/40 text-sm mt-1">스탬프 카드</p>
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 -mt-6">

        {/* 스탬프 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {treatmentCounts.map(({ type, total, stamps, isCoupon }) => (
            <div
              key={type}
              className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{TREATMENT_ICONS[type] || "💇"}</span>
                  <span className="text-xs font-bold text-slate-800">{type}</span>
                </div>
                {isCoupon ? (
                  <span className="text-[10px] font-bold text-[#C17B73] bg-[#C17B73]/10 rounded-full px-2 py-0.5">
                    쿠폰!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    {5 - stamps}회 남음
                  </span>
                )}
              </div>
              <StampRow stamps={stamps} isCoupon={isCoupon} />
              <p className="text-[10px] text-slate-300 mt-2">누적 {total}회 이용</p>
            </div>
          ))}
        </div>

        {/* 사용 가능한 쿠폰 */}
        {activeCoupons.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              사용 가능한 쿠폰 ({activeCoupons.length}장)
            </p>
            <div className="space-y-3">
              {activeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="relative bg-white border-2 border-dashed border-[#C17B73]/40 rounded-2xl px-5 py-4 shadow-[0_4px_20px_rgba(193,123,115,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{TREATMENT_ICONS[coupon.treatment_type] || "💇"}</span>
                        <p className="font-bold text-slate-800">{coupon.treatment_type} 1회 무료</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        발급일 {new Date(coupon.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full bg-[#C17B73]/10 flex items-center justify-center shrink-0"
                    >
                      <span className="text-2xl">🎟️</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 사용 완료 쿠폰 */}
        {usedCoupons.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              사용 완료 ({usedCoupons.length}장)
            </p>
            <div className="space-y-2">
              {usedCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-3 opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{TREATMENT_ICONS[coupon.treatment_type] || "💇"}</span>
                    <p className="text-sm text-slate-500">{coupon.treatment_type} 1회 무료</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">사용됨</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white border border-slate-100 rounded-2xl px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <p className="text-xs text-slate-400">미용사에게 이 화면을 보여주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
