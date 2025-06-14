-- Adicionar campo formacao na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS formacao text;