import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard } from "lucide-react";

interface MembershipPaymentDialogProps {
  onDone: () => void;
}

export function MembershipPaymentDialog({ onDone }: MembershipPaymentDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    setSaving(true);

    // Upload receipt if provided
    let receiptPath: string | null = null;
    if (receiptFile) {
      const filePath = `mensalidades/${user.id}/${Date.now()}_${receiptFile.name}`;
      const { data, error } = await supabase.storage.from("receipts").upload(filePath, receiptFile);
      if (error) {
        toast.error("Erro ao enviar comprovante");
        setSaving(false);
        return;
      }
      receiptPath = data?.path ?? null;
    }

    const { error } = await supabase.from("membership_payments").insert({
      member_id: user.id,
      amount: Number(amount),
      payment_date: date,
      receipt_path: receiptPath,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao registrar pagamento", { description: error.message });
      return;
    }
    toast.success("Pagamento de mensalidade registrado");
    setAmount("");
    setNotes("");
    setReceiptFile(null);
    setDate(new Date().toISOString().slice(0, 10));
    setOpen(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <CreditCard className="mr-2 h-4 w-4" /> Pagamento Mensalidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pagamento de mensalidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="space-y-2">
            <Label>Valor *</Label>
            <Input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Comprovante (JPEG, PNG, PDF)</Label>
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Registrar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
