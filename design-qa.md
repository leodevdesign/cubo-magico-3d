# Design QA — segunda seção

final result: passed

## Evidências

- Referência visual original: `C:\Users\User\Downloads\seção 2.png` (793 × 507 px).
- Verdade visual do problema relatado: `C:\Users\User\AppData\Local\Temp\codex-clipboard-0e4a9014-556b-4c63-a0d2-4aa2e4644c8a.png` (1906 × 954 px).
- Referência focada do recorte: `C:\Users\User\AppData\Local\Temp\codex-clipboard-98f9ccdd-efa6-43e1-bd72-57912b701052.png`.
- Implementação final: `C:\Users\User\.codex\visualizations\2026\07\28\019fa715-9e9f-7a72-8eb2-c44b8083aee8\section2-final-assets-1906x954-qa.png` (1906 × 954 px).
- Comparação full-view aberta e inspecionada: `C:\Users\User\.codex\visualizations\2026\07\28\019fa715-9e9f-7a72-8eb2-c44b8083aee8\section2-before-after-qa.png`.
- Viewport CSS desktop: 1906 × 954 px, densidade 1×, estado final do scroll (`scrollY: 1069`).
- Viewport CSS mobile: 390 × 844 px, densidade 1×.
- A comparação focada adicional não foi necessária: o fundo divergente, o corte retangular e a distribuição das faces são legíveis na comparação full-view; o segundo print do usuário confirma especificamente a borda problemática.

## Superfícies de fidelidade

| Superfície | Resultado |
| --- | --- |
| Tipografia | Hierarquia, pesos, quebras e alinhamento central foram preservados. A revelação passou a usar uma máscara sobre texto cinza, mantendo o mesmo comportamento no scroll sem falhas de composição. |
| Espaçamento e layout | Cubos continuam entrando pelas bordas, com área central livre para a narrativa. Há composições específicas para desktop largo, desktop padrão e mobile. |
| Cores | Fundo contínuo `#08090b`; nenhum retângulo preto pertence mais aos assets. O vermelho tem faces uniformes vermelha/vermelha/branca; o azul usa o mesmo render com vermelho→branco e branco→azul. |
| Qualidade das imagens | PNGs 1254 × 1254 com alpha real, objeto completo dentro do arquivo, bordas suaves e blur pré-renderizado sem halo de chroma key. |
| Copy | Texto histórico permaneceu inalterado. |

## Histórico da comparação

- [P1 corrigido] As imagens anteriores incluíam fundo preto e uma composição cortada. Foram substituídas por cubos completos gerados em chroma key, recortados para alpha e enquadrados como objetos independentes.
- [P1 corrigido] O cubo azul tinha faces misturadas. Ele agora deriva do mesmo render vermelho, com troca determinística vermelho→branco e branco→azul; todas as faces visíveis são uniformes.
- [P2 corrigido] O blur CSS sobre PNGs transparentes grandes causou conflito de composição com o texto em alguns enquadramentos. O blur foi incorporado aos arquivos e a revelação do título passou a usar uma máscara de texto estável.
- Evidência pós-correção: comparação `section2-before-after-qa.png`, captura wide 1906 × 954 e captura mobile 390 × 844.

## Validação técnica

- Build de produção concluído com sucesso.
- Console conferido sem erros ou avisos de runtime.
- Sem overflow horizontal em 1906 × 954 e 390 × 844.
- Alpha validado com cantos transparentes e bounding box do objeto dentro do canvas.

## Findings

- P0–P2: nenhum achado acionável restante.
- P3: nenhum bloqueador visual identificado.
