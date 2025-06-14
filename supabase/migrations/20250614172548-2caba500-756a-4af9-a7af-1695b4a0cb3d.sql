-- Criar perfis para usuários que tentaram fazer login mas não têm perfil
INSERT INTO public.profiles (id, nome_completo, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name', au.email),
    au.email,
    'usuario_padrao'::app_role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;