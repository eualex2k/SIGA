import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/capacitacao/courses")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Cursos · Centro de Capacitação · ABCUNA" }] }),
});

type Course = {
  id: string;
  name: string;
  description: string | null;
  workload_hours: number;
  price: string;
  status: string;
  category_id: string | null;
  category: { name: string } | null;
};

type CategoryOption = { id: string; name: string };

function CoursesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["courseCategoriesOptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as CategoryOption[];
    },
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, category:course_categories(name)")
        .order("name");
      if (error) throw error;
      return data as Course[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return courses.filter((course) => {
      if (statusFilter !== "all" && course.status !== statusFilter) return false;
      if (term) {
        return (
          course.name.toLowerCase().includes(term) ||
          (course.description ?? "").toLowerCase().includes(term) ||
          (course.category?.name ?? "").toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [courses, search, statusFilter]);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Curso removido");
    },
    onError: (error: any) => toast.error("Falha ao remover", { description: error.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        subtitle="Cadastre e edite os cursos oferecidos no Centro de Capacitação."
        icon={<Plus className="h-5 w-5" />}
        actions={
          <Dialog
            open={open}
            onOpenChange={(value) => {
              setOpen(value);
              if (!value) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="glow-red">
                <Plus className="mr-2 h-4 w-4" /> Novo curso
              </Button>
            </DialogTrigger>
            <CourseDialog
              categories={categories}
              editing={editing}
              onDone={() => {
                setOpen(false);
                setEditing(null);
                qc.invalidateQueries({ queryKey: ["courses"] });
              }}
            />
          </Dialog>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Carga</TableHead>
                <TableHead className="hidden xl:table-cell">Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Nenhum curso encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((course) => (
                  <TableRow key={course.id} className="group">
                    <TableCell>
                      <p className="font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {course.description ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {course.category?.name ?? "Sem categoria"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {course.workload_hours}h
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      R$ {Number(course.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {course.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(course);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação apagará o curso permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove.mutate(course.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseDialog({
  categories,
  editing,
  onDone,
}: {
  categories: CategoryOption[];
  editing: Course | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [workload, setWorkload] = useState(editing?.workload_hours ?? 0);
  const [price, setPrice] = useState(editing ? Number(editing.price) : 0);
  const [status, setStatus] = useState(editing?.status ?? "draft");
  const [categoryId, setCategoryId] = useState<string>(editing?.category_id ?? "");
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      workload_hours: Number(workload),
      price: Number(price),
      status,
      category_id: categoryId || null,
    };

    const { error } = editing
      ? await supabase.from("courses").update(payload).eq("id", editing.id)
      : await supabase.from("courses").insert(payload);

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar curso", { description: error.message });
      return;
    }

    toast.success(editing ? "Curso atualizado" : "Curso cadastrado");
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    onDone();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input required value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Input
            value={description ?? ""}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={categoryId} onValueChange={(value) => setCategoryId(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem categoria</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Carga horária (h)</Label>
            <Input
              type="number"
              min={0}
              value={workload}
              onChange={(event) => setWorkload(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving} className="glow-red">
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
