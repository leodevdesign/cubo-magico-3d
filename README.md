# 🎲 Cubo Mágico 3D — Real-Time WebGL Experience

[![Three.js](https://img.shields.io/badge/Three.js-r180-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-green?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-990000?style=for-the-badge&logo=webgl)](https://www.khronos.org/webgl/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> Uma experiência web interativa, cinematográfica e de alta fidelidade que recria o icônico Cubo de Rubik diretamente no navegador com renderização 3D em tempo real, física de rotação por raycasting, animações fluidas baseadas em scroll e zero assets estáticos de imagem para os cubos.

🔗 **Demonstração Online:** [projetos.nextautomatik.com/cubo-magico-3d](https://projetos.nextautomatik.com/cubo-magico-3d)

---

## 🌟 Visão Geral

O projeto **Cubo Mágico 3D** une engenharia criativa de front-end (*Creative Development*), computação gráfica procedural em WebGL e design editorial moderno. Ele vai muito além de um simples modelo estático em 3D: é um **simulador jogável e completo** do Cubo de Rubik com suporte à notação oficial de speedcubing, integrado a uma narrativa histórica com animações coordenadas via GSAP ScrollTrigger.

---

## 💡 A Origem: Da Imagem 2D ao Modelo 3D em Tempo Real

A gênese deste projeto partiu de um desafio visual real: **uma imagem estática de referência** apresentando um cubo mágico estilizado.

Inicialmente, páginas de demonstração costumam utilizar renders pré-gerados em PNG com fundos recortados. No entanto, essa abordagem apresenta severas limitações:
1. **Falta de Interatividade:** O usuário não pode tocar, girar, inspecionar nem jogar com o objeto.
2. **Problemas de Fidelidade Visual:** Artefatos de compressão, halos de chroma key em fundos escuros e distorções em telas de alta densidade (Retina/DPI alto).
3. **Inconsistência de Cores:** Imagens estáticas não respondem à luz da cena nem mantêm coerência espacial entre seções.

### 🔄 O Processo de Transformação:
Em vez de depender de imagens pesadas ou arquivos 3D monolíticos (como `.gltf`/`.obj` de dezenas de megabytes), **o cubo foi construído e programado 100% via código procedural em Three.js**:

1. **Geometria Procedural com Chanfros Reais:** Criação dos 27 cubinhos (*cubies*) utilizando `RoundedBoxGeometry`, calculando chanfros orgânicos nas arestas e vértices para simular a manufatura plástica real.
2. **Adesivos com Materiais Físicos (PBR):** Aplicação de `MeshPhysicalMaterial` com propriedades calibradas de rugosidade (*roughness*), índice de refração e camada de verniz reflexivo (*clearcoat*), reagindo a múltiplas fontes de luz (Key Light, Rim Light, Fill Light e sombras suaves com `PCFSoftShadowMap`).
3. **Eliminação de Assets:** Todas as imagens estáticas das seções foram substituídas pelos próprios cubos 3D instanciados programaticamente, reduzindo o peso do pacote em mais de 4 MB e garantindo nitidez vetorial infinita em qualquer resolução.

---

## 🎮 Funcionalidades e Mecânicas

### 🕹️ Simulador de Cubo Mágico 100% Jogável
- **Interação Natural por Toque e Arraste (Raycasting Vetorial):** O usuário clica em qualquer peça e a arrasta na direção desejada. O motor calcula a projeção do vetor de arraste no plano da câmera, determina a normal da face atingida e rotaciona exatamente a camada correspondente no espaço tridimensional.
- **Dois Modos de Câmera:**
  - **Mover Peças:** Foco nas rotações de camadas do cubo.
  - **Explorar Cubo (Giro Livre 360°):** Rotação orbital esférica da câmera para inspecionar todas as 6 faces em qualquer ângulo, com suporte multitoque (pinch/pan no celular).
- **Atalhos e Notação Oficial de Speedcubing:**
  - Camadas externas: `R` (Right), `L` (Left), `U` (Up), `D` (Down), `F` (Front), `B` (Back).
  - Fatias centrais: `M` (Middle), `E` (Equatorial), `S` (Standing).
  - Inversão anti-horária: `Shift + tecla` (ex: `R'`, `U'`).
- **Métricas e Controles:**
  - **Embaralhar (`H`):** Gera sequências válidas de 24 movimentos pseudoaleatórios e dispara o cronômetro.
  - **Desfazer (`Z` / `Ctrl+Z`):** Reverte o último movimento manual na pilha de estados.
  - **Auto-Solver (`C`):** Resolve passo a passo o cubo de volta ao estado montado com animações suaves de desbobinamento.
  - **Histórico de Movimentos:** Log visual em tempo real com chips indicando cada notação executada.

---

## 📖 Narrativa Editorial e Seções 3D

O site é dividido em três atos principais harmonizados por scroll suave (*ScrollSmoother*):

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Hero / Estágio Interativo (Cubo 1)                       │
│    Simulador 3D jogável com iluminação e controles          │
├─────────────────────────────────────────────────────────────┤
│ 2. Seção Editorial: "Em 1974..." (Cubos 2 e 3)              │
│    Tipografia revelada por scroll + 2 cubos 3D sincronizados│
│    - Cubo Esquerdo: Face AZUL virada para o observador       │
│    - Cubo Direito:  Face VERMELHA virada para o observador  │
├─────────────────────────────────────────────────────────────┤
│ 3. Seção Final & CTA (Cubo Final)                           │
│    Cubo volumétrico emoldurado com física de midpoint       │
└─────────────────────────────────────────────────────────────┘
```

- **Seção Editorial (História de Ernő Rubik):**
  - Conta a origem do quebra-cabeça concebido pelo professor húngaro Ernő Rubik para ensinar tridimensionalidade.
  - Dois cubos 3D entram dinamicamente a partir das bordas laterais conforme o scroll avança.
  - O cubo da esquerda exibe a face **azul** voltada para frente, enquanto o da direita exibe a face **vermelha**, ambos com leve rotação 3D e flutuação orgânica (*idle floating*).
- **Preloader 3D Cinematográfico:**
  - Tela de carregamento com cubo 3D giratório e contador percentual sincronizado com a inicialização dos shaders WebGL e fontes.

---

## 📐 Engenharia, Matemática e Performance

Desenvolver experiências 3D pesadas em navegadores exige rigorosa disciplina de engenharia para atingir **60+ FPS contínuos** em qualquer dispositivo:

1. **Cálculo Dinâmico de Frustum:**
   Para garantir que os cubos nunca cubram textos vitais e permaneçam com dimensões harmônicas tanto em telas UltraWide (21:9) quanto em smartphones verticais (9:19.5), a aplicação calcula em tempo real o campo de visão:
   $$\text{frustumHeight} = 2 \times \tan\left(\frac{\text{FOV}}{2}\right) \times \text{distância}$$
   $$\text{frustumWidth} = \text{frustumHeight} \times \text{aspectRatio}$$
2. **Ciclo de Renderização sob Demanda (`IntersectionObserver`):**
   Os contextos secundários do Three.js pausam seu loop de renderização quando as seções correspondentes saem do campo de visão do usuário, liberando ciclos de GPU.
3. **Reutilização de Geometrias e Materiais:**
   Todos os cubos compartilham as mesmas instâncias de `RoundedBoxGeometry` e `MeshPhysicalMaterial`, minimizando alocações de memória e chamadas de desenho (*draw calls*).
4. **Layout Empilhado Inteligente (*Midpoint Measuring*):**
   Em dispositivos móveis, o código mede dinamicamente o bounding box e a altura do viewport para readequar a altura do canvas 3D sem quebras de layout.
5. **Acessibilidade e Preferência de Movimento:**
   Suporte completo a `prefers-reduced-motion`: as animações de scroll aceleram ou estabilizam em posições estáticas de repouso caso o usuário tenha sensibilidade a movimento configurada no sistema operacional.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|---|---|---|
| **Computação Gráfica** | [Three.js (r180)](https://threejs.org/) | Renderização WebGL, iluminação PBR, sombras, raycasting e câmeras |
| **Geometrias** | `RoundedBoxGeometry` | Criação procedural de cubos e adesivos com arestas chanfradas |
| **Animações de Scroll** | [GSAP](https://greensock.com/) + ScrollTrigger + ScrollSmoother | Sincronização entre scroll da página e transformações 3D |
| **Bundler / Build Tool** | [Vite 7](https://vitejs.dev/) | HMR instantâneo, minificação Rollup e build otimizado |
| **Tipografia & Estilos** | CSS3 Moderno (Grid, Flex, Variáveis) | Layout responsivo, modo escuro `#08090b` e fontes *Space Grotesk* e *DM Sans* |
| **Qualidade & Testes** | Playwright E2E | Inspeção visual cross-device, testes de regressão e validação de 60 FPS |

---

## 📂 Arquitetura do Repositório: Dual Distribution

O projeto oferece **duas distribuições completas**:

```
cubo-magico/
├── index.html                 # Ponto de entrada da versão Vite (ESM moderno)
├── vite.config.js             # Configurações do Vite (base relativa para deploy)
├── package.json               # Dependências e scripts
├── src/
│   ├── main.js                # Lógica central (Three.js, GSAP, Raycasting, Áudio/Timer)
│   └── styles.css             # Estilização completa e responsividade
│
├── cubo-magico-cdn/           # 🚀 VERSÃO ZERO-BUILD / 100% CDN
│   ├── index.html             # Importmap nativo com jsDelivr (Three.js + GSAP)
│   ├── favicon.svg            # Favicon vetorial
│   ├── assets/                # Assets sociais (OG Image)
│   └── src/
│       ├── main.js            # Módulo JavaScript autônomo
│       └── styles.css         # Folha de estilo autônoma
│
└── assets/                    # Imagens de referência e identidade visual
```

> **Por que duas versões?**
> - **Versão Vite:** Ideal para fluxos modernos de CI/CD, integração em frameworks e empacotamento com tree-shaking.
> - **Versão CDN (`cubo-magico-cdn/`):** Utiliza `<script type="importmap">` dos navegadores modernos. Pode ser aberta com dois cliques em qualquer navegador ou hospedada em qualquer servidor estático tradicional sem necessidade de `node_modules` ou processo de build.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior instalado
- Git

### 1. Clonar o Repositório
```bash
git clone https://github.com/leodevdesign/cubo-magico-3d.git
cd cubo-magico-3d
```

### 2. Rodar a Versão Vite (Desenvolvimento)
```bash
# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse a URL exibida no terminal (normalmente `http://localhost:5173/`).

### 3. Gerar Build de Produção
```bash
npm run build
npm run preview
```

### 4. Rodar a Versão CDN (Zero Build)
Você pode simplesmente servir a pasta `cubo-magico-cdn/` com qualquer servidor local:
```bash
npx serve cubo-magico-cdn
# ou simplesmente abrir o arquivo index.html no navegador via Live Server
```

---

## ⌨️ Guia de Teclas e Controles

| Tecla | Ação |
|:---:|---|
| <kbd>R</kbd> / <kbd>L</kbd> | Girar camada Direita (*Right*) / Esquerda (*Left*) |
| <kbd>U</kbd> / <kbd>D</kbd> | Girar camada Superior (*Up*) / Inferior (*Down*) |
| <kbd>F</kbd> / <kbd>B</kbd> | Girar camada Frontal (*Front*) / Traseira (*Back*) |
| <kbd>M</kbd> / <kbd>E</kbd> / <kbd>S</kbd> | Girar fatias centrais (*Middle*, *Equatorial*, *Standing*) |
| <kbd>Shift</kbd> + Tecla | Inverte o sentido da rotação (giro anti-horário) |
| <kbd>V</kbd> | Alternar entre o modo **Mover peças** e **Explorar cubo (360°)** |
| <kbd>H</kbd> | **Embaralhar** o cubo com algoritmo aleatório |
| <kbd>Z</kbd> ou <kbd>Ctrl+Z</kbd> | **Desfazer** o último movimento |
| <kbd>C</kbd> | **Concluir** (resolver automaticamente) |

---

## 👨‍💻 Autor e Créditos

Desenvolvido com foco em excelência criativa e rigor técnico por:

- **Leonardo / Next Automatik**
- **Website:** [nextautomatik.com](https://nextautomatik.com)
- **GitHub:** [@leodevdesign](https://github.com/leodevdesign)

---

<p align="center">
  <b>GIRE. EXPLORE. RESOLVA.</b><br>
  <sub>Distribuído sob a licença MIT.</sub>
</p>
