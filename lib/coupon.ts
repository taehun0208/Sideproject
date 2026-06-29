import { supabase } from "./supabase";
import { COUPON_THRESHOLD } from "@/types";

export async function checkAndIssueCoupon(
  customerId: string,
  treatmentType: string
) {
  try {
    // 해당 시술 종류의 총 횟수 조회
    const { data: treatments, error: treatmentError } = await supabase
      .from("treatments")
      .select("*")
      .eq("customer_id", customerId)
      .eq("treatment_type", treatmentType);

    if (treatmentError) throw treatmentError;

    const treatmentCount = treatments?.length || 0;

    // 5회 도달했는지 확인
    if (treatmentCount > 0 && treatmentCount % COUPON_THRESHOLD === 0) {
      // 이미 발급된 쿠폰이 있는지 확인
      const { data: existingCoupons, error: couponCheckError } = await supabase
        .from("coupons")
        .select("*")
        .eq("customer_id", customerId)
        .eq("treatment_type", treatmentType)
        .eq("status", "active")
        .limit(1);

      if (couponCheckError) throw couponCheckError;

      // 없으면 새로 생성
      if (!existingCoupons || existingCoupons.length === 0) {
        const { error: insertError } = await supabase
          .from("coupons")
          .insert({
            customer_id: customerId,
            treatment_type: treatmentType,
            status: "active",
          });

        if (insertError) throw insertError;

        return {
          success: true,
          message: `${treatmentType} 쿠폰이 발급되었습니다!`,
          couponIssued: true,
        };
      }
    }

    return {
      success: true,
      couponIssued: false,
      treatmentCount,
    };
  } catch (error) {
    console.error("Error checking/issuing coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function recordTreatment(
  customerId: string,
  treatmentType: string
) {
  try {
    const { data, error } = await supabase
      .from("treatments")
      .insert({
        customer_id: customerId,
        treatment_type: treatmentType,
        treated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // 쿠폰 자동 발급 체크
    const couponResult = await checkAndIssueCoupon(
      customerId,
      treatmentType
    );

    return {
      success: true,
      treatment: data,
      coupon: couponResult,
    };
  } catch (error) {
    console.error("Error recording treatment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
