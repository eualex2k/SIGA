export const fmtBRL = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n ?? 0));

export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

export const fmtMonth = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const monthStartISO = (offset = 0) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 10);
};

export const onlyDigits = (s: string) => (s || "").replace(/\D+/g, "");

export const maskCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

export const initials = (name?: string | null) =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export const maskDate = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

export const maskMonth = (v: string) => {
  const d = onlyDigits(v).slice(0, 6);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

export const parseDateToISO = (val: string | null | undefined) => {
  if (!val) return null;
  const cleaned = onlyDigits(val);
  if (cleaned.length !== 8) return null;
  const dd = cleaned.slice(0, 2);
  const mm = cleaned.slice(2, 4);
  const yyyy = cleaned.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
};

export const parseISOToDateInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const cleaned = iso.slice(0, 10);
  const parts = cleaned.split("-");
  if (parts.length !== 3) return "";
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
};

export const parseMonthToISO = (val: string | null | undefined) => {
  if (!val) return null;
  const cleaned = onlyDigits(val);
  if (cleaned.length !== 6) return null;
  const mm = cleaned.slice(0, 2);
  const yyyy = cleaned.slice(2, 6);
  return `${yyyy}-${mm}-01`;
};

export const parseISOToMonthInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const cleaned = iso.slice(0, 7);
  const parts = cleaned.split("-");
  if (parts.length !== 2) return "";
  const [yyyy, mm] = parts;
  return `${mm}/${yyyy}`;
};
