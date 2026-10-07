-- JAIN STOCK EXCHANGE — internal staff account model
-- Customer teams are not application users.
-- Active staff roles: 10 Pit Managers, 4 Bank, 4 Exchange,
-- 4 Institutional Investors, 1 Admin, 1 Associate Admin.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'PIT_MANAGER';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'ASSOCIATE_ADMIN';

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_check;
ALTER TABLE public.users ADD CONSTRAINT users_check CHECK (
  (role = 'INSTITUTION' AND institution_id IS NOT NULL AND team_id IS NULL)
  OR
  (role IN ('EXCHANGE','BANK','PIT_MANAGER','ADMIN','ASSOCIATE_ADMIN') AND team_id IS NULL AND institution_id IS NULL)
  OR
  (role = 'PARTICIPANT' AND team_id IS NOT NULL AND institution_id IS NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_uq
  ON public.users (LOWER(username))
  WHERE username IS NOT NULL;

UPDATE public.users SET is_active=false, updated_at=now() WHERE role='PARTICIPANT';

UPDATE public.users
SET username='PIT-01',display_name='Pit Manager 01',email='pit-manager-01@jse.local',
    role='PIT_MANAGER',team_id=NULL,institution_id=NULL,is_active=true,updated_at=now()
WHERE username='EXCHANGE';

UPDATE public.users
SET username='BANK-01',display_name='Bank 01',email='bank-01@jse.local',
    role='BANK',team_id=NULL,institution_id=NULL,is_active=true,updated_at=now()
WHERE username='BANK';

UPDATE public.users
SET username='INST-01',display_name='Institutional Investor 01',email='institution-01@jse.local',
    role='INSTITUTION',team_id=NULL,institution_id=(SELECT id FROM public.institutions ORDER BY id LIMIT 1),
    is_active=true,updated_at=now()
WHERE username='INSTITUTION';

UPDATE public.users
SET username='ADMINAP',display_name='JSE Administrator',email='admin@jse.local',
    role='ADMIN',team_id=NULL,institution_id=NULL,is_active=true,updated_at=now()
WHERE username='ADMINAP';

INSERT INTO public.users(email,display_name,role,username,is_active)
SELECT 'pit-manager-'||lpad(n::text,2,'0')||'@jse.local',
       'Pit Manager '||lpad(n::text,2,'0'),'PIT_MANAGER','PIT-'||lpad(n::text,2,'0'),true
FROM generate_series(2,10) n
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE lower(u.username)=lower('PIT-'||lpad(n::text,2,'0')));

INSERT INTO public.users(email,display_name,role,username,is_active)
SELECT 'exchange-'||lpad(n::text,2,'0')||'@jse.local',
       'Exchange '||lpad(n::text,2,'0'),'EXCHANGE','EXCHANGE-'||lpad(n::text,2,'0'),true
FROM generate_series(1,4) n
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE lower(u.username)=lower('EXCHANGE-'||lpad(n::text,2,'0')));

INSERT INTO public.users(email,display_name,role,username,is_active)
SELECT 'bank-'||lpad(n::text,2,'0')||'@jse.local',
       'Bank '||lpad(n::text,2,'0'),'BANK','BANK-'||lpad(n::text,2,'0'),true
FROM generate_series(1,4) n
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE lower(u.username)=lower('BANK-'||lpad(n::text,2,'0')));

INSERT INTO public.users(email,display_name,role,username,institution_id,is_active)
SELECT 'institution-'||lpad(n::text,2,'0')||'@jse.local',
       'Institutional Investor '||lpad(n::text,2,'0'),'INSTITUTION',
       'INST-'||lpad(n::text,2,'0'),(SELECT id FROM public.institutions ORDER BY id LIMIT 1),true
FROM generate_series(1,4) n
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE lower(u.username)=lower('INST-'||lpad(n::text,2,'0')));

INSERT INTO public.users(email,display_name,role,username,is_active)
SELECT 'associate-admin@jse.local','Associate Administrator','ASSOCIATE_ADMIN','ASSOC-ADMIN',true
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE lower(u.username)=lower('ASSOC-ADMIN'));
