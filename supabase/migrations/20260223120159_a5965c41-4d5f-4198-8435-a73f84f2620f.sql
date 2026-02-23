-- Corrigir pesos UOP com IDs corretos
UPDATE caderno_ambientes SET peso = 6 WHERE id = '5515fb35-c082-4b6b-836d-ac2f60b40093'; -- Banheiro zeladoria UOP: 0->6
UPDATE caderno_ambientes SET peso = 0 WHERE id = 'f29c0225-6957-45ca-b053-640778f9425e'; -- Box lavagem veículos UOP: 3->0
UPDATE caderno_ambientes SET peso = 3 WHERE id = 'bb1889f9-67f1-4937-9740-1e1e1f2549b4'; -- Casa de máquinas UOP: 6->3
UPDATE caderno_ambientes SET peso = 6 WHERE id = '0a349b27-ea04-4933-bb8a-e38a773d75d1'; -- Depósito de lixo UOP: 0->6
UPDATE caderno_ambientes SET peso = 10 WHERE id = '433d1efd-ba15-429b-a04a-f0728b5be4d5'; -- Garagem viaturas UOP: 6->10
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'a4b14c1f-5431-407c-948c-9a0347af4025'; -- Pátio retenção UOP: 10->1
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'ea6dcba9-6a50-4e63-8666-51c1654571a2'; -- Plataforma fiscalização UOP: 6->1
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'b10ad206-2f09-41da-950f-0a3b8e84466a'; -- Rampa fiscalização UOP: 10->1
UPDATE caderno_ambientes SET peso = 0 WHERE id = '3fb43f4e-73ff-4d31-ab63-4fcc2fd5176e'; -- Sala de aula UOP: 3->0
UPDATE caderno_ambientes SET peso = 1 WHERE id = '015f31aa-181a-4503-8890-8b4901f3b0f4'; -- Sala de revista pessoal UOP: 0->1
UPDATE caderno_ambientes SET peso = 3 WHERE id = 'eb3617b6-0e38-4402-a460-54c459d8661f'; -- Sala técnica UOP: 6->3
UPDATE caderno_ambientes SET peso = 1 WHERE id = 'f1c60df9-cfd2-4739-82b7-5839498a175d'; -- Telefone público UOP: 3->1
UPDATE caderno_ambientes SET peso = 10 WHERE id = 'ab77676d-187c-4a94-a4b3-97c0501eed80'; -- Vestiário policiais UOP: 6->10;