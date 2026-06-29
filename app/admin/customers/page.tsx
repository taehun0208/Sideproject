"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { ArrowLeft, Search, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      let query = supabase.from("customers").select("*");

      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네이비 헤더 */}
      <div className="bg-[#1A2855] px-5 pt-8 pb-6">
        <div className="max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FAF8F4]/50 hover:text-[#FAF8F4] hover:bg-white/10 rounded-xl shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-[#FAF8F4] font-black leading-none tracking-tight text-2xl">
                단골 손님
              </h1>
              <p className="text-[#FAF8F4]/35 text-xs mt-0.5">이름 또는 전화번호로 검색</p>
            </div>
            <Link href="/admin/customers/new">
              <Button
                size="sm"
                className="bg-[#E8A0AD] hover:bg-[#D4758A] active:scale-95 text-white rounded-xl font-bold transition-all shrink-0"
              >
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">새 손님</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 py-5">
        {/* 검색창 */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <Input
            placeholder="이름 또는 전화번호 입력..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-slate-100 text-slate-800 placeholder:text-slate-300 rounded-xl focus-visible:border-[#1A2855]/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-base"
          />
        </div>

        {/* 고객 목록 */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.04)]" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-24 text-slate-300">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">고객 정보를 찾을 수 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
                <div className="group flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-100 rounded-2xl px-4 py-3.5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="w-10 h-10 rounded-full bg-[#1A2855] flex items-center justify-center shrink-0">
                    <span
                      className="text-[#E8A0AD] font-black"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {customer.name.slice(0, 1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs text-slate-300 hidden sm:block">
                      {new Date(customer.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
