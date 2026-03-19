# Supabase setup для GitHub Pages

Этот сайт статический, поэтому для общей админки/статистики используется внешний backend — Supabase (через REST API).

## 1) Создай проект Supabase
- Перейди в Supabase и создай новый проект.
- Открой `Project Settings -> API`.
- Скопируй:
  - `Project URL`
  - `anon public key`

## 2) Выполни SQL (SQL Editor)

```sql
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  event_url text,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.site_events enable row level security;

-- Разрешаем чтение всем (для сайта)
drop policy if exists "content_select_all" on public.site_content;
create policy "content_select_all" on public.site_content
for select to anon using (true);

drop policy if exists "events_select_all" on public.site_events;
create policy "events_select_all" on public.site_events
for select to anon using (true);

-- Разрешаем запись всем (для админки и счетчиков)
drop policy if exists "content_write_all" on public.site_content;
create policy "content_write_all" on public.site_content
for all to anon using (true) with check (true);

drop policy if exists "events_insert_all" on public.site_events;
create policy "events_insert_all" on public.site_events
for insert to anon with check (true);

drop policy if exists "events_delete_all" on public.site_events;
create policy "events_delete_all" on public.site_events
for delete to anon using (true);
```

## 3) Заполни поля в админке сайта
В блоке `# admin panel`:
- Включи `Cloud mode (Supabase)`
- `Supabase URL` = URL проекта
- `Supabase anon key` = anon key
- `Content table` = `site_content`
- `Events table` = `site_events`
- `Content row key` = `main`

## 4) Первичная синхронизация
- Нажми `cloud push` чтобы залить текущий контент.
- Открой сайт в другом браузере/устройстве и нажми `cloud pull`.
- Для статистики используй `cloud sync stats`.

## Важно
- Это публичный `anon` ключ (его можно хранить на фронте).
- Любой, кто знает URL + ключ, сможет писать в таблицы при таких политиках.
- Для защищенной админки лучше добавить авторизацию и более строгие RLS политики.
