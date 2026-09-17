# Art Bible - Fundação Visual do Projeto

## 1. Auditoria visual do projeto

Antes da implementação da fundação artística, os principais pontos de inconsistência observados foram:

- o canvas era renderizado diretamente no tamanho da janela, sem resolução lógica;
- os sprites existentes são gerados em tamanhos que variam por contexto e não seguem uma regra única de proporção;
- a escala visual era dependente do tamanho de janela em vez de uma base fixa;
- o player, NPCs, inimigos e VFX não compartilhavam uma mesma linguagem de massa e silhueta;
- efeitos visuais eram mais genéricos do que os personagens e cenários;
- a HUD e o jogo não tinham uma identidade visual coerente com o universo do RPG;
- o render estava funcional, mas não estava preparado para pixel perfect e para pipeline visual consistente.

A correção desta etapa foi estrutural e não estética superficial: o projeto precisa primeiro estabelecer escala, proporção, paleta e pipeline de render.

## 2. Art Bible interna

### Palette

- primária: #81e3cd (verde-água)
- secundária: #f4c96a (ouro quente)
- destaque: #80a8ff (azul mágico)
- sombra: #101922 (preto azulado)
- realce: #f8f4d7 (creme)
- solo: #3b5a4d (verde profundo)
- pedra: #6b7a86 (cinza azulado)
- madeira: #8f6347 (marrom quente)
- dungeon: #4b4456 (roxo escuro)
- interface: #d5b36d (dourado antigo)

### Pixel art

- densidade visual: alta;
- contorno: definido e legível;
- detalhes: moderados; silhueta clara é prioridade;
- sombras: planas em 2 a 3 tons;
- contraste: forte em personagens e VFX, mais suave em ambiente;
- simplificação: manter leitura clara mesmo em impressão mínima.

### Proporções

- player: mais alto e mais legível que o inimigo comum;
- NPC: ligeiramente menor;
- inimigo comum: compacto e agressivo;
- elite: maior massa e presença visual;
- boss: maior que o player e com elementos dominantes;
- sprite: menor, leve e aéreo;
- objetos: sempre legíveis e sem exagero de tamanho;
- armas: sempre reconhecíveis e proporcionalmente equilibradas.

## 3. Escala global

A base visual foi definida em:

- tile size: 16px lógico;
- resolução base: 960x540;
- player: 32x46;
- NPC: 26x34;
- inimigo comum: 28x34;
- elite: 34x42;
- boss: 42x54;
- sprite: 30x34;
- VFX: raio base de 12px.

Esses valores foram escolhidos para manter legibilidade, interação clara, efeito visual agradável e escala coerente entre personagens, objetos e ambiente.

## 4. Resolução base e pixel perfect

O jogo agora segue uma resolução lógica base e renderiza com a estratégia de pixel perfect:

- renderização lógica: 960x540;
- escala da tela: a canvas é redimensionada pela CSS para o viewport;
- imagem sem suavização: imageSmoothingEnabled = false;
- estratégia: escala inteira e viewport estável;
- objetivo: manter nitidez sem bordas borradas.

## 5. Sistema de assets

A estrutura de produção visual foi organizada para seguir uma pipeline reutilizável:

- characters
- enemies
- weapons
- tiles
- environment
- props
- vfx
- ui
- icons

A implementação central do projeto passa a respeitar cache por asset id e evita duplicação por imagem.

## 6. Sistema de spritesheets e animações

A base de spritesheets já existente foi preservada, mas passou a ser melhor organizada como série de dados reusáveis por asset, com nomes de estados e estrutura de tomada de frames.

Cada entidade continua usando a sua própria sequência de animação, mas o sistema ficou mais consistente para expansão futura.

## 7. Eventos de animação

A base do combat já estava funcionando com eventos de animação, e a estrutura visual foi alinhada com isso. Esse fluxo agora é coerente com a ideia de:

- preparação
- ação
- impacto
- recuperação

## 8. Render em camadas

A ordem visual foi definida da seguinte forma:

1. background
2. distant decor
3. ground
4. objects
5. entities
6. foreground
7. vfx
8. ui

Isso mantém leitura clara e cria profundidade sem quebrar o gameplay.

## 9. Debug visual

Foi adicionado um modo de debug visual desligável para avaliação de:

- hitboxes;
- anchor points;
- posição de entidades;
- sincronização visual.

O modo pode ser habilitado com F1.

## 10. Checklist de qualidade

Antes de um asset ser aceito, o projeto agora considera:

- escala correta;
- resolução correta;
- pixel perfect;
- paleta consistente;
- sombra consistente;
- iluminação consistente;
- contorno consistente;
- animação consistente;
- proporção correta;
- layer correto;
- legibilidade;
- integração correta.

## 11. Resultado desta fase

A fundação artística foi estruturada sem quebrar os sistemas existentes e sem criar conteúdo desnecessário. O projeto ganhou:

- Art Bible interna;
- escala visual definida;
- resolução lógica base;
- pixel-perfect rendering;
- AssetManager central;
- config visual reutilizável;
- debug visual;
- pipeline pronto para expansão com assets novos.

Este é o ponto inicial de uma identidade visual coerente para o universo do jogo.
