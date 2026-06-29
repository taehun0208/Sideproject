import { supabase } from "./supabase";

export async function generateCustomerToken(customerId: string) {
  try {
    const { data: existingToken } = await supabase
      .from("tokens")
      .select("*")
      .eq("customer_id", customerId)
      .limit(1)
      .single();

    if (existingToken) {
      return {
        success: true,
        token: existingToken.token,
        url: `/c/${existingToken.token}`,
      };
    }

    const token = crypto.randomUUID();

    const { data, error } = await supabase
      .from("tokens")
      .insert({ customer_id: customerId, token })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      token: data.token,
      url: `/c/${data.token}`,
    };
  } catch (error) {
    console.error("Error generating token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCustomerByToken(token: string) {
  try {
    const { data, error } = await supabase
      .from("tokens")
      .select(
        `
        customer_id,
        customers (
          id,
          name,
          phone,
          user_id,
          created_at,
          updated_at
        )
      `
      )
      .eq("token", token)
      .single();

    if (error) throw error;

    return {
      success: true,
      customer: data.customers,
    };
  } catch (error) {
    console.error("Error fetching customer by token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
