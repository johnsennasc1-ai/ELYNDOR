# ELYNDOR — As Cinzas de Valdora (Arco I)

RPG de ação em tempo real, jogável no navegador (celular e computador), com salas online e chat de texto.
Sem dependências: só precisa do Node 18+.

## Rodar no seu Mac (teste)
1. Instale o Node (https://nodejs.org) se ainda não tiver.
2. No Terminal: `cd elyndor-online` e `node server.js`
3. Abra http://localhost:3000 — para testar online, abra em duas abas com a mesma sala.

## Colocar no ar (GitHub + Render)
1. Crie um repositório novo no GitHub e envie **o conteúdo** desta pasta (server.js, package.json, render.yaml, public/).
2. No Render: **New → Web Service** → conecte o repositório.
   - Runtime: Node · Build Command: (deixe vazio ou `echo ok`) · Start Command: `node server.js`
   - (O arquivo render.yaml já traz essas configurações.)
3. Quando o deploy terminar, abra o link `https://SEU-APP.onrender.com`.
4. Na tela inicial, escolha nome e **sala**. Botão **Convidar** copia `https://SEU-APP.onrender.com/?sala=NOME` para os amigos entrarem sem conta e sem baixar nada.

Observação: no plano gratuito do Render o serviço "dorme" após inatividade; o primeiro acesso pode demorar ~1 minuto.

## Controles
- Mover: WASD / setas / joystick · Atacar: J ou Espaço / ⚔ · Habilidade elemental: K / ✦ (libera após o despertar) · Interagir: E · Chat: Enter

## Arte e animação
Os sprites vêm das suas artes 360° (pasta `public/assets/`): cada personagem e inimigo usa as 8 direções (frente, diagonais, lados, costas), animadas por código (andar, correr, golpe, magia, dano, queda). A arte pintada da folha de personagens aparece no menu inicial, no status/pausa (Esc ou ☰) e nos diálogos. O Sombroso aparece nas cutscenes.
Para trocar um sprite, substitua o PNG correspondente (8 quadros lado a lado) e ajuste `MAN` em `public/sprites.js`.

## Personagens (todos animados e jogáveis)
Kael (espada de fogo), Lyra (cura de água), Eldarion (arco de vento), Seraphine (sombra), Darius (escudo de terra), Thorin (martelo de metal).
Cada um tem andar, corrida, golpe, magia, dano e queda.

## Arco I expandido
Vila de Valdora → Noite dos Corrompidos → Campos de Valdora (4 monstros que renascem, para ganhar XP; 4 missões secundárias) → Santuário das Raízes (nível 4) → O Carrasco → escolha do cristal ou fragmento → epílogo com Auren e o Sombroso.

## Como o online funciona
Servidor de salas via SSE (até 8 jogadores por sala): posições, animações, ataques e chat são sincronizados.
Os inimigos e o progresso da história são simulados em cada jogador (cooperativo "lado a lado"). Uma versão com inimigos compartilhados é o próximo passo.

## Ajustes rápidos
`public/game.js` → objeto `BALANCE` (vida do chefe, custo e recarga das habilidades, dificuldade).
`public/story.js` → textos das cutscenes. `public/audio.js` → trilha e efeitos.
