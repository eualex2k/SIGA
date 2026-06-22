import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Initialize Supabase client with service role key (server‑side only)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Vercel edge function that receives a JSON body:
 * { transaction_id: string }
 * It validates the user session, checks permissions, finds the receipt file
 * associated to the transaction and returns a signed URL (60 s).
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1️⃣ Parse body
  const { transaction_id } = req.body ?? {};
  if (!transaction_id) {
    return res.status(400).json({ error: "transaction_id required" });
  }

  // 2️⃣ Get auth token from cookies (Supabase access token)
  const token = req.cookies["sb-access-token"];
  if (!token) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  // 3️⃣ Verify user and role
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  // Assume role stored in user.user_metadata.role
  const role = (user.user_metadata?.role ?? "viewer").toString().toLowerCase();
  if (!["admin", "financial"].includes(role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }

  // 4️⃣ Fetch transaction and receipt reference
  const { data: transaction, error: trxErr } = await supabase
    .from("transactions")
    .select("receipt_path")
    .eq("id", transaction_id)
    .single();
  if (trxErr || !transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const receiptPath = transaction.receipt_path;
  if (!receiptPath) {
    return res.status(404).json({ error: "No receipt attached" });
  }

  // 5️⃣ Generate signed URL (60 seconds)
  const { data: signed, error: signErr } = await supabase
    .storage
    .from("receipts")
    .createSignedUrl(receiptPath, 60);
  if (signErr) {
    console.error("Signed URL error", signErr);
    return res.status(500).json({ error: "Failed to generate signed URL" });
  }

  // 6️⃣ Respond with URL
  return res.status(200).json({ url: signed?.signedUrl });
}
