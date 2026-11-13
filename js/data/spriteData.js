// Definições de Categorias, Personalidades, Árvore de Habilidades e Alimentos dos Sprites
// Inspirado na rica experiência de MMORPGs como Grand Fantasia.

export const SPRITE_CATEGORIES = Object.freeze({
  minerador: {
    id: 'minerador',
    name: 'Minerador',
    title: 'Mestre da Terra e Minérios',
    icon: '⛏️',
    color: '#e7b65c',
    glowColor: 'rgba(231, 182, 92, 0.45)',
    description: 'Especialista em escavação subterrânea e pedras preciosas. Coleta minérios com maior rendimento e descobre veios raros.',
    preferredGather: 'minerals',
    baseBonus: {
      gatherBonus: { minerals: 1.35 },
      craftBonus: { weaponAtk: 0.08 }
    },
    exclusiveSkill: {
      id: 'fissura_dourada',
      name: 'Fissura Dourada',
      desc: 'Chance de encontrar pepitas de ouro puro e gemas em cada coleta de minério.',
      icon: '💎'
    }
  },
  silvestre: {
    id: 'silvestre',
    name: 'Silvestre',
    title: 'Guardião dos Bosques e Madeiras',
    icon: '🪵',
    color: '#5ea86b',
    glowColor: 'rgba(94, 168, 107, 0.45)',
    description: 'Espírito vivo da floresta com afinidade por carvalhos e madeiras ancestrais. Coleta recursos da mata com destreza inigualável.',
    preferredGather: 'wood',
    baseBonus: {
      gatherBonus: { wood: 1.35 },
      gatherSpeed: 0.15
    },
    exclusiveSkill: {
      id: 'bênção_da_floresta',
      name: 'Bênção da Floresta',
      desc: 'Reduz o consumo de energia ao coletar na natureza e ocasionalmente acha frutas silvestres.',
      icon: '🍃'
    }
  },
  herbalista: {
    id: 'herbalista',
    name: 'Herbalista',
    title: 'Alquimista Botânico',
    icon: '🌿',
    color: '#9e6bc9',
    glowColor: 'rgba(158, 107, 201, 0.45)',
    description: 'Conhecedor de cada folha, seiva e raiz de Safael. Suas colheitas de ervas produzem elixires e restauram a saúde do mestre.',
    preferredGather: 'herbs',
    baseBonus: {
      gatherBonus: { herbs: 1.35 },
      healAura: 2
    },
    exclusiveSkill: {
      id: 'balsamo_restaurador',
      name: 'Bálsamo Restaurador',
      desc: 'Cura o jogador automaticamente com 75 HP se sua vida cair abaixo de 35% durante o combate.',
      icon: '🧪'
    }
  },
  artifice: {
    id: 'artifice',
    name: 'Artífice',
    title: 'Ferreiro Rúnico dos Sprites',
    icon: '🔨',
    color: '#e27276',
    glowColor: 'rgba(226, 114, 118, 0.45)',
    description: 'Herdeiro do fogo elemental e da manufatura sagrada. Aumenta dramaticamente a chance de forjar equipamentos Raros e Épicos.',
    preferredGather: 'minerals',
    baseBonus: {
      craftRareChance: 0.18,
      craftEpicChance: 0.10,
      craftCostReduction: 1
    },
    exclusiveSkill: {
      id: 'chama_sagrada',
      name: 'Chama da Forja',
      desc: 'Concede +10% de dano adicional e 5% de crítico aos golpes do mestre.',
      icon: '🔥'
    }
  },
  astral: {
    id: 'astral',
    name: 'Guardião Astral',
    title: 'Protetor das Estrelas',
    icon: '✦',
    color: '#78f3e3',
    glowColor: 'rgba(120, 243, 227, 0.45)',
    description: 'Sprite de linhagem nobre com aura estelar. É o companheiro definitivo de combate, fortalecendo a vida, a mana e a defesa do mestre.',
    preferredGather: 'any',
    baseBonus: {
      companionHp: 0.15,
      companionMp: 0.15,
      companionDef: 6
    },
    exclusiveSkill: {
      id: 'escudo_celestial',
      name: 'Escudo Celestial',
      desc: 'Cria uma barreira de luz astral que absorve 40 pontos de dano a cada 30 segundos.',
      icon: '🛡️'
    }
  }
});

export const SPRITE_PERSONALITIES = Object.freeze({
  trabalhador: {
    id: 'trabalhador',
    name: 'Trabalhador',
    icon: '💪',
    description: 'Ama o dever cumprido. Gasta 20% menos energia em tarefas e ganha +30% de amizade ao concluir expedições.',
    energyCostMultiplier: 0.8,
    friendshipTaskBonus: 1.3,
    dialogues: {
      idle: ['Mestre, estou pronto para o próximo trabalho!', 'Um dia sem produzir é um dia desperdiçado!', 'Minhas asinhas estão aquecidas para mais uma tarefa!'],
      gather: ['Deixe comigo! Vou trazer os melhores materiais da região!', 'Vou cavar mais fundo do que qualquer outro!'],
      craft: ['O metal canta quando o martelo bate certo!', 'Essa peça vai ficar magnífica, mestre!'],
      feed: ['Uma refeição deliciosa para recarregar minhas forças! Obrigado!', 'Com essa energia, posso trabalhar o dia todo!'],
      pet: ['Hehe, obrigado pelo carinho mestre! Pode contar comigo sempre!', 'Vou me esforçar ainda mais por você!'],
      tired: ['Ufa... até eu preciso recuperar o fôlego um pouquinho...']
    }
  },
  curioso: {
    id: 'curioso',
    name: 'Curioso',
    icon: '🔍',
    description: 'Fascinado por mistérios e tesouros. Possui +25% de chance de encontrar materiais raros e itens especiais.',
    rareFindBonus: 0.25,
    dialogues: {
      idle: ['O que será que há além daquela colina?', 'Mestre, você viu aquele brilho estranho no chão?', 'Sinto cheiro de tesouro escondido no ar!'],
      gather: ['Vou explorar cada cantinho misterioso dessa rota!', 'Quem procura acha... e eu sempre acho coisas raras!'],
      craft: ['E se colocarmos uma pitada daquele minério esquisito?', 'Olha que formato curioso essa lâmina ganhou!'],
      feed: ['Hmmm! Que sabor exótico! Do que é feito esse biscoito?', 'Adoro experimentar sabores novos!'],
      pet: ['Gostei disso! O que acontece se você fizer cócegas aqui?', 'Você é a pessoa mais legal de toda Safael!'],
      tired: ['Minhas pálpebras estão pesadas... mas ainda quero ver o que tem ali... zzz...']
    }
  },
  glutao: {
    id: 'glutao',
    name: 'Alegre e Glutão',
    icon: '🍰',
    description: 'Ama banquetes e guloseimas. Recupera +50% de energia ao se alimentar e ganha amizade em dobro com comida.',
    feedEnergyBonus: 1.5,
    friendshipFeedBonus: 2.0,
    dialogues: {
      idle: ['A que horas é o lanchinho da tarde, mestre?', 'Minha barriguinha está roncando... mas meu coração está feliz!', 'Se encontrar frutas no caminho, não se esqueça de mim!'],
      gather: ['Vou coletar rapidinho para poder comer logo depois!', 'Espero encontrar um arbusto cheio de amoras doces!'],
      craft: ['Trabalhar na forja me dá uma fome danada!', 'Esse calor do fogo daria um belo forno para tortas!'],
      feed: ['NHAM NHAM NHAM! Isso estava divino, mestre!', 'Mais um pedacinho, por favorzinho?! Te amo! ❤️'],
      pet: ['Aaaahh, que delícia de carinho... quase tão bom quanto bolo!', 'Você é o melhor mestre do universo!'],
      tired: ['Barriguinha cheia, coração quentinho... hora do soninho da tarde... zzz...']
    }
  },
  corajoso: {
    id: 'corajoso',
    name: 'Corajoso',
    icon: '⚔️',
    description: 'Espírito guerreiro destemido. Concede +6 de Ataque e +3 de Defesa adicionais ao mestre durante as batalhas.',
    combatAtkBonus: 6,
    combatDefBonus: 3,
    dialogues: {
      idle: ['Nenhum monstro de Safael vai encostar em você enquanto eu viver!', 'Espada em punho, mestre! A vitória é nossa!', 'O perigo só torna a jornada mais emocionante!'],
      gather: ['Vou desbravar até as terras mais perigosas para trazer os itens!', 'Nenhum lobo me assusta!'],
      craft: ['Essa arma precisa ser firme e cortar o próprio vento!', 'Forjada com o fogo da coragem!'],
      feed: ['Comida de guerreiro! Meus músculos de fada estão estalando!', 'Obrigado pela provisão, comandante!'],
      pet: ['E-ei! Guerreiros não recebem cócegas... bem, talvez só um pouquinho...', 'Estarei sempre protegendo a sua retaguarda!'],
      tired: ['Uma pausa tática para afiar os sentidos... logo estarei pronto para a luta!']
    }
  },
  perfeccionista: {
    id: 'perfeccionista',
    name: 'Perfeccionista',
    icon: '✨',
    description: 'Busca a perfeição absoluta. Concede +20% de chance de qualidade Rara/Épica na forja de armas e itens.',
    craftQualityBonus: 0.20,
    dialogues: {
      idle: ['Tudo deve estar exatamente no seu devido lugar.', 'Perfeição não é um acidente, mestre, é um hábito.', 'Observe o alinhamento das minhas asinhas: impecável!'],
      gather: ['Apenas os minérios e madeiras mais puros merecem a nossa bolsa!', 'Qualidade sempre acima da quantidade.'],
      craft: ['Calma... mais um milímetro de pressão... e... PERFEITO!', 'Uma obra-prima digna dos salões reais de Ilya!'],
      feed: ['A apresentação deste prato está impecável e o sabor sublime.', 'Nutrientes balanceados para um desempenho exemplar.'],
      pet: ['Sua técnica de afago é bastante satisfatória e refinada.', 'Obrigado, mestre. Aprecio seu apreço pelo meu trabalho.'],
      tired: ['Mesmo a mente mais brilhante necessita de recalibração neural... zzz.']
    }
  },
  sereno: {
    id: 'sereno',
    name: 'Sereno',
    icon: '🕊️',
    description: 'Paz interior inabalável. Recupera energia 50% mais rápido ao descansar e seu humor nunca cai para estressado.',
    restRegenBonus: 1.5,
    dialogues: {
      idle: ['Respire fundo, mestre. O mundo conspira a nosso favor.', 'A calma da água vence a dureza da pedra.', 'Sinta a brisa suave de Safael... paz em cada passo.'],
      gather: ['A natureza nos presenteia de bom grado quando pedimos com respeito.', 'Coletando em harmonia com a floresta.'],
      craft: ['Que cada golpe seja focado e livre de afobação.', 'A harmonia da criação reflete a calma da alma.'],
      feed: ['Agradeço pelo sustento simples e generoso.', 'Que esta energia traga luz para o nosso caminho.'],
      pet: ['Um toque de gentileza aquece a alma. Muita paz para você, mestre.', 'Nossa amizade é como um rio tranquilo que nunca seca.'],
      tired: ['Entrando em meditação profunda... a paz me restaura... zzz...']
    }
  }
});

export const SPRITE_SKILL_TREE = Object.freeze({
  coletor: {
    id: 'coletor',
    name: 'Especialização: Coletor',
    icon: '⛏️',
    description: 'Amplia a eficiência, velocidade e volume de recursos coletados pelo Sprite.',
    skills: [
      {
        id: 'colheita_abundante_1',
        name: 'Colheita Abundante I',
        tier: 1,
        maxLevel: 3,
        cost: 1,
        desc: 'Aumenta a quantidade de materiais obtidos em +1 por nível.',
        effect: (lvl) => ({ extraYield: lvl })
      },
      {
        id: 'passo_ligeiro_1',
        name: 'Passo Ligeiro',
        tier: 2,
        requires: 'colheita_abundante_1',
        maxLevel: 2,
        cost: 1,
        desc: 'Reduz o tempo de viagem e coleta em 15% por nível.',
        effect: (lvl) => ({ speedMult: 1 - lvl * 0.15 })
      },
      {
        id: 'toque_da_terra',
        name: 'Toque da Terra',
        tier: 3,
        requires: 'passo_ligeiro_1',
        maxLevel: 2,
        cost: 2,
        desc: 'Concede 20% de chance por nível de obter o dobro dos recursos coletados.',
        effect: (lvl) => ({ doubleHarvestChance: lvl * 0.20 })
      },
      {
        id: 'mestre_coletor',
        name: 'Mestre da Colheita',
        tier: 4,
        requires: 'toque_da_terra',
        maxLevel: 1,
        cost: 3,
        desc: 'Aumenta em +3 todos os recursos coletados e recupera 10 de energia após cada expedição concluída.',
        effect: () => ({ extraYield: 3, energyRefund: 10, masterBonus: 0.35 })
      }
    ]
  },
  explorador: {
    id: 'explorador',
    name: 'Especialização: Explorador',
    icon: '🧭',
    description: 'Aumenta a chance de encontrar materiais raros, tesouros, gemas e drops preciosos.',
    skills: [
      {
        id: 'olhos_de_aguia',
        name: 'Olhos de Águia',
        tier: 1,
        maxLevel: 3,
        cost: 1,
        desc: 'Aumenta a chance de drops raros de monstros derrotados em +10% por nível.',
        effect: (lvl) => ({ lootRareBonus: lvl * 0.10 })
      },
      {
        id: 'radar_de_tesouro',
        name: 'Faro de Tesouros',
        tier: 2,
        requires: 'olhos_de_aguia',
        maxLevel: 2,
        cost: 1,
        desc: '15% de chance por nível do Sprite voltar de expedições trazendo ouro bônus (10-30g).',
        effect: (lvl) => ({ bonusGoldChance: lvl * 0.15 })
      },
      {
        id: 'instinto_raro',
        name: 'Instinto Raro',
        tier: 3,
        requires: 'radar_de_tesouro',
        maxLevel: 2,
        cost: 2,
        desc: '25% de chance por nível de encontrar materiais nobres (Cristais Mágicos e Gemas de Safael).',
        effect: (lvl) => ({ rareMatChance: lvl * 0.25 })
      },
      {
        id: 'cacador_lendario',
        name: 'Explorador Lendário',
        tier: 4,
        requires: 'instinto_raro',
        maxLevel: 1,
        cost: 3,
        desc: 'Monstros derrotados concedem +35% de Ouro e +20% de chance de equipamentos de alta raridade.',
        effect: () => ({ playerGoldMult: 0.35, highRarityDropBonus: 0.20 })
      }
    ]
  },
  artesao: {
    id: 'artesao',
    name: 'Especialização: Artesão',
    icon: '🔨',
    description: 'Aprimora a criação de equipamentos, economiza materiais e melhora os atributos dos itens forjados.',
    skills: [
      {
        id: 'economia_magica',
        name: 'Economia Rúnica',
        tier: 1,
        maxLevel: 3,
        cost: 1,
        desc: '15% de chance por nível de não consumir recursos ao criar equipamentos.',
        effect: (lvl) => ({ saveMaterialChance: lvl * 0.15 })
      },
      {
        id: 'forja_refinada',
        name: 'Forja Refinada',
        tier: 2,
        requires: 'economia_magica',
        maxLevel: 2,
        cost: 1,
        desc: 'Aumenta em +15% por nível a chance de itens criados virem na raridade Rara.',
        effect: (lvl) => ({ craftRareChance: lvl * 0.15 })
      },
      {
        id: 'martelo_do_artifice',
        name: 'Martelo do Artífice',
        tier: 3,
        requires: 'forja_refinada',
        maxLevel: 2,
        cost: 2,
        desc: 'Aumenta em +10% por nível a chance de itens Épicos e concede +15% de Atk bônus ao item.',
        effect: (lvl) => ({ craftEpicChance: lvl * 0.10, craftBonusAtk: lvl * 0.15 })
      },
      {
        id: 'obra_prima_celestial',
        name: 'Obra-Prima Celestial',
        tier: 4,
        requires: 'martelo_do_artifice',
        maxLevel: 1,
        cost: 3,
        desc: 'Garante que todo item criado tenha multiplicador de atributos aumentado em +25% e possa nascer com encanto estelar.',
        effect: () => ({ masterCraftMult: 0.25, stellarEnchant: true })
      }
    ]
  },
  companheiro: {
    id: 'companheiro',
    name: 'Especialização: Companheiro',
    icon: '🛡️',
    description: 'Concede poderosos benefícios e auras protetoras ao personagem do jogador durante a exploração.',
    skills: [
      {
        id: 'aura_vitalidade',
        name: 'Aura de Vitalidade',
        tier: 1,
        maxLevel: 3,
        cost: 1,
        desc: 'Aumenta o HP Máximo do jogador em +10% por nível e regenera +2 HP por segundo.',
        effect: (lvl) => ({ playerMaxHpBonus: lvl * 0.10, playerHpRegen: lvl * 2 })
      },
      {
        id: 'harmonia_arcana',
        name: 'Harmonia Arcana',
        tier: 2,
        requires: 'aura_vitalidade',
        maxLevel: 2,
        cost: 1,
        desc: 'Aumenta o MP Máximo do jogador em +15% por nível e dobra a velocidade de recuperação de MP.',
        effect: (lvl) => ({ playerMaxMpBonus: lvl * 0.15, playerMpRegenRate: lvl * 1.5 })
      },
      {
        id: 'escudo_guardiao',
        name: 'Bênção de Safael',
        tier: 3,
        requires: 'harmonia_arcana',
        maxLevel: 2,
        cost: 2,
        desc: 'Aumenta a Defesa do jogador em +6 por nível e concede +5% de Chance de Acerto Crítico.',
        effect: (lvl) => ({ playerDefBonus: lvl * 6, playerCritBonus: lvl * 0.05 })
      },
      {
        id: 'uniao_das_almas',
        name: 'União das Almas',
        tier: 4,
        requires: 'escudo_guardiao',
        maxLevel: 1,
        cost: 3,
        desc: 'Concede +15% de Velocidade de Movimento, +10 de Atk e cura o jogador em 50 HP quando derrotar inimigos.',
        effect: () => ({ playerSpeedBonus: 0.15, playerAtkBonus: 10, healOnKill: 50 })
      }
    ]
  }
});

export const SPRITE_FOODS = Object.freeze({
  fruta_doce: {
    id: 'fruta_doce',
    name: 'Fruta Silvestre Doce',
    icon: '🍎',
    energy: 25,
    satiety: 30,
    friendship: 2,
    xp: 5,
    costGold: 10,
    desc: 'Uma fruta fresca e açucarada colhida nas árvores de Safael. Deliciosa e nutritiva.'
  },
  biscoito_sprite: {
    id: 'biscoito_sprite',
    name: 'Biscoito Estelar dos Sprites',
    icon: '🍪',
    energy: 50,
    satiety: 50,
    friendship: 5,
    xp: 15,
    costGold: 25,
    desc: 'Biscoito amanteigado com infusão de pólen brilhante. Os Sprites adoram o crocante.'
  },
  geleia_estelar: {
    id: 'geleia_estelar',
    name: 'Geleia de Néctar Radiante',
    icon: '🍯',
    energy: 80,
    satiety: 80,
    friendship: 9,
    xp: 35,
    costGold: 60,
    desc: 'Néctar concentrado das flores arcanas. Revigora intensamente a energia do Sprite.'
  },
  banquete_celeste: {
    id: 'banquete_celeste',
    name: 'Banquete dos Reis Sprites',
    icon: '🍱',
    energy: 100,
    satiety: 100,
    friendship: 18,
    xp: 80,
    costGold: 140,
    desc: 'Um suntuoso banquete de reis. Recupera 100% de energia e saciedade, deixando o Sprite radiante!'
  }
});

export const DEFAULT_SPRITES = Object.freeze([
  {
    id: 'sprite-lumi',
    name: 'Lumi',
    category: 'minerador',
    personality: 'trabalhador',
    title: 'Sprite da Terra',
    lore: 'Seu fiel companheiro inicial encontrado nas proximidades de Ilya. Possui grande afinidade com rochas e metais.',
    level: 1,
    xp: 0,
    xpNext: 40,
    energy: 100,
    maxEnergy: 100,
    satiety: 85,
    friendship: 30,
    mood: 'feliz',
    skillPoints: 0,
    skills: { colheita_abundante_1: 1 }
  },
  {
    id: 'sprite-leafy',
    name: 'Leafy',
    category: 'silvestre',
    personality: 'curioso',
    title: 'Ninfa dos Bosques',
    lore: 'Resgatada das copas frondosas das Planícies de Safael. Tem asas que lembram folhas de trevo e adora novidades.',
    level: 1,
    xp: 0,
    xpNext: 40,
    energy: 100,
    maxEnergy: 100,
    satiety: 75,
    friendship: 20,
    mood: 'feliz',
    skillPoints: 0,
    skills: { olhos_de_aguia: 1 }
  },
  {
    id: 'sprite-brisa',
    name: 'Brisa',
    category: 'herbalista',
    personality: 'sereno',
    title: 'Brisa de Lavanda',
    lore: 'Nascida nos canteiros da Fonte de Safael. Seu perfume calmante alivia as dores de qualquer aventureiro.',
    level: 1,
    xp: 0,
    xpNext: 40,
    energy: 100,
    maxEnergy: 100,
    satiety: 80,
    friendship: 25,
    mood: 'feliz',
    skillPoints: 0,
    skills: { aura_vitalidade: 1 }
  },
  {
    id: 'sprite-ignis',
    name: 'Ignis',
    category: 'artifice',
    personality: 'perfeccionista',
    title: 'Chama Forjadora',
    lore: 'Criado ao lado da grande forja de Ilya. Não aceita lâminas tortas ou armaduras sem brilho.',
    level: 1,
    xp: 0,
    xpNext: 40,
    energy: 100,
    maxEnergy: 100,
    satiety: 90,
    friendship: 15,
    mood: 'feliz',
    skillPoints: 0,
    skills: { economia_magica: 1 }
  },
  {
    id: 'sprite-orion',
    name: 'Orion',
    category: 'astral',
    personality: 'corajoso',
    title: 'Sentinela das Estrelas',
    lore: 'Um nobre guardião astral que desceu em uma noite de chuva estelar. Seu manto cintila como as constelações.',
    level: 1,
    xp: 0,
    xpNext: 40,
    energy: 100,
    maxEnergy: 100,
    satiety: 95,
    friendship: 20,
    mood: 'feliz',
    skillPoints: 0,
    skills: { aura_vitalidade: 1 }
  }
]);
