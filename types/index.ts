export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type Treatment = {
  id: string;
  customer_id: string;
  treatment_type: string;
  treated_at: string;
};

export type Coupon = {
  id: string;
  customer_id: string;
  treatment_type: string;
  status: "active" | "used";
  created_at: string;
  used_at: string | null;
};

export type Token = {
  id: string;
  customer_id: string;
  token: string;
  created_at: string;
};

// 시술 종류
export const TREATMENT_TYPES = ["다운펌", "염색", "클리닉", "커트"] as const;
export type TreatmentType = (typeof TREATMENT_TYPES)[number];

// 쿠폰 기준 (시술별 5회마다 1회 무료)
export const COUPON_THRESHOLD = 5;
