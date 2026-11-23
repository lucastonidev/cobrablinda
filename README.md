# 🐍 Cobra Blinda — Jogo da Cobra Estilo Nokia 3310

Jogo da cobrinha nostálgico, modular e retrô, construído com **HTML5 `<canvas>`**, **CSS Modular por Componentes** e **JavaScript Vanilla Estruturado (Core, Utils, Components)**.

---

## 📱 Destaques do Projeto

1. **Design Nokia 3310 Responsivo (Enquadrado em 100dvh)**:
   - Carcaça fiel com botões táteis projetada para caber perfeitamente no limite de `100dvh`, facilitando o toque em smartphones sem rolagem de tela.
   - **Modo Tela Cheia**: Opção dentro do menu de configurações do próprio celular que remove a carcaça e expande o display do LCD para 100% da tela do navegador, trazendo controles virtuais táteis ergonômicos na tela cheia.

2. **Dois Modos de Jogo**:
   - 🕹️ **Modo Clássico**: Paredes letais (bater = game over), 1 vida, velocidade progressiva e maçã retrô.
   - ⚡ **Modo Melhorado com Desafios**:
     - Atravessa as paredes (estilo portal Pac-Man).
     - **Bombas**: Surgem com pavio piscante no estilo Nokia retrô e detonam em área 3x3!
     - **Personagens Atiradores**: Inimigos inspirados em Space Impact do Nokia que surgem e atiram projéteis laser através da tela. Se a cobra for atingida pelo tiro ou colidir com o inimigo, perde vida!
     - **Vidas Extras**: Começa com 3 vidas (indicadas por corações `♥♥♥` no display LCD) e corações extras que aparecem na tela para recuperar vida.

3. **Arquitetura 100% Modular**:
   - **CSS dividido por componentes** (`css/components/`) para fácil manutenção.
   - **JavaScript organizado em camadas**:
     - `core/`: Configurações, máquina de estados e loop do jogo.
     - `utils/`: Síntese de áudio 8-bit monofônico e LocalStorage.
     - `components/`: Entidades independentes (Cobra, Comida, Bombas, Inimigos, Vidas, Renderizador Canvas, Controles e Configurações).

---

## 📂 Estrutura de Pastas

```
cobrablinda/
│
├── index.html                  # Estrutura HTML do Nokia 3310 e overlays
├── important.md                # Checklist de tarefas do projeto
├── README.md                   # Documentação do projeto
│
├── css/                        # 🎨 CSS Modular
│   ├── base.css                # Variáveis/Tokens de cores, reset e viewport 100dvh
│   ├── style.css               # Importador mestre de componentes
│   └── components/             # Componentes visuais
│       ├── phone.css           # Carcaça e proporções do celular em 100dvh
│       ├── screen.css          # Tela LCD, status bar, vidas, bateria e scanlines
│       ├── controls.css        # Teclado físico numérico e botões de ação
│       ├── overlays.css        # Menus LCD (Início, Configurações, Game Over, Pausa)
│       └── fullscreen.css      # Estilização do modo Tela Cheia sem carcaça
│
└── js/                         # ⚙️ JavaScript Modular
    ├── main.js                 # Ponto de inicialização da aplicação
    ├── core/                   # Núcleo da lógica do jogo
    │   ├── config.js           # Constantes de grid, velocidades e pontuação
    │   ├── state.js            # Enum dos estados da aplicação
    │   └── game.js             # Loop principal, máquina de estados e regras
    ├── utils/                  # Utilitários e helpers
    │   ├── audio.js            # Síntese sonora retrô (Web Audio API)
    │   └── storage.js          # Persistência de recordes e preferências
    └── components/             # Entidades e subsistemas visuais
        ├── snake.js            # Movimento, segmentos e colisão da cobra
        ├── food.js             # Comida normal e inseto bônus
        ├── bombs.js            # Bombas com pavio e explosão 3x3
        ├── enemies.js          # Inimigos atiradores e projéteis laser
        ├── lives.js            # Sistema de vidas extras e coleta de corações
        ├── canvas-renderer.js  # Renderizador gráfico monocromático no Canvas
        ├── controls.js         # Entradas de teclado, botões Nokia e touch
        └── settings.js         # Alternador de tela cheia e opções
```

---

## 🕹️ Controles e Atalhos

| Ação | Teclado do Computador | Celular Nokia Virtual | Tela Cheia / Gestos de Toque |
| :--- | :--- | :--- | :--- |
| **Mover** | Setas / `W A S D` | Teclas **`2`, `4`, `6`, `8`** | **Deslizar na tela (Swipe Touch)** |
| **Pausar / Continuar** | `Enter` / `Espaço` / `5` | **`5`** ou botão **`OK`** | Botão flutuante **`⏸ PAUSA`** |
| **Menu / Voltar** | `Esc` / `C` | Tecla **`C`** | Botão flutuante **`≡ MENU`** |
| **Alternar Modo** | `*` (Asterisco) | Tecla **`*` (MODO)** | Pelo Menu de Opções |
| **Ligar/Desligar Som** | `#` (Jogo da Velha) | Tecla **`#` (SOM)** | Pelo Menu de Opções |
| **Alternar Tela Cheia**| Tecla `F` | Menu: `3. CONFIG` | Botão `📱 MODO CELULAR` |
| **Gesto Arrastar (Swipe)** | N/A | Deslize no visor | Menu: `3. CONFIG` (LIG/DESL) |

---

## 🚀 Como Executar

```bash
# Servidor local via Python 3:
python3 -m http.server 8000

# Ou via npx serve:
npx serve .
```

Acesse **`http://localhost:8000`** no seu navegador!
