-- Drop the table if it exists (to ensure clean state)
drop table if exists "public"."project_contexts";

-- Create the project_contexts table
create table "public"."project_contexts" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" bigint not null references projects(id) on delete cascade,
    "context" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "project_contexts_pkey" primary key ("id"),
    constraint "project_contexts_project_id_key" unique ("project_id")
);

-- Enable RLS
alter table "public"."project_contexts" enable row level security;

-- Create policy for all operations
create policy "Enable all operations for all users" on "public"."project_contexts"
    for all
    using (true)
    with check (true);

-- Grant access to authenticated and anon users
grant all on "public"."project_contexts" to authenticated, anon;

-- Create updated_at trigger
create or replace function "public"."handle_updated_at"()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create the trigger
create trigger "set_updated_at"
    before update on "public"."project_contexts"
    for each row
    execute function handle_updated_at();