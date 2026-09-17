# Vertical Slice de Safael

Este documento define o padrão de produção para o percurso de referência:

`Cidade de Ilya -> Planícies de Safael -> Caverna Sombria -> Arena do Rei Slime Sombrio`

## Direção visual

- Resolução-base: `960 x 540`, escala inteira e `imageSmoothingEnabled = false`.
- Unidade de arte: tiles de `16 px`, renderizados em blocos pixelados consistentes.
- Proporções: jogador `32 x 46`, inimigo comum próximo de `28 x 34`, elite `34 x 42`, boss `42 x 54` ou maior quando a presença exigir.
- Paleta: teal/verde para mundo e magia, dourado para recompensa e interação, vermelho controlado para dano e perigo, sombra azul-marinho para profundidade.
- Contorno: silhueta clara, sombra plana no chão e alto contraste entre entidade, cenário e VFX.
- Camadas: mapa, objetos distantes, chão, objetos, entidades, foreground, VFX e UI.
- Iluminação: Cidade acolhedora, Planícies abertas e legíveis, Caverna escura com tochas/cristais/altar como pontos de orientação.

## Personagens e animação

- Player e NPCs usam o mesmo pipeline de sprites e escala de referência.
- Slime de Safael possui estados visuais de idle, movimento, ataque, hurt e morte; squash/stretch é aplicado durante a leitura em jogo.
- Boss possui porte maior, aura própria, entrada curta, barra de vida, fases e telegraph.
- Sprite acompanha o jogador, flutua e apresenta coleta/recompensa sem interromper o fluxo.

## Combate

- Espada: ataque corpo a corpo em arco, antecipação, impacto, partículas e reação de dano.
- Arco: animação de puxar, flecha como projectile real, trilha e impacto no alvo.
- Cajado: cast, projétil mágico, brilho, trilha e impacto mágico.
- Dano sempre comunica número, hit flash, partículas e pequena resposta temporal/câmera.
- Ataques especiais do Rei Slime usam área visível, atraso curto e leitura clara antes do dano.

## Ambientes

- Cidade: praça central, comércio, área de quests, fonte, casas/props e saída pela estrada leste.
- Planícies: caminhos abertos, árvores, flores, altar, ruína, baú e pontos de composição sem preencher todo o espaço.
- Caverna: entrada, salas compactas, corredor, cristais, tochas, altar e transição para a arena.
- Arena: composição circular, quatro pontos de luz, espaço de movimentação e boss central.

## Progressão

1. Guia de Ilya oferece `Problemas nas Planícies`.
2. O jogador derrota Slimes de Safael e coleta Núcleos de Safael.
3. Ao entregar a missão, a passagem da Caverna Sombria fica disponível.
4. Entrar na caverna conclui `A entrada da caverna` e ativa automaticamente `O Rei Slime Sombrio`.
5. O Rei Slime possui duas mudanças de fase visuais e entrega uma recompensa épica.
6. Flags e quest state são persistidos com a versão de save atual do slice.

## UI e feedback

- Tracker de quest compacto no canto superior esquerdo.
- Barra do boss entra com animação e permanece no topo central durante o encontro.
- Drops usam cor de raridade, brilho, bounce, forma própria e efeito de pickup.
- HUD mantém HP, MP, EXP, skills e cooldowns sem cobrir o campo de batalha.

## Critério de aprovação

O percurso deve ser jogável do início ao fim sem depender de outras regiões: aceitar missão, explorar, lutar com as três armas, coletar loot, usar o Sprite, retornar, liberar a caverna, atravessar a dungeon, enfrentar as fases do boss e receber a recompensa. Novos mapas, inimigos e equipamentos devem reutilizar estas mesmas regras antes de aumentar quantidade de conteúdo.
