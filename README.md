# ELYNDOR — As Correntes do Abismo (Arco I)

RPG de ação em tempo real com chefes por turnos, salas online e chat. Sem dependências: só precisa do Node 18+.

## Rodar no Mac (teste)
`cd elyndor-online && node server.js` → abra http://localhost:3000 (duas abas com a mesma sala testam o online).

## Colocar no ar (GitHub + Render)
1. Suba o **conteúdo** desta pasta para um repositório no GitHub (server.js, package.json, render.yaml, manifest... e a pasta `public`).
2. Render: **New → Web Service** → conecte o repositório → Start Command `node server.js` (o render.yaml já traz isso).
3. Link dos amigos: botão 🔗 do menu (☰) copia `https://SEU-APP.onrender.com/?sala=NOME`.
> Para atualizar: troque os arquivos no GitHub; o Render publica sozinho.

## Como jogar
- **Mover**: WASD/setas/joystick · **Atacar**: J/Espaço/⚔ (combo de 3 golpes) · **Habilidade** (nível 3): K/✦ · **Carregado**: R (a cada 10 ataques) · **Esquiva**: Shift/➤ · **Interagir**: E · **Menu**: Esc/☰ (tela cheia, som, chat, diário, dificuldade).
- **Chefes (turnos)**: cada chefe tem 2 comparsas bot. J atacar, K/T habilidade, R carregado, **R,T,R** (ou ⚔+✦ juntos no celular) especial em grupo, F defender, Q trocar alvo.
- **Online**: todos na mesma sala entram juntos na luta contra o chefe e agem no próprio turno. Bots completam o grupo.
- **Dificuldade**: Fácil / Médio / Difícil (tela inicial e menu de pausa).
- **Tela cheia no iPhone**: Compartilhar → Adicionar à Tela de Início.

## Estrutura do Arco I
Valdora (cap. 1–2) → Campos (XP e missões) → Floresta de Eryndor → Ruínas de Vhal'Tor → Prisão de Nhal'Zareth (5 andares) → Último andar (Carrasco, 4 fases) → Fuga → Epílogo.
9 chefes por turnos: Sinoqueiro, Matriarca das Raízes, Cavaleiro Sem Brasão, Aberração Cirúrgica, Vigia das Mil Vozes, Ferreiro das Correntes, Guardião do Selo, Guardas de Elite e O Carrasco.
Lyra é sequestrada no capítulo 2 e só volta no final (não selecionável).

## Ajustes rápidos
`public/game.js` → `BALANCE` e `DIFF` (vida/dano dos inimigos, XP). `public/battle.js` → `BOSSES` (vida, ataques e fases de cada chefe). `public/arc.js` → roteiro e passos da campanha.
