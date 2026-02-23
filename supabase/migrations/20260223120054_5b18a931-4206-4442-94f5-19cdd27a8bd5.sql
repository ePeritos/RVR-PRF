-- Atualizar pesos UOP
UPDATE caderno_ambientes SET peso = 3 WHERE id = '7a6a4e78-7b66-459c-9ed7-1dd8f6cc2612'; -- Arquivo UOP: 6->3
UPDATE caderno_ambientes SET peso = 3 WHERE id = '2b8f9fa1-5e4d-4f92-9c65-64deafa8dfa6'; -- Casa de máquinas UOP: 6->3
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'e7bab9be-72e2-46e6-a5fd-3e7a3f85dccd'; -- Pátio retenção UOP: 10->1
UPDATE caderno_ambientes SET peso = 1 WHERE id = '8c07e1fc-71f3-4e62-83ea-57b4328e8ae4'; -- Plataforma fiscalização UOP: 6->1
UPDATE caderno_ambientes SET peso = 1 WHERE id = '28c9a52f-cc08-4e62-8caa-ed2c6f3b0c4c'; -- Rampa fiscalização UOP: 10->1
UPDATE caderno_ambientes SET peso = 0 WHERE id = '6f71b3e0-d0ee-4e13-b38c-eaa13c1b82e5'; -- Sala de aula UOP: 3->0
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'c5b37fe7-fd9b-4293-b09e-9ef19e85b5b5'; -- Sala de revista pessoal UOP: 0->1
UPDATE caderno_ambientes SET peso = 3 WHERE id = '47fdf5ea-b1bf-41b4-afe1-c0b41e40f77a'; -- Sala técnica UOP: 6->3
UPDATE caderno_ambientes SET peso = 1 WHERE id = '8f7e6a0c-9f4f-4a75-bfd1-52af1aaffc00'; -- Telefone público UOP: 3->1

-- Atualizar pesos DEL
UPDATE caderno_ambientes SET peso = 3 WHERE id = '18d818e5-f5a7-4542-b08e-53223ad57c15'; -- Área uso compartilhado DEL: 0->3
UPDATE caderno_ambientes SET peso = 3 WHERE id = '1e9644e8-fbbe-4f61-84af-379424a92c4f'; -- Arquivo DEL: 0->3
UPDATE caderno_ambientes SET peso = 6 WHERE id = 'caea75e8-7e36-49cd-9f2c-ce5b5089d1cf'; -- Auditório DEL: 3->6
UPDATE caderno_ambientes SET peso = 6 WHERE id = '82d3ae8b-c80e-4f9b-badc-e5ef03e917a8'; -- Banheiro zeladoria DEL: 3->6
UPDATE caderno_ambientes SET peso = 0 WHERE id = 'bbbcb9c0-73bc-4e38-b61d-90bae8fd1996'; -- Box chuveiro externo DEL: 3->0
UPDATE caderno_ambientes SET peso = 3 WHERE id = '0caf65c6-da97-4ccf-b31c-d4ccf3de26dd'; -- Casa de máquinas DEL: 6->3
UPDATE caderno_ambientes SET peso = 6 WHERE id = '73a00a45-667b-48fb-a1ae-78af87d8bd4e'; -- Sala de aula DEL: 3->6
UPDATE caderno_ambientes SET peso = 10 WHERE id = '3653bdc8-b7bf-4d49-ab4a-b18c02af304b'; -- Sala de reunião DEL: 6->10
UPDATE caderno_ambientes SET peso = 1 WHERE id = '7a94d488-e123-4da6-808c-050fc70d14d4'; -- Sala de assepsia DEL: 0->1
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'bba717d3-9b65-4b3b-ad60-8cccb153d60c'; -- Telefone público DEL: 3->1
UPDATE caderno_ambientes SET peso = 3 WHERE id = '3307f30b-bd3c-4438-9834-e3a32835a3bf'; -- Torre telecomunicações DEL: 10->3;

-- Inserir Canil para DEL (peso 3) - buscar tipo_imovel_id do DEL
INSERT INTO caderno_ambientes (nome_ambiente, peso, prioridade, tipo_imovel_id)
SELECT 'Canil', 3, 'Desejável', ti.id
FROM tipos_imoveis ti WHERE ti.nome_tipo = 'DEL'
ON CONFLICT DO NOTHING;