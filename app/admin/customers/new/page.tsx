"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim()) {
      setError("이름과 전화번호를 모두 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("customers")
        .insert({
          user_id: session.user.id,
          name: name.trim(),
          phone: phone.trim(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/admin/customers/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "고객 등록 중 오류가 발생했습니다");
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
            <Link href="/admin/customers">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FAF8F4]/50 hover:text-[#FAF8F4] hover:bg-white/10 rounded-xl shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-[#FAF8F4] font-black leading-none tracking-tight text-2xl">
              새 손님 추가
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                이름
              </label>
              <Input
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:border-[#1A2855]/40 focus-visible:ring-[#1A2855]/10 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                전화번호
              </label>
              <Input
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:border-[#1A2855]/40 focus-visible:ring-[#1A2855]/10 rounded-xl text-base"
              />
            </div>

            {error && (
              <p className="text-[#C17B73] text-sm bg-[#C17B73]/8 border border-[#C17B73]/20 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Link href="/admin/customers" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-xl active:scale-95 transition-all"
                >
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 bg-[#1A2855] hover:bg-[#243570] active:scale-95 text-[#FAF8F4] font-bold rounded-xl transition-all"
              >
                {isLoading ? "등록 중..." : "등록 완료"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
