"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Customer, Treatment, TreatmentType, TREATMENT_TYPES } from "@/types";
import { recordTreatment } from "@/lib/coupon";
import { generateCustomerToken } from "@/lib/token";
import { ArrowLeft, Share2, Loader2, Copy, Check } from "lucide-react";
import Link from "next/link";

const TREATMENT_ICONS: Record<string, string> = {
  "다운펌": "〰️",
  "염색": "🎨",
  "클리닉": "✨",
  "커트": "✂️",
};

function StampRow({ count, isCoupon }: { count: number; isCoupon: boolean }) {
  const cycleStamps = count % 5;
  const stamps = isCoupon ? 5 : cycleStamps;

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < stamps;
        const isLast = i === 4;
        return (
          <div
            key={i}
            className={`
              flex-1 aspect-square rounded-full flex items-center justify-center transition-all duration-200
              ${filled
                ? isLast
                  ? "bg-[#1A2855] ring-2 ring-[#C17B73] ring-offset-1"
                  : "bg-[#1A2855]"
                : isLast
                  ? "border-2 border-dashed border-[#C17B73]/60"
                  : "border-2 border-slate-200"
              }
            `}
          >
            {filled && (
              <span className="text-[#FAF8F4]" style={{ fontSize: "0.55rem" }}>✂</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [couponAlert, setCouponAlert] = useState("");

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  async function loadCustomerData() {
    try {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      const { data: treatmentData, error: treatmentError } = await supabase
        .from("treatments")
        .select("*")
        .eq("customer_id", customerId)
        .order("treated_at", { ascending: false });

      if (treatmentError) throw treatmentError;
      setTreatments(treatmentData || []);
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecordTreatment(treatment: TreatmentType) {
    if (isRecording) return;
    setSelectedTreatment(treatment);
    setIsRecording(true);

    try {
      const result = await recordTreatment(customerId, treatment);

      if (result.success) {
        const newTreatment: Treatment = {
          id: crypto.randomUUID(),
          customer_id: customerId,
          treatment_type: treatment,
          treated_at: new Date().toISOString(),
        };
        setTreatments((prev) => [newTreatment, ...prev]);

        if (result.coupon?.couponIssued) {
          setCouponAlert(`${TREATMENT_ICONS[treatment] || ""} ${treatment} 쿠폰이 발급됐어요!`);
          setTimeout(() => setCouponAlert(""), 4000);
        }
      }
    } catch (error) {
      console.error("Error recording treatment:", error);
    } finally {
      setIsRecording(false);
      setSelectedTreatment(null);
    }
  }

  async function handleShowQR() {
    const result = await generateCustomerToken(customerId);
    if (result.success) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      setQrUrl(`${baseUrl}${result.url}`);
      setShowQR(true);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const treatmentCounts = TREATMENT_TYPES.map((type) => ({
    type,
    count: treatments.filter((t) => t.treatment_type === type).length,
    isCoupon: (() => {
      const c = treatments.filter((t) => t.treatment_type === type).length;
      return c > 0 && c % 5 === 0;
    })(),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1A2855] animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">고객 정보를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* 네이비 헤더 */}
      <div className="bg-[#1A2855] px-5 pt-8 pb-14">
        <div className="max-w-[480px] mx-auto">
          <div className="flex items-start gap-3">
            <Link href="/admin/customers">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FAF8F4]/50 hover:text-[#FAF8F4] hover:bg-white/10 rounded-xl mt-1 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1
                className="text-[#FAF8F4] font-black leading-none tracking-tight truncate"
                style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)" }}
              >
                {customer.name}
              </h1>
              <p className="text-[#FAF8F4]/40 text-sm mt-1">{customer.phone}</p>
            </div>
            <Button
              onClick={handleShowQR}
              size="sm"
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-[#FAF8F4] border border-white/10 rounded-xl mt-1 shrink-0 transition-all"
            >
              <Share2 className="w-4 h-4 md:mr-1.5" />
              <span className="hidden md:inline">공유</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 -mt-7">
        {/* 쿠폰 발급 알림 */}
        {couponAlert && (
          <div className="mb-4 px-4 py-3 bg-[#C17B73]/10 border border-[#C17B73]/25 rounded-2xl text-[#C17B73] text-sm font-bold">
            {couponAlert}
          </div>
        )}

        {/* 공유 링크 패널 */}
        {showQR && (
          <div className="mb-5 bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">손님 공개 링크</p>
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 mb-3">
              <p className="text-xs text-[#1A2855] font-mono flex-1 truncate">{qrUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                size="sm"
                className="flex-1 bg-[#1A2855] hover:bg-[#243570] active:scale-95 text-[#FAF8F4] rounded-xl font-bold transition-all"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5" />복사됨</>
                ) : (
                  <><Copy className="w-3.5 h-3.5 mr-1.5" />링크 복사</>
                )}
              </Button>
              <Button
                onClick={() => setShowQR(false)}
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-slate-700 rounded-xl"
              >
                닫기
              </Button>
            </div>
          </div>
        )}

        {/* 스탬프 현황 — 5칸 원형 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {treatmentCounts.map(({ type, count, isCoupon }) => (
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
                    {5 - (count % 5 === 0 && count > 0 ? 0 : count % 5)}회 남음
                  </span>
                )}
              </div>
              <StampRow count={count} isCoupon={isCoupon} />
              <p className="text-[10px] text-slate-300 mt-2">누적 {count}회</p>
            </div>
          ))}
        </div>

        {/* 시술 기록 버튼 */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            오늘의 시술
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TREATMENT_TYPES.map((type) => {
              const isThisLoading = isRecording && selectedTreatment === type;
              return (
                <button
                  key={type}
                  onClick={() => handleRecordTreatment(type)}
                  disabled={isRecording}
                  className={`
                    h-24 rounded-2xl border font-semibold transition-all
                    flex flex-col items-center justify-center gap-2
                    shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                    ${isThisLoading
                      ? "bg-[#1A2855] border-[#1A2855] text-[#FAF8F4]"
                      : isRecording
                      ? "bg-white border-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-white border-slate-100 text-slate-800 hover:bg-[#1A2855] hover:border-[#1A2855] hover:text-[#FAF8F4] active:scale-95"
                    }
                  `}
                >
                  {isThisLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs">기록 중</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">{TREATMENT_ICONS[type] || "💇"}</span>
                      <span className="text-sm font-bold">{type}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 시술 히스토리 */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            시술 히스토리
          </p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            {treatments.length === 0 ? (
              <p className="text-slate-300 text-sm text-center py-10">
                기록된 시술이 없습니다
              </p>
            ) : (
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {treatments.map((treatment, idx) => (
                  <div
                    key={treatment.id}
                    className="flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{TREATMENT_ICONS[treatment.treatment_type] || "💇"}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {treatment.treatment_type}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(treatment.treated_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 font-mono">#{treatments.length - idx}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
