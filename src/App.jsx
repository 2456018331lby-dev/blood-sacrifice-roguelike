import { useMemo, useReducer, useState, useRef, useEffect } from 'react'
import './App.css'
import { SwordIcon, ShieldIcon, CurseIcon, SlimeSvg, FangSvg, PriestSvg, BossSvg, EnergyOrb, HeartIcon, EyeIcon, BloodDrop, RuneCircle, SacrificeSigil } from './assets/SvgIcons.jsx'
import { playCardSound, playDamageSound, playHealSound, playSacrificeSound, playBossSound, playVictorySound, playDeathSound, playClickSound, initAudio } from './audio/sounds.js'

const STARTER_DECK = [
  'strike',
  'strike',
  'strike',
  'strike',
  'defend',
  'defend',
  'defend',
  'defend',
  'drain',
  'blood_pact',
]

const CARD_LIBRARY = {
  strike: {
    id: 'strike',
    name: '打击',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    text: '造成 6 点伤害。',
    effect: { damage: 6 },
  },
  defend: {
    id: 'defend',
    name: '防御',
    cost: 1,
    type: 'skill',
    rarity: 'starter',
    text: '获得 5 点护甲。',
    effect: { block: 5 },
  },
  drain: {
    id: 'drain',
    name: '汲魂',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    text: '造成 5 点伤害，回复 2 点生命。',
    effect: { damage: 5, heal: 2 },
  },
  blood_pact: {
    id: 'blood_pact',
    name: '血契',
    cost: 0,
    type: 'skill',
    rarity: 'starter',
    text: '失去 3 点生命，获得 1 点能量。',
    effect: { loseHp: 3, gainEnergy: 1 },
  },
  lacerate: {
    id: 'lacerate',
    name: '裂伤',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    text: '造成 9 点伤害；若本回合失去过生命，改为 13。',
    effect: { damage: 9, bonusDamageIfLostHp: 13 },
  },
  bone_guard: {
    id: 'bone_guard',
    name: '骨盾',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    text: '获得 8 点护甲；若生命低于一半，再获得 4 点。',
    effect: { block: 8, lowHpBonusBlock: 4 },
  },
  flurry: {
    id: 'flurry',
    name: '连斩',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    text: '造成 4 点伤害 2 次。',
    effect: { damage: 4, hits: 2 },
  },
  squeeze: {
    id: 'squeeze',
    name: '压榨',
    cost: 0,
    type: 'skill',
    rarity: 'common',
    text: '失去 2 点生命，抽 2 张牌。',
    effect: { loseHp: 2, draw: 2 },
  },
  blood_burst: {
    id: 'blood_burst',
    name: '血爆',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    text: '失去 4 点生命，对所有敌人造成 10 点伤害。',
    effect: { loseHp: 4, aoeDamage: 10 },
  },
  final_rite: {
    id: 'final_rite',
    name: '终祭',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    text: '造成 18 点伤害；若本回合失去过生命，改为 26。打出后移除。',
    effect: { damage: 18, bonusDamageIfLostHp: 26, exhaust: true },
  },
  mutate_draw: {
    id: 'mutate_draw',
    name: '畸变抽取',
    cost: 1,
    type: 'skill',
    rarity: 'rare',
    text: '抽 3 张牌，获得 1 层虚弱。',
    effect: { draw: 3, selfWeak: 1 },
  },
}

const ENEMY_LIBRARY = {
  slime: {
    id: 'slime',
    name: '小噬体',
    hp: 18,
    intentPattern: [
      { type: 'attack', value: 6, label: '撞击 6' },
      { type: 'block', value: 5, label: '凝胶护体 5' },
    ],
  },
  fang: {
    id: 'fang',
    name: '尖牙兽',
    hp: 16,
    intentPattern: [
      { type: 'attack', value: 8, label: '撕咬 8' },
      { type: 'multi', value: 4, hits: 2, label: '狂咬 4×2' },
    ],
  },
  priest: {
    id: 'priest',
    name: '祭司残躯',
    hp: 24,
    intentPattern: [
      { type: 'debuff', debuff: 'vulnerable', value: 1, label: '施加 1 层易伤' },
      { type: 'attack', value: 7, label: '骨钉 7' },
      { type: 'block_all', value: 4, label: '群体护体 4' },
    ],
  },
  boss: {
    id: 'boss',
    name: '畸心之母',
    hp: 120,
    intentPattern: [
      { type: 'attack_debuff', value: 8, debuff: 'vulnerable', debuffValue: 1, label: '穿刺 8 + 易伤' },
      { type: 'block', value: 10, summon: 'slime', label: '护心 + 召唤' },
      { type: 'multi', value: 6, hits: 2, label: '脉冲 6×2' },
      { type: 'aoe', value: 8, label: '全屏畸变 8' },
    ],
  },
}

const WAVE_PLAN = [
  ['slime'],
  ['slime', 'slime'],
  ['fang'],
  ['slime', 'fang'],
  ['priest'],
  ['fang', 'fang'],
  ['priest', 'slime'],
  ['priest', 'fang'],
  ['slime', 'slime', 'fang'],
  ['priest', 'fang', 'fang'],
  ['boss'],
]

const SACRIFICE_OPTIONS = [
  {
    id: 'atk_blood',
    name: '脉冲畸变',
    text: '永久攻击 +1，畸变 +1。',
    apply(state) {
      state.player.atkBonus += 1
      state.player.corruption += 1
      state.player.sacrificeCount += 1
      state.log.unshift('你撕开血肉换来更高杀意。')
    },
  },
  {
    id: 'draw_hand',
    name: '空心之握',
    text: '每回合额外抽 1，手牌上限 -1。',
    apply(state) {
      state.player.drawCount += 1
      state.player.handLimit = Math.max(6, state.player.handLimit - 1)
      state.player.corruption += 1
      state.player.sacrificeCount += 1
      state.log.unshift('你的手臂更长，理智更短。')
    },
  },
  {
    id: 'rare_maxhp',
    name: '血价武装',
    text: '最大生命 -6，获得一张稀有牌。',
    apply(state) {
      state.player.maxHp = Math.max(16, state.player.maxHp - 6)
      state.player.hp = Math.min(state.player.hp, state.player.maxHp)
      state.player.corruption += 1
      state.player.sacrificeCount += 1
      addCardToDeck(state, pickRewardCard('rare'))
      state.log.unshift('你献出骨血，换来禁忌兵器。')
    },
  },
  {
    id: 'dark_blood_cycle',
    name: '黑血循环',
    text: '每回合开始流失 1 点生命，首回合能量 +1。',
    apply(state) {
      state.player.bleed += 1
      state.player.maxEnergy += 1
      state.player.corruption += 1
      state.player.sacrificeCount += 1
      state.log.unshift('黑血在血管里烧起来。')
    },
  },
  {
    id: 'flesh_armor',
    name: '血肉装甲',
    text: '最大生命 +5，每场战斗开始获得 1 层虚弱。',
    apply(state) {
      state.player.maxHp += 5
      state.player.weak += 1
      state.player.corruption += 1
      state.player.sacrificeCount += 1
      state.log.unshift('皮更厚了，人更慢了。')
    },
  },
]

const REWARD_POOL = {
  common: ['lacerate', 'bone_guard', 'flurry', 'squeeze'],
  rare: ['blood_burst', 'final_rite', 'mutate_draw'],
}

function cloneCard(cardId) {
  return { ...CARD_LIBRARY[cardId], instanceId: `${cardId}-${Math.random().toString(36).slice(2, 10)}` }
}

function shuffle(list) {
  const next = [...list]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function pickRewardCard(rarity = 'common') {
  const pool = REWARD_POOL[rarity]
  return pool[Math.floor(Math.random() * pool.length)]
}

function createEnemy(enemyId, wave, corruption) {
  const base = ENEMY_LIBRARY[enemyId]
  const waveBonus = enemyId === 'boss' ? 0 : Math.max(0, wave - 1)
  const hpBonus = enemyId === 'boss' ? corruption * 6 : waveBonus * 2
  return {
    key: `${enemyId}-${Math.random().toString(36).slice(2, 8)}`,
    id: enemyId,
    name: base.name,
    maxHp: base.hp + hpBonus,
    hp: base.hp + hpBonus,
    block: 0,
    vulnerable: 0,
    weak: 0,
    patternIndex: 0,
  }
}

function buildRewardOptions() {
  return [
    { type: 'card', label: `获得 ${CARD_LIBRARY[pickRewardCard('common')].name}`, value: pickRewardCard('common') },
    { type: 'heal', label: '恢复 8 点生命', value: 8 },
    { type: 'upgrade', label: '下回合战斗开始时攻击 +2', value: 2 },
  ]
}

function drawCards(state, amount) {
  for (let i = 0; i < amount; i += 1) {
    if (state.player.hand.length >= state.player.handLimit) return
    if (state.player.drawPile.length === 0) {
      if (state.player.discardPile.length === 0) return
      state.player.drawPile = shuffle(state.player.discardPile)
      state.player.discardPile = []
    }
    const next = state.player.drawPile.shift()
    if (next) state.player.hand.push(next)
  }
}

function addCardToDeck(state, cardId) {
  const card = cloneCard(cardId)
  state.player.deck.push(card)
  state.player.discardPile.push(card)
}

function createBattleState(previous = null) {
  const playerBase = previous?.player
  const player = {
    hp: playerBase?.hp ?? 40,
    maxHp: playerBase?.maxHp ?? 40,
    energy: 3,
    maxEnergy: playerBase?.maxEnergy ?? 3,
    block: 0,
    atkBonus: playerBase?.atkBonus ?? 0,
    weak: 0,
    vulnerable: 0,
    bleed: playerBase?.bleed ?? 0,
    corruption: playerBase?.corruption ?? 0,
    sacrificeCount: playerBase?.sacrificeCount ?? 0,
    drawCount: playerBase?.drawCount ?? 5,
    handLimit: playerBase?.handLimit ?? 10,
    temporaryAtk: previous?.carryBuff?.temporaryAtk ?? 0,
    deck:
      playerBase?.deck?.map((card) => ({ ...card })) ?? STARTER_DECK.map((cardId) => cloneCard(cardId)),
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    lostHpThisTurn: false,
  }

  player.drawPile = shuffle(player.deck.map((card) => ({ ...card })))

  const battleState = {
    screen: 'battle',
    wave: previous?.wave ?? 1,
    rewardOptions: [],
    sacrificeOptions: [],
    carryBuff: null,
    log: previous?.log ? [...previous.log] : ['献祭开始。'],
    player,
    enemies: [],
    selectedEnemyId: null,
    outcome: null,
  }

  drawCards(battleState, player.drawCount)
  battleState.enemies = WAVE_PLAN[battleState.wave - 1].map((enemyId) =>
    createEnemy(enemyId, battleState.wave, player.corruption)
  )
  battleState.selectedEnemyId = battleState.enemies[0]?.key ?? null

  // Boss wave sound
  if (WAVE_PLAN[battleState.wave - 1][0] === 'boss') {
    playBossSound()
  }

  return battleState
}

function getEnemyIntent(enemy, player) {
  const base = ENEMY_LIBRARY[enemy.id]
  const pattern = base.intentPattern[enemy.patternIndex % base.intentPattern.length]
  if (enemy.id === 'boss' && pattern.type === 'attack') {
    return { ...pattern, value: pattern.value + Math.floor(player.corruption / 2) }
  }
  return pattern
}

function applyDamage(target, amount, attacker) {
  let final = amount
  if (target.vulnerable > 0) final = Math.floor(final * 1.5)
  if (attacker?.weak > 0) final = Math.floor(final * 0.75)
  const blocked = Math.min(target.block, final)
  target.block -= blocked
  target.hp -= Math.max(0, final - blocked)
}

function computeCardDamage(card, state) {
  const effect = card.effect
  let baseDamage = effect.damage ?? 0
  if (effect.bonusDamageIfLostHp && state.player.lostHpThisTurn) {
    baseDamage = effect.bonusDamageIfLostHp
  }
  let final = baseDamage + state.player.atkBonus + state.player.temporaryAtk
  if (state.player.weak > 0) final = Math.floor(final * 0.75)
  return final
}

function cleanupDefeatedEnemies(state) {
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0)
  if (!state.enemies.find((enemy) => enemy.key === state.selectedEnemyId)) {
    state.selectedEnemyId = state.enemies[0]?.key ?? null
  }
}

function afterPlayerAction(state) {
  cleanupDefeatedEnemies(state)
  if (state.enemies.length === 0) {
    state.screen = state.wave === WAVE_PLAN.length ? 'victory' : 'reward'
    state.rewardOptions = buildRewardOptions()
    state.sacrificeOptions = shuffle(SACRIFICE_OPTIONS).slice(0, 2)
    state.log.unshift(state.wave === WAVE_PLAN.length ? '畸心之母倒下了。' : `第 ${state.wave} 波已清理。`)
  }
}

function runEnemyTurn(state) {
  state.player.block = 0
  let playerDamaged = false
  for (const enemy of state.enemies) {
    const intent = getEnemyIntent(enemy, state.player)
    if (intent.type === 'attack') {
      applyDamage(state.player, intent.value, enemy)
      playerDamaged = true
      state.log.unshift(`${enemy.name} 对你造成 ${intent.value} 点伤害。`)
    } else if (intent.type === 'multi') {
      const total = intent.value * intent.hits
      applyDamage(state.player, total, enemy)
      playerDamaged = true
      state.log.unshift(`${enemy.name} 连击 ${intent.hits} 次，共 ${total} 点伤害。`)
    } else if (intent.type === 'aoe') {
      applyDamage(state.player, intent.value, enemy)
      playerDamaged = true
      state.log.unshift(`${enemy.name} 释放畸变脉冲 ${intent.value}。`)
    } else if (intent.type === 'block') {
      enemy.block += intent.value
      if (intent.summon && state.enemies.length < 4) {
        state.enemies.push(createEnemy(intent.summon, state.wave, state.player.corruption))
      }
      state.log.unshift(`${enemy.name} 获得 ${intent.value} 点护甲。`)
    } else if (intent.type === 'block_all') {
      state.enemies.forEach((target) => {
        target.block += intent.value
      })
      state.log.unshift(`${enemy.name} 为敌方全体提供 ${intent.value} 点护甲。`)
    } else if (intent.type === 'debuff') {
      state.player.vulnerable += intent.value
      state.log.unshift(`${enemy.name} 施加 ${intent.value} 层易伤。`)
    } else if (intent.type === 'attack_debuff') {
      applyDamage(state.player, intent.value, enemy)
      state.player.vulnerable += intent.debuffValue ?? 0
      state.log.unshift(`${enemy.name} 造成 ${intent.value} 点伤害并附加易伤。`)
    }
    enemy.patternIndex += 1
  }

  if (state.player.bleed > 0) {
    state.player.hp -= state.player.bleed
    state.log.unshift(`流血让你额外失去 ${state.player.bleed} 点生命。`)
  }

  if (playerDamaged) playDamageSound()

  state.player.weak = Math.max(0, state.player.weak - 1)
  state.player.vulnerable = Math.max(0, state.player.vulnerable - 1)
  state.player.temporaryAtk = 0
  state.player.energy = state.player.maxEnergy
  state.player.lostHpThisTurn = false
  state.player.discardPile.push(...state.player.hand)
  state.player.hand = []
  drawCards(state, state.player.drawCount)

  if (state.player.hp <= 0) {
    state.screen = 'gameover'
    state.outcome = 'dead'
    playDeathSound()
    state.log.unshift('你在献祭中耗尽了最后一滴血。')
  }
}

function playCard(state, cardInstanceId) {
  const cardIndex = state.player.hand.findIndex((card) => card.instanceId === cardInstanceId)
  if (cardIndex === -1) return
  const card = state.player.hand[cardIndex]
  if (card.cost > state.player.energy) return

  state.player.energy -= card.cost
  state.player.hand.splice(cardIndex, 1)
  playCardSound()
  const effect = card.effect

  if (effect.loseHp) {
    state.player.hp -= effect.loseHp
    state.player.lostHpThisTurn = true
    state.log.unshift(`${card.name} 让你失去 ${effect.loseHp} 点生命。`)
  }

  if (effect.gainEnergy) {
    state.player.energy += effect.gainEnergy
  }

  if (effect.block) {
    const bonus = effect.lowHpBonusBlock && state.player.hp <= state.player.maxHp / 2 ? effect.lowHpBonusBlock : 0
    state.player.block += effect.block + bonus
  }

  if (effect.heal) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.heal)
  }

  if (effect.draw) {
    drawCards(state, effect.draw)
  }

  if (effect.selfWeak) {
    state.player.weak += effect.selfWeak
  }

  if (effect.aoeDamage) {
    const amount = effect.aoeDamage + state.player.atkBonus + state.player.temporaryAtk
    state.enemies.forEach((enemy) => applyDamage(enemy, amount, state.player))
    state.log.unshift(`${card.name} 对全体造成 ${amount} 点伤害。`)
  }

  const targeted = effect.damage || effect.hits
  if (targeted) {
    const target = state.enemies.find((enemy) => enemy.key === state.selectedEnemyId) ?? state.enemies[0]
    if (target) {
      const hits = effect.hits ?? 1
      const damage = computeCardDamage(card, state)
      for (let i = 0; i < hits; i += 1) applyDamage(target, damage, state.player)
      state.log.unshift(`${card.name} 命中 ${target.name}，造成 ${damage}${hits > 1 ? `×${hits}` : ''}。`)
    }
  }

  if (effect.gainAtkBonusBattle) {
    state.player.atkBonus += effect.gainAtkBonusBattle
    state.player.maxHp = Math.max(10, state.player.maxHp - (effect.loseMaxHp ?? 0))
    state.player.hp = Math.min(state.player.hp, state.player.maxHp)
  }

  if (effect.exhaust) {
    state.player.exhaustPile.push(card)
  } else {
    state.player.discardPile.push(card)
  }

  if (state.player.hp <= 0) {
    state.screen = 'gameover'
    state.outcome = 'dead'
    state.log.unshift('你在发动禁忌卡牌时死亡。')
    return
  }

  afterPlayerAction(state)
}

function pickReward(state, reward) {
  if (reward.type === 'card') {
    addCardToDeck(state, reward.value)
    state.log.unshift(`你获得了 ${CARD_LIBRARY[reward.value].name}。`)
  }
  if (reward.type === 'heal') {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + reward.value)
    playHealSound()
    state.log.unshift(`你恢复了 ${reward.value} 点生命。`)
  }
  if (reward.type === 'upgrade') {
    state.carryBuff = { temporaryAtk: reward.value }
    state.log.unshift(`下一场战斗开始时攻击 +${reward.value}。`)
  }
  playClickSound()
  moveToNextWave(state)
}

function pickSacrifice(state, optionId) {
  const option = SACRIFICE_OPTIONS.find((item) => item.id === optionId)
  if (!option) return
  option.apply(state)
  playSacrificeSound()
  moveToNextWave(state)
}

function moveToNextWave(state) {
  if (state.wave >= WAVE_PLAN.length) {
    state.screen = 'victory'
    state.outcome = 'win'
    playVictorySound()
    return
  }
  const nextWave = state.wave + 1
  const nextState = createBattleState({
    player: state.player,
    wave: nextWave,
    carryBuff: state.carryBuff,
    log: state.log,
  })
  Object.assign(state, nextState)
  state.log.unshift(`进入第 ${nextWave} 波。`)
}

function reducer(state, action) {
  if (action.type === 'START_RUN') return createBattleState()
  if (action.type === 'RESTART') return { screen: 'start' }

  const next = structuredClone(state)

  switch (action.type) {
    case 'SELECT_ENEMY':
      next.selectedEnemyId = action.enemyId
      return next
    case 'PLAY_CARD':
      playCard(next, action.cardId)
      return next
    case 'END_TURN':
      runEnemyTurn(next)
      return next
    case 'PICK_REWARD':
      pickReward(next, action.reward)
      return next
    case 'PICK_SACRIFICE':
      pickSacrifice(next, action.optionId)
      return next
    default:
      return state
  }
}

function StartScreen({ onStart }) {
  return (
    <section className="screen start-screen">
      <div className="panel title-panel">
        <p className="eyebrow">安卓优先垂直切片</p>
        <h1>血祭回响</h1>
        <p className="lead">
          这是一个为手机设计的肉鸽原型：每场只有 10 波和 1 个 Boss，但你每次献祭都会让自己更强，也更畸形。
        </p>
      </div>

      <div className="panel rules-panel">
        <h2>核心闭环</h2>
        <ul>
          <li>每回合 3 能量，抽 5 张牌</li>
          <li>过波后固定出现献祭抉择</li>
          <li>献祭换来立刻收益，但会永久污染这一局</li>
          <li>越贪越爽，也越容易被 Boss 收走</li>
        </ul>
      </div>

      <button className="primary-btn huge" onClick={onStart}>开始献祭</button>
    </section>
  )
}

function RunHud({ state }) {
  const alive = state.enemies.length
  const hpPct = state.player.hp / state.player.maxHp
  const isLowHp = hpPct <= 0.3
  const isVeryLowHp = hpPct <= 0.15
  return (
    <header className={`panel hud ${isLowHp ? 'hud-pulse' : ''} ${isVeryLowHp ? 'hud-pulse-fast' : ''}`}>
      <div>
        <span>波次</span>
        <strong>{state.wave}/{WAVE_PLAN.length}</strong>
      </div>
      <div className={isLowHp ? 'hp-low' : ''}>
        <span>生命</span>
        <strong>{state.player.hp}/{state.player.maxHp}</strong>
      </div>
      <div>
        <span>能量</span>
        <strong>{state.player.energy}/{state.player.maxEnergy}</strong>
      </div>
      <div>
        <span>畸变</span>
        <strong>{state.player.corruption}</strong>
      </div>
      <div>
        <span>献祭</span>
        <strong>{state.player.sacrificeCount}</strong>
      </div>
      <div>
        <span>存活敌人</span>
        <strong>{alive}</strong>
      </div>
    </header>
  )
}

function EnemyPanel({ state, dispatch }) {
  const [floatings, setFloatings] = useState([])
  const prevHpMap = useRef({})

  // 追踪敌人血量变化，弹出伤害数字
  useEffect(() => {
    const now = {}
    const newFloatings = []
    state.enemies.forEach((enemy) => {
      now[enemy.key] = enemy.hp + enemy.block
    })
    const prev = prevHpMap.current
    for (const key of Object.keys(now)) {
      if (prev[key] !== undefined && now[key] < prev[key]) {
        const diff = prev[key] - now[key]
        newFloatings.push({ id: key + '-' + Date.now() + Math.random(), amount: diff, isHeal: false })
      }
    }
    // 检测 Boss 的护甲恢复（视为治疗/再生）
    for (const key of Object.keys(now)) {
      if (prev[key] !== undefined && now[key] > prev[key]) {
        const diff = now[key] - prev[key]
        newFloatings.push({ id: key + '-' + Date.now() + Math.random(), amount: diff, isHeal: true })
      }
    }
    prevHpMap.current = now
    if (newFloatings.length > 0) {
      setFloatings((prev) => [...prev, ...newFloatings])
    }
  }, [state.enemies])

  // 清理过期浮动数字
  useEffect(() => {
    if (floatings.length === 0) return
    const timer = setTimeout(() => {
      setFloatings((prev) => prev.filter((f) => Date.now() - Number(f.id.split('-').pop() || 0) < 1500))
    }, 1500)
    return () => clearTimeout(timer)
  }, [floatings.length])

  return (
    <section className="panel enemies-panel">
      <div className="section-head">
        <h2>敌方阵列</h2>
        <p>点选目标，先把高威胁怪切掉。</p>
      </div>
      <div className="enemy-list">
        {state.enemies.map((enemy) => {
          const intent = getEnemyIntent(enemy, state.player)
          const selected = state.selectedEnemyId === enemy.key
          const isBoss = enemy.id === 'boss'
          const isDead = enemy.hp <= 0
          return (
            <button
              key={enemy.key}
              className={`enemy-card ${selected ? 'selected' : ''} ${isBoss ? 'boss-card' : ''} ${isDead ? 'dying' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_ENEMY', enemyId: enemy.key })}
            >
              <div className="enemy-top">
                <strong>
                  {isBoss && <span className="boss-icon">👁 </span>}
                  {enemy.name}
                </strong>
                <span className={isBoss ? 'boss-hp' : ''}>{enemy.hp}/{enemy.maxHp}</span>
              </div>
              {isBoss ? (
                <div className="meter boss-meter"><div style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} /></div>
              ) : (
                <div className="meter"><div style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} /></div>
              )}
              <div className="enemy-meta">
                <span>护甲 {enemy.block}</span>
                <span>意图：{intent.label}</span>
              </div>
              {/* 浮动伤害数字 */}
              {floatings
                .filter((f) => f.id.startsWith(enemy.key + '-'))
                .map((f) => (
                  <span key={f.id} className={`float-num ${f.isHeal ? 'float-heal' : 'float-dmg'}`}>
                    {f.isHeal ? '+' : '-'}{f.amount}
                  </span>
                ))}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function HandPanel({ state, dispatch }) {
  const [playingCardId, setPlayingCardId] = useState(null)

  const handlePlay = (cardId) => {
    setPlayingCardId(cardId)
    // 短暂发光后清除
    setTimeout(() => setPlayingCardId(null), 400)
    dispatch({ type: 'PLAY_CARD', cardId })
  }

  return (
    <section className="panel hand-panel">
      <div className="section-head">
        <h2>手牌</h2>
        <p>当前回合若失去过生命，部分卡会进入强化态。</p>
      </div>
      <div className="hand-list">
        {state.player.hand.map((card) => {
          const boosted = card.effect.bonusDamageIfLostHp && state.player.lostHpThisTurn
          const isPlaying = playingCardId === card.instanceId
          return (
            <button
              key={card.instanceId}
              className={`hand-card rarity-${card.rarity} ${boosted ? 'boosted' : ''} ${isPlaying ? 'card-glow-out' : ''}`}
              disabled={card.cost > state.player.energy || isPlaying}
              onClick={() => handlePlay(card.instanceId)}
            >
              <div className="card-head">
                <strong>{card.name}</strong>
                <span>{card.cost}</span>
              </div>
              <p>{card.text}</p>
              <small>{card.type === 'attack' ? '攻击' : '技能'}</small>
            </button>
          )
        })}
      </div>
      <button className="secondary-btn end-turn" onClick={() => dispatch({ type: 'END_TURN' })}>结束回合</button>
    </section>
  )
}

function RewardScreen({ state, dispatch }) {
  return (
    <section className="screen reward-screen">
      <div className="panel title-panel">
        <p className="eyebrow">第 {state.wave} 波清理完成</p>
        <h2>继续变强，还是继续堕落？</h2>
      </div>

      <div className="panel reward-grid">
        <h3>✨ 普通奖励</h3>
        <div className="choice-list">
          {state.rewardOptions.map((reward) => (
            <button key={reward.label} className="choice-card" onClick={() => dispatch({ type: 'PICK_REWARD', reward })}>
              <strong>{reward.label}</strong>
              <span>{reward.type === 'card' ? CARD_LIBRARY[reward.value].text : reward.type === 'upgrade' ? '只持续下一场战斗。' : '稳一口，继续往后推。'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel reward-grid sacrifice">
        <h3>🩸 献祭交易 — 代价永存</h3>
        <p className="sacrifice-warning">⚠ 以下选择将永久改变你的命运，不可撤销。</p>
        <div className="choice-list">
          {state.sacrificeOptions.map((option) => (
            <button key={option.id} className="choice-card sacrifice-card" onClick={() => dispatch({ type: 'PICK_SACRIFICE', optionId: option.id })}>
              <strong>{option.name}</strong>
              <span>{option.text}</span>
              <small className="sacrifice-hint">畸变 +1 · 不可逆</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function EndScreen({ state, dispatch }) {
  const win = state.screen === 'victory'
  return (
    <section className="screen end-screen">
      <div className="panel title-panel">
        <p className="eyebrow">{win ? '垂直切片完成' : '本次献祭失败'}</p>
        <h1>{win ? '你活着走出了祭坛。' : '你被自己喂养的怪物吞掉了。'}</h1>
        <p className="lead">
          {win
            ? `本局共献祭 ${state.player.sacrificeCount} 次，最终畸变值 ${state.player.corruption}。这就是原型的核心爽点闭环。`
            : `你撑到第 ${state.wave} 波，献祭 ${state.player.sacrificeCount} 次。现在可以继续压缩数值和视觉。`}
        </p>
      </div>
      <div className="panel summary-panel">
        <div><span>最大生命</span><strong>{state.player.maxHp}</strong></div>
        <div><span>攻击成长</span><strong>{state.player.atkBonus}</strong></div>
        <div><span>牌组数量</span><strong>{state.player.deck.length}</strong></div>
      </div>
      <button className="primary-btn huge" onClick={() => dispatch({ type: 'RESTART' })}>重新开始</button>
    </section>
  )
}

function LogPanel({ entries }) {
  const shown = entries.slice(0, 8)
  const [animated, setAnimated] = useState(new Set())
  const prevEntries = useRef([])

  useEffect(() => {
    const newEntries = entries.filter((e) => !prevEntries.current.includes(e))
    if (newEntries.length > 0) {
      setAnimated((prev) => {
        const next = new Set(prev)
        newEntries.forEach((e) => next.add(e))
        return next
      })
      // 移除动画标记
      const timer = setTimeout(() => {
        setAnimated((prev) => {
          const next = new Set(prev)
          newEntries.forEach((e) => next.delete(e))
          return next
        })
      }, 600)
      return () => clearTimeout(timer)
    }
    prevEntries.current = entries
  }, [entries])

  return (
    <section className="panel log-panel">
      <div className="section-head">
        <h2>战斗记录</h2>
        <p>先用文本反馈替代重动画，保证节奏感。</p>
      </div>
      <div className="log-list">
        {shown.map((entry, index) => (
          <p key={`${entry}-${index}`} className={animated.has(entry) ? 'log-enter' : ''}>{entry}</p>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, { screen: 'start' })

  const deckSummary = useMemo(() => {
    if (!state.player?.deck) return []
    const counter = new Map()
    state.player.deck.forEach((card) => {
      counter.set(card.name, (counter.get(card.name) ?? 0) + 1)
    })
    return Array.from(counter.entries())
  }, [state.player?.deck])

  if (state.screen === 'start') {
    return <div className="app-shell"><StartScreen onStart={() => dispatch({ type: 'START_RUN' })} /></div>
  }

  if (state.screen === 'reward') {
    return <div className="app-shell"><RewardScreen state={state} dispatch={dispatch} /></div>
  }

  if (state.screen === 'gameover' || state.screen === 'victory') {
    return <div className="app-shell"><EndScreen state={state} dispatch={dispatch} /></div>
  }

  return (
    <div className="app-shell">
      <main className="screen battle-screen">
        <RunHud state={state} />
        <EnemyPanel state={state} dispatch={dispatch} />
        <HandPanel state={state} dispatch={dispatch} />
        <LogPanel entries={state.log} />
        <section className="panel deck-panel">
          <div className="section-head">
            <h2>当前牌组</h2>
            <p>只保留精选 12~16 张卡即可构成原型乐趣。</p>
          </div>
          <div className="deck-tags">
            {deckSummary.map(([name, count]) => (
              <span key={name}>{name} × {count}</span>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
