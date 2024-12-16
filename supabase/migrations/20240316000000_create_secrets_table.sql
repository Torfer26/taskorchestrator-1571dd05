create table "public"."secrets" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "value" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    constraint "secrets_pkey" primary key ("id"),
    constraint "secrets_name_key" unique ("name")
);

-- Establecer permisos RLS
alter table "public"."secrets" enable row level security;

-- Crear políticas de seguridad
create policy "Permitir lectura de secrets a usuarios autenticados"
on "public"."secrets"
for select
to authenticated
using (true);

-- Trigger para actualizar updated_at
create trigger handle_updated_at before update on secrets
  for each row execute procedure moddatetime (updated_at);