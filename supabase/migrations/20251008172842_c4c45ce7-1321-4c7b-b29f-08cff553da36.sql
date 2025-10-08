-- Add unidade_gestora column to imoveis table to enable proper access control
ALTER TABLE public.imoveis 
ADD COLUMN unidade_gestora text;

-- Create index for better performance on filtering by unidade_gestora
CREATE INDEX idx_imoveis_unidade_gestora ON public.imoveis(unidade_gestora);

-- Enable Row Level Security on imoveis table
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view all properties
CREATE POLICY "Admins can view all properties"
ON public.imoveis
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Admins can insert any property
CREATE POLICY "Admins can insert any property"
ON public.imoveis
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Admins can update any property
CREATE POLICY "Admins can update any property"
ON public.imoveis
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Admins can delete any property
CREATE POLICY "Admins can delete any property"
ON public.imoveis
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can view properties from their management unit
CREATE POLICY "Users can view properties from their management unit"
ON public.imoveis
FOR SELECT
TO authenticated
USING (
  unidade_gestora = (
    SELECT unidade_gestora 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can insert properties for their management unit
CREATE POLICY "Users can insert properties for their management unit"
ON public.imoveis
FOR INSERT
TO authenticated
WITH CHECK (
  unidade_gestora = (
    SELECT unidade_gestora 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can update properties from their management unit
CREATE POLICY "Users can update properties from their management unit"
ON public.imoveis
FOR UPDATE
TO authenticated
USING (
  unidade_gestora = (
    SELECT unidade_gestora 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can delete properties from their management unit
CREATE POLICY "Users can delete properties from their management unit"
ON public.imoveis
FOR DELETE
TO authenticated
USING (
  unidade_gestora = (
    SELECT unidade_gestora 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Add comment explaining the security model
COMMENT ON TABLE public.imoveis IS 'Properties table with RLS policies restricting access by management unit (unidade_gestora). Admins have full access, regular users can only access properties from their own management unit.';