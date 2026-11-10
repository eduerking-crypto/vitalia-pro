"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, FileText, ShieldCheck, Trash2 } from "lucide-react";
import { fetchDocuments, deleteDocument, shareDocument, uploadDocument } from "@/lib/api/documents";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage, formatDateTime, formatFileSize } from "@/lib/utils";
import { Badge, Button, EmptyState, Input, Modal, SkeletonCard } from "@/components/ui";

const docSchema = z.object({
  filename: z.string().min(1, "Indica el nombre del documento"),
  document_type: z.string().min(1, "Indica el tipo de documento"),
  file_size: z.coerce.number().int().positive(),
});
type DocForm = z.infer<typeof docSchema>;

export default function DocumentsPage() {
  const [docs, setDocs] = useState<{ id: string; filename: string; document_type: string; file_size: number; uploaded_at: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments()
      .then((list) => setDocs(list))
      .catch(() => toast.error("No se pudieron cargar los documentos", apiErrorMessage(new Error("API"))));
  }, []);

  const handleShare = async (id: string) => {
    try {
      const { share_url } = await shareDocument(id);
      setShareId(id);
      navigator.clipboard.writeText(share_url);
      toast.success("Enlace seguro copiado al portapapeles");
    } catch (error) {
      toast.error("No se pudo compartir", apiErrorMessage(error));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDocument(id);
      setDocs((d) => d.filter((x) => x.id !== id));
      toast.success("Documento eliminado");
    } catch (error) {
      toast.error("No se pudo eliminar", apiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Documentos médicos</h1>
          <p className="text-sm text-secondary">
            Expediente seguro con cifrado de campo y enlaces de compartir expirables.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          Subir documento
        </Button>
      </header>

      <AlertSecurity />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={FileText}
              title="Sin documentos médicos"
              description="Sube tus informes, recetas y analíticas para tenerlos siempre disponibles."
              action={<Button onClick={() => setUploadOpen(true)}>Subir el primero</Button>}
            />
          </div>
        )}
        {docs.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => handleDelete(doc.id, doc.filename)}
            className="card-surface p-4 flex items-center gap-4 text-left"
          >
            <span className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-sage-600 dark:bg-neutral-800 dark:text-sage-300">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{doc.filename}</p>
              <p className="text-xs text-secondary">{doc.document_type}</p>
              <p className="mt-1 text-xs text-secondary">
                {formatFileSize(doc.file_size)} · {formatDateTime(doc.uploaded_at)}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleShare(doc.id); }}
                aria-label={`Compartir ${doc.filename}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--color-border)] text-secondary hover:bg-sage-50 dark:hover:bg-neutral-800"
                title="Generar enlace seguro y copiar al portapapeles"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </button>
        ))}
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={() => fetchDocuments().then(setDocs)} />
      <ShareModal open={shareId !== null} onClose={() => setShareId(null)} id={shareId ?? undefined} />
    </div>
  );
}

function AlertSecurity() {
  return (
    <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-medium">Tus documentos están protegidos (HIPAA / GDPR)</p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
            Cifrado a nivel de campo para datos sensibles y acceso auditado con hash encadenado.
            Los enlaces de compartir se generan con expiración de 7 días.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<DocForm>({
    resolver: zodResolver(docSchema),
    defaultValues: { document_type: "Informe médico", file_size: 102400 },
  });

  const submit = (values: DocForm) => {
    uploadDocument(values)
      .then(() => {
        toast.success("Documento subido");
        onSuccess?.();
        onClose();
      })
      .catch((error) => toast.error("No se pudo subir", apiErrorMessage(error)));
  };

  return (
    <Modal open={open} onClose={onClose} title="Subir documento" size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(submit)}>Subir</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input label="Nombre del archivo" placeholder="resultado-analitica.pdf" error={errors.filename?.message} {...register("filename")} />
        <Input label="Tipo de documento" placeholder="Informe médico" error={errors.document_type?.message} {...register("document_type")} />
        <Input label="Tamaño (bytes)" type="number" defaultValue="102400" error={errors.file_size?.message} {...register("file_size")} />
        <p className="text-xs text-secondary">
          Nota: en esta versión se registra la referencia del documento. En producción, el archivo
          se almacena en bucket seguro y la API devuelve su URL cifrada.
        </p>
      </form>
    </Modal>
  );
}

function ShareModal({ open, onClose, id }: { open: boolean; onClose: () => void; id?: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Enlace seguro generado" description="Comparte este enlace con tu médico. Expira en 7 días." size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <Input readOnly value={`https://vitalia.health/s/${id ?? ""}`} />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(`https://vitalia.health/s/${id ?? ""}`)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-600 hover:bg-sage-200 dark:bg-neutral-800 dark:text-sage-300"
          aria-label="Copiar enlace al portapapeles"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}
