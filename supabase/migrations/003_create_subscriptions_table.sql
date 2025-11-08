create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null,
  status text not null default 'active',
  current_period_end timestamptz,
  metadata jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create index if not exists subscriptions_email_idx on public.subscriptions (email);
create unique index if not exists subscriptions_email_plan_idx on public.subscriptions (email, plan);

create or replace function public.update_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_updated_at_trigger on public.subscriptions;
create trigger subscriptions_updated_at_trigger
before update on public.subscriptions
for each row
execute procedure public.update_subscriptions_updated_at();
