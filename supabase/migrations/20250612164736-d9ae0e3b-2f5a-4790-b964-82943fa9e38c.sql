-- Enable Row Level Security on dados_caip table
ALTER TABLE public.dados_caip ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view data from their own organization unit
CREATE POLICY "Users can view data from their organization unit" 
ON public.dados_caip 
FOR SELECT 
TO authenticated
USING (
  unidade_gestora = (
    SELECT unidade_lotacao 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create policy for users to insert data for their organization unit
CREATE POLICY "Users can insert data for their organization unit" 
ON public.dados_caip 
FOR INSERT 
TO authenticated
WITH CHECK (
  unidade_gestora = (
    SELECT unidade_lotacao 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create policy for users to update data from their organization unit
CREATE POLICY "Users can update data from their organization unit" 
ON public.dados_caip 
FOR UPDATE 
TO authenticated
USING (
  unidade_gestora = (
    SELECT unidade_lotacao 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create policy for users to delete data from their organization unit
CREATE POLICY "Users can delete data from their organization unit" 
ON public.dados_caip 
FOR DELETE 
TO authenticated
USING (
  unidade_gestora = (
    SELECT unidade_lotacao 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Admins can view all data
CREATE POLICY "Admins can view all data" 
ON public.dados_caip 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert any data
CREATE POLICY "Admins can insert any data" 
ON public.dados_caip 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update any data
CREATE POLICY "Admins can update any data" 
ON public.dados_caip 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any data
CREATE POLICY "Admins can delete any data" 
ON public.dados_caip 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));