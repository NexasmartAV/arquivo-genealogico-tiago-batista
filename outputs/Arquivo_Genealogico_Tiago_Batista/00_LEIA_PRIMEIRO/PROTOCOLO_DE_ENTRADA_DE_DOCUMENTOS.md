# Protocolo de entrada de documentos genealógicos

Aplicar a toda imagem, PDF, certidão, foto de livro, print de portal ou relato familiar recebido para a pesquisa de Tiago Batista.

## 1. Preservar antes de interpretar

1. Manter o arquivo original sem edição.
2. Salvar o original na pasta da pessoa, em `ORIGINAL_RESTRITO` quando houver dados pessoais, assinatura, endereço, números de documento ou informação médica.
3. Registrar origem: família, portal oficial, cartório, cemitério, paróquia ou acervo.
4. Calcular e registrar hash quando o arquivo for efetivamente incorporado ao acervo.

## 2. Criar material de conferência separado

1. Produzir um print/imagem de consulta somente quando isso não alterar o original.
2. Salvar o print em `PRINT_DE_CONFERENCIA` ou equivalente, separado da fonte original.
3. Ocultar dados pessoais desnecessários na versão de consulta pública/familiar, sem alterar o original.

## 3. Extrair fatos sem inventar

Registrar literalmente, com grafia do documento:

- nome da pessoa;
- data e lugar do fato;
- pais, cônjuge, filhos e declarante quando estiverem escritos;
- livro, folha, termo, cartório/cemitério/paróquia;
- data do documento e tipo de fonte.

Não completar parentesco, sobrenome, idade, data ou número de filhos por lembrança ou por árvore pública.

## 4. Classificar a evidência

| Marca | Significado | Uso na árvore |
|---|---|---|
| D | documento primário visto | pode sustentar um fato literal |
| R | relato familiar ou fonte secundária | orientar pesquisa, não provar sozinho |
| H | hipótese de identidade/parentesco | manter separada até confirmação |
| X | divergência | listar as versões e a fonte de cada uma |

## 5. Atualizar o acervo

Ao entrar um documento válido:

1. atualizar a transcrição segura da pessoa;
2. adicionar a fonte na Matriz de Pessoas, Fontes e Lacunas;
3. atualizar o Registro Mestre somente com os fatos documentados;
4. registrar a consulta no Diário de Pesquisa;
5. atualizar o PDF da árvore somente depois da conferência.

## 6. Regra para pedidos online e pagamentos

Antes de enviar uma solicitação ou pagar:

1. conferir se já há livro, folha, termo e cartório;
2. confirmar o tipo de emissão — breve relato ou inteiro teor;
3. conferir valor e prazo exibidos;
4. pedir confirmação específica de Tiago imediatamente antes do envio/cobrança;
5. registrar o protocolo/recibo recebido, sem expor dados financeiros.

## 7. Estrutura recomendada por pessoa

```text
Nome_da_Pessoa/
  Tipo_do_Documento/
    ORIGINAL_RESTRITO/
    PRINT_DE_CONFERENCIA/
    TRANSCRICAO_GENEALOGICA_SEM_DADOS_SENSIVEIS.md
    CADEIA_DE_CUSTODIA_E_FONTE.md
```

Se o arquivo estiver primeiro em `Downloads\\Arvore`, ele é somente uma cópia de entrada. Não mover nem apagar esse original familiar sem confirmação de Tiago; comparar hash antes de decidir se precisa de cópia adicional.
