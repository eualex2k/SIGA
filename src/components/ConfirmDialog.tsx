import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function ConfirmDialog({ title, message, onConfirm, open, setOpen }: ConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.trim().toUpperCase() === "CONFIRMAR";

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmText("");
      setOpen && setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{/* trigger provided by parent */}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Digite CONFIRMAR"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen && setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!isConfirmed} onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            CONFIRMAR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
