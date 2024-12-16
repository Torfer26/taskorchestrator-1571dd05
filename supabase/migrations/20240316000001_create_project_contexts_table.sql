create table "public"."project_contexts" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" bigint not null references projects(id),
    "context" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    constraint "project_contexts_pkey" primary key ("id"),
    constraint "project_contexts_project_id_key" unique ("project_id")
);

-- Establecer permisos RLS
alter table "public"."project_contexts" enable row level security;

-- Crear políticas de seguridad
create policy "Permitir lectura y escritura de contextos"
on "public"."project_contexts"
for all
using (true)
with check (true);

-- Trigger para actualizar updated_at
create trigger handle_updated_at before update on project_contexts
  for each row execute procedure moddatetime (updated_at);