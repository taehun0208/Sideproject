"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
        return;
      }

      router.push("/admin");
    } catch {
      setError("로그인 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1A2855] flex flex-col md:flex-row md:items-stretch">

      {/* 브랜드 패널 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden md:min-h-screen">
        <div className="absolute top-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full border border-white/5" />
        <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full border border-white/5" />
        <div className="absolute bottom-[60px] left-[-60px] w-[200px] h-[200px] rounded-full bg-[#E8A0AD]/5" />
        <div className="absolute top-12 left-8 w-1.5 h-1.5 rounded-full bg-[#E8A0AD]/40" />
        <div className="absolute top-20 left-16 w-1 h-1 rounded-full bg-[#E8A0AD]/25" />
        <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-[#E8A0AD]/30" />

        <div className="text-center select-none z-10">
          {/* mio — Dancing Script */}
          <p
            className="text-[#E8A0AD] leading-none mb-[-8px]"
            style={{ fontFamily: "var(--font-dancing)", fontSize: "clamp(3rem, 10vw, 5rem)" }}
          >
            mio
          </p>
          {/* STAMP — Geist 산세리프 볼드 */}
          <p
            className="text-[#FAF8F4] font-black leading-none tracking-[0.15em] uppercase"
            style={{ fontSize: "clamp(3.8rem, 14vw, 7rem)" }}
          >
            STAMP
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px w-8 bg-white/15" />
            <p className="text-[#FAF8F4]/35 text-xs tracking-[0.2em] uppercase">
              mio쌤의 스탬프 노트
            </p>
            <div className="h-px w-8 bg-white/15" />
          </div>
        </div>
      </div>

      {/* 폼 패널 */}
      <div className="
        bg-[#FAF8F4] px-6 pt-8 pb-10
        rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.15)]
        md:rounded-none md:shadow-none
        md:w-[420px] md:flex md:flex-col md:justify-center md:px-12
      ">
        <div className="w-10 h-1 bg-[#DDD8D2] rounded-full mx-auto mb-8 md:hidden" />

        <div className="hidden md:block mb-8">
          <p className="text-2xl font-black tracking-tight text-[#1A2855]">로그인</p>
          <p className="text-slate-500 text-sm mt-1">mio쌤 계정으로 시작해요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto md:max-w-none">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              이메일
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:border-[#1A2855]/40 focus-visible:ring-[#1A2855]/10 rounded-xl text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              비밀번호
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:border-[#1A2855]/40 focus-visible:ring-[#1A2855]/10 rounded-xl text-base"
            />
          </div>

          {error && (
            <p className="text-[#C17B73] text-sm bg-[#C17B73]/8 border border-[#C17B73]/20 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A2855] hover:bg-[#243570] active:scale-95 text-[#FAF8F4] font-bold rounded-xl transition-all mt-2 text-base tracking-wide"
            style={{ height: "3.25rem" }}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}
