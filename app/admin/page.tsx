"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [customerCount, setCustomerCount] = useState(0);
  const [treatmentCount, setTreatmentCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { count: customers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      const { count: treatments } = await supabase
        .from("treatments")
        .select("*", { count: "exact", head: true });
      const { count: coupons } = await supabase
        .from("coupons")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      setCustomerCount(customers || 0);
      setTreatmentCount(treatments || 0);
      setCouponCount(coupons || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const stats = [
    { label: "단골 손님", value: customerCount, unit: "명" },
    { label: "총 시술", value: treatmentCount, unit: "회" },
    { label: "활성 쿠폰", value: couponCount, unit: "장" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네이비 헤더 */}
      <div className="bg-[#1A2855] px-5 pt-8 pb-14">
        <div className="max-w-[480px] mx-auto">
          <div className="flex items-end justify-between">
            <div className="select-none">
              <p
                className="text-[#E8A0AD] leading-none mb-[-4px]"
                style={{ fontFamily: "var(--font-dancing)", fontSize: "1.8rem" }}
              >
                mio
              </p>
              <p className="text-[#FAF8F4] font-black leading-none tracking-[0.12em] uppercase"
                style={{ fontSize: "2.8rem" }}
              >
                STAMP
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-[#FAF8F4]/50 hover:text-[#FAF8F4] hover:bg-white/10 mb-1"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              로그아웃
            </Button>
          </div>
          <p className="text-[#FAF8F4]/35 text-xs tracking-widest mt-1">오늘도 수고해요 ✿</p>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3 -mt-7 mb-7">
          {stats.map(({ label, value, unit }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <p className="text-[10px] text-slate-400 mb-1 font-medium truncate">{label}</p>
              <p
                className="text-[#1A2855] leading-none"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2rem, 7vw, 2.8rem)" }}
              >
                {isLoading ? "—" : value}
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5">{unit}</p>
            </div>
          ))}
        </div>

        {/* 메뉴 */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
          메뉴
        </p>
        <div className="space-y-3">
          <Link href="/admin/customers">
            <div className="group flex items-center gap-4 bg-[#1A2855] hover:bg-[#243570] active:scale-[0.98] rounded-2xl p-5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(26,40,85,0.15)]">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#E8A0AD]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#FAF8F4] text-sm">단골 손님</p>
                <p className="text-xs text-[#FAF8F4]/40 mt-0.5">검색 및 시술 기록 관리</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FAF8F4]/30 group-hover:text-[#FAF8F4]/70 transition-colors" />
            </div>
          </Link>

          <Link href="/admin/customers/new">
            <div className="group flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-100 hover:border-slate-200 rounded-2xl p-5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-xl bg-[#E8A0AD]/15 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-[#C17B73]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">새 손님 추가</p>
                <p className="text-xs text-slate-400 mt-0.5">신규 고객 정보 등록</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
