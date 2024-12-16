-- Create the projects table
create table if not exists public.projects (
    id bigint generated by default as identity primary key,
    name text not null,
    description text,
    startDate text not null,
    endDate text not null,
    status text not null check (status in ('active', 'completed', 'on-hold')),
    priority text not null check (priority in ('low', 'medium', 'high')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.projects enable row level security;

-- Create a policy that allows all operations for now
create policy "Enable all operations for all users" on public.projects
    for all
    using (true)
    with check (true);

-- Grant access to authenticated and anon users
grant all on public.projects to anon, authenticated;