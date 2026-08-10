"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDmMode } from "@/components/DmModeProvider";

type Fighter = {
  name: string;
  guild: string;
  role: string;
  level: string;
  ac: string;
  hp: string;
  speed: string;
  attack: string;
  spellSlots?: string;
  economy?: string;
  signature: string[];
  run: string;
  kill: string;
  statBlock?: {
    abilities: string;
    saves: string;
    skills: string;
    senses: string;
    traits: string[];
    actions: string[];
    bonusActions?: string[];
    reactions?: string[];
  };
};

type GuildBlock = {
  label: string;
  note: string;
  fighters: Fighter[];
};

const roster: GuildBlock[] = [
  {
    label: "Martial Concord",
    note: "Disciplined, clean, and usually trying to win with shape instead of chaos.",
    fighters: [
      {
        name: "Tharos Blackvein",
        guild: "Martial Concord",
        role: "Barbarian 5, arena butcher",
        level: "5",
        ac: "15",
        hp: "64",
        speed: "30 ft",
        attack: "Multiattack: 2 Greataxe attacks, +7 to hit, 1d12+6 slashing each while raging; Javelin +7, 1d6+4 piercing, range 30/120",
        economy: "Action: Multiattack. Bonus: Rage 1/match. Reaction: none. Burst: Reckless Attack when he wants a finish.",
        signature: ["Rage 1/match: +2 damage and 10 temporary HP", "Reckless Attack: advantage on his attacks, attacks against him have advantage", "Blood Roar 1/match: +1d12 damage vs bloodied foe"],
        run: "Rages on round 1, claims Red, and forces a brutal trade. Once the target is bloodied, he goes Reckless and uses Blood Roar to make the finish feel inevitable.",
        kill: "Lethal. If he drops someone to 0, he keeps going unless physically stopped.",
        statBlock: {
          abilities: "Str 18, Dex 14, Con 16, Int 9, Wis 12, Cha 11",
          saves: "Str +7, Con +6",
          skills: "Athletics +7, Intimidation +3, Perception +4",
          senses: "Passive Perception 14",
          traits: ["Rage 1/match gives +2 damage and 10 temporary HP.", "Reckless Attack gives advantage on his melee attacks; attacks against him have advantage until his next turn.", "Blood Roar 1/match adds +1d12 damage against a bloodied target."],
          actions: ["Multiattack: two greataxe attacks.", "Greataxe: +7 to hit, reach 5 ft, 1d12+6 slashing while raging.", "Javelin: +7 to hit, range 30/120 ft, 1d6+4 piercing."],
          bonusActions: ["Rage 1/match."],
        },
      },
      {
        name: "Erynd Vale",
        guild: "Martial Concord",
        role: "Fighter 4, tactician",
        level: "4",
        ac: "17",
        hp: "46",
        speed: "30 ft",
        attack: "Longsword +6, 1d8+3 slashing",
        economy: "Actions: 1. Bonus: none. Reaction: none. Burst: maneuvers 3 total.",
        signature: ["Trip Attack", "Precision Attack", "Disarming Attack"],
        run: "Controls space, disarms showy fighters, and never wastes a maneuver on a doomed target.",
        kill: "Nonlethal. He wants the win, not the body.",
      },
      {
        name: "Jorren Pike",
        guild: "Martial Concord",
        role: "Monk 4, skirmisher",
        level: "4",
        ac: "16",
        hp: "40",
        speed: "45 ft",
        attack: "Spear +6, 1d8+3 piercing or Unarmed +6, 1d6+3 bludgeoning",
        economy: "Actions: 1. Bonus: 1 ki move or Flurry. Reaction: none. Burst: 5 ki total.",
        signature: ["Flurry of Blows 1 ki", "Stunning Strike 1 ki", "Step of the Wind 1 ki"],
        run: "Darts in, stuns once if the opening is real, and gets out before the room can answer.",
        kill: "Conditional. He can be dragged into killing if cornered or humiliated.",
      },
      {
        name: "Selka Arden",
        guild: "Martial Concord",
        role: "Paladin 4, duelist",
        level: "4",
        ac: "18",
        hp: "48",
        speed: "30 ft",
        attack: "Mace +5, 1d6+3 bludgeoning",
        spellSlots: "1st: 3",
        economy: "Actions: 1. Bonus: none. Reaction: none. Burst: Smite 3 slots-ish, Lay on Hands 10 total.",
        signature: ["Divine Smite 2d8", "Lay on Hands 10", "Blue sigil preference"],
        run: "Keeps pressure steady, protects the line, and stops the moment an opponent yields.",
        kill: "Nonlethal. She is the cleanest finish on the roster.",
      },
      {
        name: "Brannic Wex",
        guild: "Martial Concord",
        role: "Ranger 4, archer",
        level: "4",
        ac: "15",
        hp: "42",
        speed: "30 ft",
        attack: "Longbow +5, 1d8+3 piercing",
        spellSlots: "1st: 3",
        economy: "Actions: 1. Bonus: Hunter's Mark setup. Reaction: none. Burst: none.",
        signature: ["Hunter's Mark 1/match", "Kite and shoot", "Retreat if cornered"],
        run: "Marks, kites, and keeps the fight at a distance. He is a pressure piece, not a finisher.",
        kill: "Nonlethal. He backs off once the match is decided.",
      },
    ],
  },
  {
    label: "Civic Wardens",
    note: "Front-room order, back-room brawls, and the best place for Mead to feel at home.",
    fighters: [
      {
        name: "Captain Elric Stone",
        guild: "Civic Wardens",
        role: "Paladin 4, honorable",
        level: "4",
        ac: "18",
        hp: "50",
        speed: "30 ft",
        attack: "Warhammer +6, 1d8+4 bludgeoning",
        spellSlots: "1st: 3",
        economy: "Actions: 1. Bonus: Lay on Hands if needed. Reaction: none. Burst: 3 smites, 10 heal.",
        signature: ["Divine Smite 2d8", "Lay on Hands 10", "Will not chase a kill"],
        run: "Honest pressure, one decisive smite, and then he stops when the opponent is beaten.",
        kill: "Nonlethal. He is the Warden version of a sportsman.",
      },
      {
        name: "Kess Ironstep",
        guild: "Civic Wardens",
        role: "Barbarian 4, bruiser",
        level: "4",
        ac: "14",
        hp: "48",
        speed: "30 ft",
        attack: "Greataxe +6, 1d12+4 slashing",
        economy: "Actions: 1. Bonus: none. Reaction: none. Burst: Rage 1/match.",
        signature: ["Rage 1/match", "Reckless when blood is up", "Never disengages"],
        run: "Charges, rages, and turns the fight personal as soon as the crowd starts reacting.",
        kill: "Conditional. He can absolutely overcommit into a kill if the mood turns hot.",
      },
      {
        name: "Marra Vex",
        guild: "Civic Wardens",
        role: "Shield fighter 4",
        level: "4",
        ac: "18",
        hp: "48",
        speed: "30 ft",
        attack: "Shield Bash +5, 1d6+3 bludgeoning; Shortsword +5, 1d6+3 piercing",
        economy: "Actions: 1. Bonus: none. Reaction: none. Burst: none.",
        signature: ["Bash-prone-sword", "Stays glued to one target", "Blue sigil preference"],
        run: "Pins people down, knocks them flat, and keeps the fight tidy.",
        kill: "Nonlethal. She wants control, not blood.",
      },
      {
        name: "Rovan Grell",
        guild: "Civic Wardens",
        role: "Ranger 4, support archer",
        level: "4",
        ac: "15",
        hp: "42",
        speed: "30 ft",
        attack: "Longbow +5, 1d8+3 piercing plus 1d6 from Hunter's Mark",
        spellSlots: "1st: 3",
        economy: "Actions: 1. Bonus: Hunter's Mark setup. Reaction: none. Burst: none.",
        signature: ["Hunter's Mark 1/match", "Kite and shoot", "Disengages if cornered"],
        run: "Marks the obvious problem and keeps moving before anyone can reach him.",
        kill: "Nonlethal. He shoots to win, not to execute.",
      },
      {
        name: "Tomas Rheel",
        guild: "Civic Wardens",
        role: "Bard 4, control and support",
        level: "4",
        ac: "14",
        hp: "40",
        speed: "30 ft",
        attack: "Rapier +5, 1d8+3 piercing or Vicious Mockery",
        spellSlots: "1st: 4, 2nd: 3",
        economy: "Actions: 1. Bonus: Healing Word or Cutting Words reaction. Burst: Hold Person 1/fight.",
        signature: ["Cutting Words d6", "Hold Person 1/fight", "Healing Word"],
        run: "Taunts every round, saves the hard control for the moment it matters, and uses support instead of greed.",
        kill: "Nonlethal. He is all humiliation, no execution.",
      },
    ],
  },
  {
    label: "Scholar's Consortium",
    note: "Sharp, precise, and more annoying than dangerous until they find the right opening.",
    fighters: [
      {
        name: "Amon Thrice-Marked",
        guild: "Scholar's Consortium",
        role: "Monk 5, ascetic striker",
        level: "5",
        ac: "16",
        hp: "50",
        speed: "45 ft",
        attack: "Unarmed +7, 1d8+4 bludgeoning",
        signature: ["Two attacks", "Flurry of Blows 1 ki", "Stunning Strike 1 ki", "Step of the Wind 1 ki"],
        run: "Stuns once, pressures the backline, then resets if the fight stops favoring him.",
        kill: "Nonlethal. He is trying to win cleanly.",
      },
      {
        name: "Sister Halwen",
        guild: "Scholar's Consortium",
        role: "Cleric 5, control support",
        level: "5",
        ac: "16",
        hp: "52",
        speed: "30 ft",
        attack: "Spiritual Weapon +7, 1d8+4 force",
        spellSlots: "1st: 4, 2nd: 3, 3rd: 2",
        signature: ["Guiding Bolt 4d6 radiant", "Hold Person", "Healing Word"],
        run: "Spiritual Weapon first, control second, healing when somebody starts slipping.",
        kill: "Nonlethal. She is the safest cleric on the field.",
      },
      {
        name: "Vaelin Tress",
        guild: "Scholar's Consortium",
        role: "Rogue 4, skirmisher",
        level: "4",
        ac: "15",
        hp: "38",
        speed: "30 ft",
        attack: "Rapier +6, 1d8+4 piercing plus 2d6 Sneak Attack",
        signature: ["Attack then disengage", "Punish isolation", "Never stands still"],
        run: "Hits the isolated target, leaves before the retaliation comes back.",
        kill: "Nonlethal. He is a pest, not an executioner.",
      },
      {
        name: "Ilyra Fen",
        guild: "Scholar's Consortium",
        role: "Wizard 5, volatile artillery",
        level: "5",
        ac: "14",
        hp: "42",
        speed: "30 ft",
        attack: "Scorching Ray +6, three rays of 2d6 fire; Fire Bolt +6, 2d10 fire",
        spellSlots: "1st: 4, 2nd: 3, 3rd: 2",
        economy: "Action: Scorching Ray or Fire Bolt. Bonus: Misty Step if threatened. Reaction: Shield.",
        signature: ["Mirror Image 1/fight", "Shield", "Misty Step", "Overchannel Spark 1/match: one Scorching Ray ray deals max damage"],
        run: "Starts with Mirror Image if melee can reach her; otherwise opens with Scorching Ray into the biggest threat. Saves Misty Step for when someone closes and uses Overchannel Spark to make one ray hit for 12 fire when she needs a swing turn.",
        kill: "Conditional. She will panic before she means to kill, but panic can be ugly.",
        statBlock: {
          abilities: "Str 8, Dex 14, Con 14, Int 18, Wis 12, Cha 10",
          saves: "Int +7, Wis +4",
          skills: "Arcana +7, History +7, Investigation +7",
          senses: "Passive Perception 11",
          traits: ["Spell save DC 15, spell attack +7.", "Overchannel Spark 1/match makes one Scorching Ray ray deal 12 fire.", "Mirror Image 1/fight creates three duplicates."],
          actions: ["Scorching Ray: +7 to hit, three rays, 2d6 fire each.", "Fire Bolt: +7 to hit, 2d10 fire.", "Mirror Image 1/fight."],
          bonusActions: ["Misty Step: teleport 30 ft."],
          reactions: ["Shield: +5 AC until start of her next turn."],
        },
      },
      {
        name: "Corvin Pell",
        guild: "Scholar's Consortium",
        role: "Scholar battlemage 4",
        level: "4",
        ac: "14",
        hp: "41",
        speed: "30 ft",
        attack: "Quarterstaff +4, 1d6+1 bludgeoning",
        spellSlots: "1st: 4, 2nd: 3",
        signature: ["Mind Sliver DC 13", "Detect Thoughts 1/fight", "Tasha's Hideous Laughter 1/fight"],
        run: "Doesn't try to out-damage anyone. He tries to make somebody waste a turn.",
        kill: "Nonlethal. Clinical, annoying, and very deliberate.",
      },
    ],
  },
  {
    label: "Artisan Compact",
    note: "Practical bruisers and wardwrights who fight like every swing is a structural test.",
    fighters: [
      {
        name: "Brakka Venn",
        guild: "Artisan Compact",
        role: "Smith fighter 4",
        level: "4",
        ac: "16",
        hp: "46",
        speed: "30 ft",
        attack: "Warhammer +6, 1d8+4 bludgeoning",
        signature: ["Shove on hit 1/turn", "Reads spacing", "Blue sigil preference"],
        run: "Hammers, shoves, and keeps the fight in a shape she can control.",
        kill: "Nonlethal. She is trying to prove craftsmanship, not cruelty.",
      },
      {
        name: "Neris Toll",
        guild: "Artisan Compact",
        role: "Shieldwright 4",
        level: "4",
        ac: "17",
        hp: "42",
        speed: "30 ft",
        attack: "Battleaxe +5, 1d8+3 slashing",
        signature: ["Defensive Stance 1/match: +2 AC for a round", "Takes the hit and holds", "No chase"],
        run: "Stays planted and forces the other side to spend actions getting around her.",
        kill: "Nonlethal. Defensive first, always.",
      },
      {
        name: "Hest Quill",
        guild: "Artisan Compact",
        role: "Artificer 4, support caster",
        level: "4",
        ac: "15",
        hp: "40",
        speed: "30 ft",
        attack: "Light crossbow +5, 1d8+3 piercing",
        spellSlots: "1st: 3",
        signature: ["Thunderwave 1/match", "Cunning Device 1/match creates half cover", "Keeps allies alive"],
        run: "Makes the battlefield awkward and keeps the flank from collapsing.",
        kill: "Nonlethal. He is there to test systems, not people.",
      },
      {
        name: "Ulric Mav",
        guild: "Artisan Compact",
        role: "Forge bruiser 4",
        level: "4",
        ac: "15",
        hp: "44",
        speed: "30 ft",
        attack: "Maul +6, 2d6+4 bludgeoning",
        signature: ["Heat Burst 1/match adds 1d6 fire", "Gets uglier when embarrassed", "Prefers direct trades"],
        run: "He starts measured and gets reckless the second someone humiliates him in public.",
        kill: "Conditional. Humiliation can turn him into a problem fast.",
      },
      {
        name: "Dalia Forgehand",
        guild: "Artisan Compact",
        role: "Defender 4",
        level: "4",
        ac: "18",
        hp: "48",
        speed: "30 ft",
        attack: "Spear +5, 1d6+3 piercing; Shield Bash +5, 1d6+3 bludgeoning",
        signature: ["Repairing Breath 1/match heals 8", "Pushes and resets", "Refuses to overcommit"],
        run: "Trades space for time and keeps allies standing while the room changes shape around her.",
        kill: "Nonlethal. She is all about ending the fight clean.",
      },
    ],
  },
  {
    label: "Lunar Synod",
    note: "Spiritual people who follow Selune. They are calm until they decide somebody has gone too far.",
    fighters: [
      {
        name: "Lysa Marrow",
        guild: "Lunar Synod",
        role: "Cleric 4, radiant support",
        level: "4",
        ac: "16",
        hp: "40",
        speed: "30 ft",
        attack: "Sacred Flame DC 14, 2d8 radiant",
        spellSlots: "1st: 4, 2nd: 3",
        signature: ["Bless", "Healing Word", "Guiding Bolt"],
        run: "Bless first, healing second, damage only when she has no better option.",
        kill: "Nonlethal. Her whole game is mercy and restraint.",
      },
      {
        name: "Oren Solace",
        guild: "Lunar Synod",
        role: "Cleric 5, ward anchor",
        level: "5",
        ac: "18",
        hp: "54",
        speed: "30 ft",
        attack: "Mace +6, 1d6+3 bludgeoning; Spiritual Weapon +7, 1d8+4 force",
        spellSlots: "1st: 4, 2nd: 3, 3rd: 2",
        economy: "Action: Sacred Flame, mace, or Sanctuary reset. Bonus: Spiritual Weapon attack. Reaction: Warding Flare 2/match.",
        signature: ["Precast Aid: +10 max/current HP already included", "Sanctuary reset 1/match", "Spiritual Weapon", "Warding Flare 2/match imposes disadvantage"],
        run: "Starts with Spiritual Weapon and fights beside it, forcing the opponent to answer two angles at once. If pressured hard, he uses Sanctuary as a reset instead of an ally save, backs out of melee, then keeps Warding Flare for the two attacks most likely to break him.",
        kill: "Nonlethal. He stops once the opponent is down.",
        statBlock: {
          abilities: "Str 14, Dex 10, Con 16, Int 11, Wis 18, Cha 13",
          saves: "Wis +7, Cha +4",
          skills: "Insight +7, Medicine +7, Religion +3",
          senses: "Passive Perception 14",
          traits: ["Spell save DC 15, spell attack +7.", "Precast Aid is already included in HP.", "Sanctuary reset 1/match forces attackers to pass a Wisdom save before attacking him."],
          actions: ["Mace: +6 to hit, 1d6+3 bludgeoning.", "Sacred Flame: Dex save DC 15, 2d8 radiant.", "Sanctuary reset 1/match."],
          bonusActions: ["Spiritual Weapon: +7 to hit, 1d8+4 force."],
          reactions: ["Warding Flare 2/match: impose disadvantage on an attack he can see."],
        },
      },
      {
        name: "Mira Vell",
        guild: "Lunar Synod",
        role: "Moon priest 4",
        level: "4",
        ac: "15",
        hp: "38",
        speed: "30 ft",
        attack: "Sacred Flame DC 14 or Moonbeam DC 14, 2d10 radiant",
        spellSlots: "1st: 4, 2nd: 3",
        signature: ["Moonbeam 1/fight", "Hold Person 1/fight", "Controls a line"],
        run: "Pressures a lane, then goes hard if somebody threatens the sanctum or the crowd.",
        kill: "Conditional. She is calm until she isn't.",
        statBlock: {
          abilities: "Str 10, Dex 14, Con 14, Int 12, Wis 17, Cha 13",
          saves: "Wis +5, Cha +3",
          skills: "Insight +5, Perception +5, Religion +3",
          senses: "Passive Perception 15",
          traits: ["Spell save DC 14, spell attack +6.", "Moonbeam controls a 5-ft-radius lane and punishes forced movement.", "Hold Person can end a humanoid duel if the target fails the save."],
          actions: ["Sacred Flame: Dex save DC 14, 2d8 radiant.", "Moonbeam 1/fight: Con save DC 14, 2d10 radiant.", "Hold Person 1/fight: Wis save DC 14 or paralyzed."],
        },
      },
      {
        name: "Sevrin Hale",
        guild: "Lunar Synod",
        role: "Acolyte duelist 4",
        level: "4",
        ac: "15",
        hp: "36",
        speed: "30 ft",
        attack: "Spear +5, 1d6+3 piercing",
        spellSlots: "1st: 3",
        signature: ["Shield of Faith 1/match", "Defends the wounded", "Disengages instead of chasing"],
        run: "Stays near the vulnerable, covers the clerics, and exits before the match gets messy.",
        kill: "Nonlethal. He would rather lose than make it ugly.",
      },
      {
        name: "Tahlia Rune",
        guild: "Lunar Synod",
        role: "Exorcist 4",
        level: "4",
        ac: "14",
        hp: "40",
        speed: "30 ft",
        attack: "Light crossbow +5, 1d8+3 piercing",
        spellSlots: "1st: 4, 2nd: 3",
        signature: ["Command 1/fight", "Radiant Rebuke 1/match: 1d8 radiant when hit", "Punishes aggression"],
        run: "Stays at range, baits the wrong attack, and makes people regret charging her.",
        kill: "Nonlethal. She punishes, but does not execute.",
      },
    ],
  },
  {
    label: "Mercantile League",
    note: "Rude, wealthy, and convinced the bracket is an investment portfolio.",
    fighters: [
      {
        name: "Nyx Amberline",
        guild: "Mercantile League",
        role: "Warlock 5, crowd favorite",
        level: "5",
        ac: "14",
        hp: "48",
        speed: "30 ft",
        attack: "Eldritch Blast 2 beams, 1d10+4 force each",
        spellSlots: "Pact: 2 slots at 3rd",
        signature: ["Hex", "Fear", "Fireball 1/match", "Kills only if the crowd is chanting"],
        run: "Plays for spectacle, pressures from range, and escalates only when the audience wants blood.",
        kill: "Conditional lethal. Safe until the room gets cruel.",
        statBlock: {
          abilities: "Str 8, Dex 16, Con 14, Int 13, Wis 12, Cha 18",
          saves: "Wis +4, Cha +7",
          skills: "Deception +7, Intimidation +7, Performance +7",
          senses: "Passive Perception 11",
          traits: ["Spell save DC 15, spell attack +7.", "Hex adds +1d6 necrotic to each hit against the marked target.", "Kills only if the crowd is chanting."],
          actions: ["Eldritch Blast: +7 to hit, 2 beams, 1d10+4 force each.", "Fear: 30-ft cone, Wis save DC 15 or frightened.", "Fireball 1/match: Dex save DC 15, 8d6 fire."],
          bonusActions: ["Hex: mark one target, +1d6 necrotic per hit."],
        },
      },
      {
        name: "Halvek Drumm",
        guild: "Mercantile League",
        role: "Mercenary killer 5",
        level: "5",
        ac: "16",
        hp: "54",
        speed: "30 ft",
        attack: "Multiattack: 2 Greatsword attacks, +7 to hit, 2d6+4 slashing each; Handaxe +7, 1d6+4 slashing, range 20/60",
        economy: "Action: Multiattack. Bonus: none. Reaction: none. Burst: Action Surge for one extra Multiattack once per match.",
        signature: ["Brutal Finish 1/match: +2d6 vs bloodied foe", "Action Surge 1/match", "Never slows down"],
        run: "Closes distance, makes two greatsword attacks, and uses Action Surge for four total swings when someone is bloodied or trapped.",
        kill: "Lethal. He is the one who actually means it.",
        statBlock: {
          abilities: "Str 18, Dex 12, Con 16, Int 10, Wis 12, Cha 13",
          saves: "Str +7, Con +6",
          skills: "Athletics +7, Intimidation +4, Survival +4",
          senses: "Passive Perception 11",
          traits: ["Action Surge 1/match grants one extra action.", "Brutal Finish 1/match adds +2d6 damage against a bloodied target.", "Never slows down; he keeps pressure after a drop."],
          actions: ["Multiattack: two greatsword attacks.", "Greatsword: +7 to hit, reach 5 ft, 2d6+4 slashing.", "Handaxe: +7 to hit, range 20/60 ft, 1d6+4 slashing.", "Action Surge 1/match: take one extra Multiattack for four total swings that turn."],
        },
      },
      {
        name: "Pera Goldleaf",
        guild: "Mercantile League",
        role: "Duelist 4",
        level: "4",
        ac: "17",
        hp: "40",
        speed: "30 ft",
        attack: "Rapier +6, 1d8+4 piercing",
        signature: ["Feint 1/match gives advantage", "Fancy Footwork", "Blue sigil bait"],
        run: "Talks like she is buying the match, then wins it with footwork and a perfect opening.",
        kill: "Nonlethal. She wants profit and applause, not bodies.",
      },
      {
        name: "Tivan Roost",
        guild: "Mercantile League",
        role: "Rogue 4",
        level: "4",
        ac: "15",
        hp: "38",
        speed: "30 ft",
        attack: "Daggers +6, 1d4+4 piercing plus 2d6 Sneak Attack",
        signature: ["Poison Vial 1/match adds 1d6 poison", "Sneak Attack", "Punishes embarrassment"],
        run: "Exploits openings and gets mean if publicly humiliated.",
        kill: "Conditional. He may go too far if the room laughs at him.",
      },
      {
        name: "Rilla Quen",
        guild: "Mercantile League",
        role: "Crossbow ace 5",
        level: "5",
        ac: "16",
        hp: "46",
        speed: "30 ft",
        attack: "Multiattack: 2 Hand Crossbow shots, +7 to hit, 1d6+4 piercing each; Dagger +7, 1d4+4 piercing",
        economy: "Action: Multiattack. Bonus: Quick Step after shooting. Reaction: Cover Shot 1/match.",
        signature: ["Cover Shot 1/match imposes disadvantage", "Quick Step: move 10 ft after making a ranged attack", "Pinning Shot 1/match: target speed -10 ft until her next turn"],
        run: "Starts at max range, fires twice, then Quick Steps behind cover or out of charge range. Uses Pinning Shot on the first melee threat trying to close and Cover Shot when a dangerous hit would land.",
        kill: "Nonlethal. She is mean, not murderous.",
        statBlock: {
          abilities: "Str 9, Dex 18, Con 14, Int 12, Wis 14, Cha 11",
          saves: "Dex +7, Wis +5",
          skills: "Acrobatics +7, Perception +5, Stealth +7",
          senses: "Passive Perception 15",
          traits: ["Quick Step lets her move 10 ft after making a ranged attack.", "Pinning Shot 1/match reduces target speed by 10 ft until her next turn.", "Cover Shot 1/match imposes disadvantage on a dangerous attack."],
          actions: ["Multiattack: two hand crossbow shots.", "Hand Crossbow: +7 to hit, range 30/120 ft, 1d6+4 piercing.", "Dagger: +7 to hit, reach 5 ft or range 20/60 ft, 1d4+4 piercing.", "Pinning Shot 1/match: on hit, target speed -10 ft until her next turn."],
          bonusActions: ["Quick Step after shooting."],
          reactions: ["Cover Shot 1/match: impose disadvantage."],
        },
      },
      {
        name: "Corso Vane",
        guild: "Mercantile League",
        role: "Gambler mage 4",
        level: "4",
        ac: "13",
        hp: "36",
        speed: "30 ft",
        attack: "Dagger +4, 1d4+2 piercing",
        spellSlots: "1st: 4, 2nd: 3",
        signature: ["Bane", "Command", "Sleep 1/fight"],
        run: "Tilts the field, steals tempo, and only finishes someone if the wager turns ugly.",
        kill: "Conditional. He can be made vicious if the scene rewards it.",
      },
      {
        name: "Sable Marr",
        guild: "Mercantile League",
        role: "Shield brawler 5",
        level: "5",
        ac: "19",
        hp: "58",
        speed: "30 ft",
        attack: "Multiattack: Shield Bash +7, 1d6+5 bludgeoning, then Shortsword +7, 1d6+5 piercing; Throwing Dagger +7, 1d4+5 piercing, range 20/60",
        economy: "Action: Multiattack. Bonus: Guard Step after being missed or Shield Wall when focused. Reaction: none.",
        signature: ["Guard Step 1/match: move 10 ft without provoking after an enemy misses her", "Shield Wall 1/match: +2 AC until her next turn", "Shield Bash can shove 5 ft on hit"],
        run: "Opens with Shield Wall if she expects focus fire, then bashes to shove enemies out of position and follows with shortsword damage. If a melee attacker misses, Guard Step resets her spacing and forces them to spend movement catching her.",
        kill: "Conditional. She does not chase kills, but she absolutely will punish anyone who overextends.",
        statBlock: {
          abilities: "Str 18, Dex 12, Con 16, Int 11, Wis 13, Cha 12",
          saves: "Str +7, Con +6",
          skills: "Athletics +7, Insight +4, Intimidation +4",
          senses: "Passive Perception 11",
          traits: ["Shield Wall 1/match gives +2 AC until her next turn.", "Guard Step 1/match moves 10 ft without provoking after an enemy misses her.", "Shield Bash can shove the target 5 ft on hit."],
          actions: ["Multiattack: Shield Bash, then shortsword.", "Shield Bash: +7 to hit, 1d6+5 bludgeoning and can shove 5 ft.", "Shortsword: +7 to hit, 1d6+5 piercing.", "Throwing Dagger: +7 to hit, range 20/60 ft, 1d4+5 piercing."],
          bonusActions: ["Shield Wall 1/match.", "Guard Step 1/match after an enemy misses her."],
        },
      },
    ],
  },
];

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function fallbackEconomy(f: Fighter) {
  const role = f.role.toLowerCase();
  if (role.includes("fighter")) return "Actions: 1. Bonus: usually none. Reaction: none. Burst: one or two limited maneuvers, depending on the fighter.";
  if (role.includes("monk")) return "Actions: 1. Bonus: ki move or Flurry. Reaction: none. Burst: limited ki, usually spent on control.";
  if (role.includes("paladin")) return "Actions: 1. Bonus: Lay on Hands when needed. Reaction: none. Burst: limited smites and healing pool.";
  if (role.includes("ranger")) return "Actions: 1. Bonus: Hunter's Mark setup or movement tricks. Reaction: none. Burst: steady, not explosive.";
  if (role.includes("bard")) return "Actions: 1. Bonus: Healing Word or utility. Reaction: Cutting Words. Burst: one control spell when it matters.";
  if (role.includes("cleric")) return "Actions: 1. Bonus: Healing Word or Spiritual Weapon setup. Reaction: none. Burst: one big support/control spell at a time.";
  if (role.includes("wizard")) return "Actions: 1. Bonus: Misty Step if needed. Reaction: Shield. Burst: one strong spell plus defensive setup.";
  if (role.includes("rogue")) return "Actions: 1. Bonus: Disengage, Hide, or setup. Reaction: none. Burst: Sneak Attack once per turn when positioned well.";
  if (role.includes("barbarian")) return "Actions: 1. Bonus: none. Reaction: none. Burst: Rage 1/match.";
  if (role.includes("artificer")) return "Actions: 1. Bonus: device setup. Reaction: none. Burst: one gadget or blast per match.";
  if (role.includes("battlemage") || role.includes("mage")) return "Actions: 1. Bonus: none or reposition. Reaction: maybe Shield. Burst: one control or damage spell at a time.";
  return "Actions: 1. Bonus: none. Reaction: none. Burst: limited-use signature moves.";
}

function signatureNote(sig: string) {
  const text = sig.toLowerCase();
  if (text.includes("multiattack")) return "2 attacks on one action.";
  if (text.includes("action surge")) return "1 extra action, 1/match.";
  if (text.includes("second wind")) return "Bonus action heal, 1/match.";
  if (text.includes("reckless attack")) return "Advantage on his attacks; attacks against him have advantage until his next turn.";
  if (text.includes("blood roar")) return "Once per match, add +1d12 damage against a bloodied target.";
  if (text.includes("rage")) return "Bonus action, 1/match; +2 damage and 10 temporary HP.";
  if (text.includes("flurry of blows")) return "Bonus action, 2 extra unarmed strikes.";
  if (text.includes("stunning strike")) return "On hit, CON save or stunned.";
  if (text.includes("step of the wind")) return "Bonus action Dash or Disengage.";
  if (text.includes("divine smite")) return "On hit, +2d8 radiant.";
  if (text.includes("lay on hands")) return "Healing pool, 10 HP total.";
  if (text.includes("hunter's mark")) return "Bonus action, concentration, +1d6 per hit.";
  if (text.includes("cutting words")) return "Reaction, subtract 1d6 from a roll.";
  if (text.includes("healing word")) return "Bonus action heal, 60 ft, 1d4+mod.";
  if (text.includes("guiding bolt")) return "Ranged spell attack, 4d6 radiant, next hit gains advantage.";
  if (text.includes("hold person")) return "Wis save or humanoid paralyzed.";
  if (text.includes("bless")) return "Concentration, up to 3 allies get +1d4 to attacks and saves.";
  if (text.includes("spiritual weapon")) return "Bonus action attack, 60 ft, 1d8+4 force.";
  if (text.includes("mirror image")) return "Creates 3 copies; attacks can hit a copy instead.";
  if (text.includes("shield wall")) return "+2 AC until her next turn, once per match.";
  if (text.includes("shield bash")) return "On hit, can shove the target 5 ft.";
  if (text.includes("shield")) return "Reaction, +5 AC until start of next turn.";
  if (text.includes("misty step")) return "Bonus action teleport, 30 ft.";
  if (text.includes("overchannel spark")) return "Once per match, one Scorching Ray ray deals 12 fire instead of rolling.";
  if (text.includes("scorching ray")) return "3 rays, each 2d6 fire, ranged spell attack.";
  if (text.includes("fear")) return "30-ft cone, Wis save, frightened; drop held items and run.";
  if (text.includes("fireball")) return "20-ft radius, 150-ft range, 8d6 fire, Dex save half.";
  if (text.includes("hex")) return "Bonus action, 90 ft, concentration, +1d6 per hit.";
  if (text.includes("precast aid")) return "The +10 HP is already baked into his stat block.";
  if (text.includes("sanctuary reset")) return "Once per match, use Sanctuary to force a breathing turn.";
  if (text.includes("sanctuary")) return "Bonus action ward; attackers must Wis save first.";
  if (text.includes("warding flare")) return "Twice per match, impose disadvantage on an attack he can see.";
  if (text.includes("aid at 3rd")) return "3 creatures gain +10 max HP and current HP.";
  if (text.includes("aid")) return "3 creatures, +5 max HP and current HP at 2nd level.";
  if (text.includes("moonbeam")) return "5-ft radius, 120 ft, 2d10 radiant, Con save half.";
  if (text.includes("command")) return "Wis save or obey a one-word order.";
  if (text.includes("sleep")) return "Affects up to 5d8 HP of weak targets, no save.";
  if (text.includes("bane")) return "3 targets, Wis save, -1d4 to attacks and saves.";
  if (text.includes("mind sliver")) return "Psychic chip damage; next save is weakened.";
  if (text.includes("detect thoughts")) return "Reads surface thoughts; no damage.";
  if (text.includes("tasha")) return "Wis save or target wastes turns laughing.";
  if (text.includes("thunderwave")) return "15-ft cube, 2d8 thunder, Con save, push 10 ft.";
  if (text.includes("radiant rebuke")) return "When hit, attacker takes 1d8 radiant.";
  if (text.includes("shield of faith")) return "Bonus action, concentration, +2 AC.";
  if (text.includes("cover shot")) return "Ranged shot used as support from safety.";
  if (text.includes("quick step")) return "After shooting, move 10 ft without spending the main action.";
  if (text.includes("pinning shot")) return "On hit, reduce target speed by 10 ft until her next turn.";
  if (text.includes("feint")) return "Advantage on the next attack against the target.";
  if (text.includes("fancy footwork")) return "Move away after attacking without provoking from that target.";
  if (text.includes("poison vial")) return "Next hit adds 1d6 poison.";
  if (text.includes("guard step")) return "Avoid one melee hit or reposition defensively.";
  if (text.includes("brutal finish")) return "Against bloodied target, +2d6 damage.";
  if (text.includes("trip attack")) return "On hit, target saves or falls prone.";
  if (text.includes("precision attack")) return "Add 1d8 to a hit roll after seeing the roll.";
  if (text.includes("disarming attack")) return "On hit, target saves or drops held weapon.";
  if (text.includes("defensive stance")) return "+2 AC for a round.";
  if (text.includes("repairing breath")) return "Heals 8 HP once per match.";
  if (text.includes("heat burst")) return "Adds 1d6 fire to the hit, 1/match.";
  return "Mechanical detail not listed.";
}

function openingMove(f: Fighter) {
  const name = f.name.toLowerCase();
  const role = f.role.toLowerCase();

  if (name === "tharos blackvein") return "Walks straight in and starts trading hits with the closest target.";
  if (name === "halvek drumm") return "Closes fast, swings hard, and tries to break someone early.";
  if (name === "nyx amberline") return "Opens at range with Hex or Fear; Fireball only if it can swing the room.";
  if (name === "sister halwen") return "Sets up Spiritual Weapon or control first, then supports whoever is exposed.";
  if (name === "captain elric stone") return "Advances in a clean line and keeps the fight honorable.";
  if (name === "sable marr") return "Uses Shield Wall if she is about to be focused, then Shield Bashes to shove the first melee threat out of position.";
  if (name === "prom") return "If entered as a PC, treat as player-driven; otherwise he goes in hard and stays aggressive.";
  if (role.includes("fighter")) return "Moves into the cleanest lane and starts trading attacks.";
  if (role.includes("monk")) return "Looks for a stun, then resets before the room can answer.";
  if (role.includes("paladin")) return "Advances with the line and saves smite for the first real opening.";
  if (role.includes("ranger")) return "Starts at range and keeps kiting while the mark is active.";
  if (role.includes("bard")) return "Taunts, disrupts, and saves the real control for the important turn.";
  if (role.includes("cleric")) return "Bless or Healing Word first, damage only when the room is stable.";
  if (role.includes("wizard")) return "Mirror Image or Shield first, then spell damage from safety.";
  if (role.includes("rogue")) return "Hides or feints, then goes after an isolated target.";
  if (role.includes("barbarian")) return "Rages and charges the nearest enemy.";
  if (role.includes("artificer")) return "Sets up the field before trading shots.";
  if (role.includes("warlock")) return "Hexes first, then pressures the strongest target from range.";
  return "Opens with the safest version of their best move.";
}

function priorityTarget(f: Fighter) {
  const kill = f.kill.toLowerCase();
  const role = f.role.toLowerCase();

  if (kill.includes("lethal")) return "Priority: bloodied or isolated targets. They try to finish once someone is exposed.";
  if (kill.includes("conditional")) return "Priority: the biggest threat first, then anyone bloodied if the room gets loud.";
  if (role.includes("cleric")) return "Priority: keep allies up and punish overextension; they stop chasing once the target is down.";
  if (role.includes("wizard") || role.includes("warlock")) return "Priority: clustered enemies or the single most dangerous target at range.";
  if (role.includes("rogue") || role.includes("ranger")) return "Priority: isolated backliners, wounded targets, or anyone standing alone.";
  if (role.includes("monk")) return "Priority: the softest target they can reach without getting pinned.";
  if (role.includes("paladin")) return "Priority: whoever is in the line and whoever is already bloodied.";
  if (role.includes("barbarian")) return "Priority: the nearest threat, then the next nearest if the first one drops.";
  return "Priority: the target that best fits their role and keeps their side stable.";
}

function reactionLine(f: Fighter) {
  const sigs = f.signature.join(" ").toLowerCase();
  const econ = (f.economy ?? "").toLowerCase();
  const combo = `${sigs} ${econ}`;

  if (combo.includes("cutting words")) return "Reaction: Cutting Words to blunt an attack, check, or damage roll.";
  if (combo.includes("shield")) return "Reaction: Shield for +5 AC until the start of their next turn.";
  if (combo.includes("radiant rebuke")) return "Reaction: Radiant Rebuke to burn a creature that hits them.";
  if (combo.includes("cover shot")) return "Reaction: use cover fire to punish a reckless advance or protect an ally.";
  if (combo.includes("guard step")) return "Reaction: slip away from one melee hit or reset position.";
  if (combo.includes("defensive stance")) return "Reaction: none; their defense is handled by the stance itself.";
  if (combo.includes("second wind")) return "Reaction: none; Second Wind is a bonus-action self-heal.";
  if (combo.includes("action surge")) return "Reaction: none; Action Surge is their burst, not a reaction.";
  if (combo.includes("mirror image")) return "Reaction: none; Mirror Image is their defensive setup.";
  if (combo.includes("sanctuary")) return "Reaction: none; Sanctuary is a preemptive ward.";
  return "Reaction: none or not worth tracking unless the scene is going badly.";
}

export default function GuildGamesRosterPage() {
  const router = useRouter();
  const { dmMode } = useDmMode();

  useEffect(() => {
    if (!dmMode) router.replace("/");
  }, [dmMode, router]);

  if (!dmMode) return null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="text-sm uppercase tracking-[0.24em] text-black/50 dark:text-white/50">DM ONLY</div>
        <h1 className="text-3xl font-semibold tracking-tight">Guild Games Combat Roster</h1>
        <p className="max-w-3xl text-black/70 dark:text-white/70">
          Use this as the at-the-table combat reference. The roster is tuned so you can tell at a glance who tends
          to finish a fight and who stops at defeat.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Lethal</div>
          <div className="mt-1 text-lg font-semibold">Will try to kill if they can</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Conditional</div>
          <div className="mt-1 text-lg font-semibold">Can become lethal under pressure</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Nonlethal</div>
          <div className="mt-1 text-lg font-semibold">Stops at defeat unless the scene breaks</div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold tracking-tight">Rules cheat sheet</h2>
        <p className="mt-1 text-sm text-black/70 dark:text-white/70">
          These are the only mechanics you need to run the roster without looking anything up.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            "Multiattack means the creature uses its Attack action and swings twice.",
            "Action Surge gives a fighter one extra action once per match.",
            "Second Wind is a self-heal once per match.",
            "Rage gives the barbarian extra damage and makes them tougher. They usually get meaner when the crowd hypes them up.",
            "Flurry of Blows lets a monk make two extra unarmed strikes as a bonus action after they attack.",
            "Stunning Strike forces a Constitution save. Fail and the target is stunned, which is a very big deal.",
            "Step of the Wind lets the monk Dash or Disengage as a bonus action.",
            "Divine Smite is extra radiant damage on a weapon hit. Use it when the paladin lands something important.",
            "Lay on Hands is a healing pool the paladin can spend in chunks.",
            "Hunter's Mark is a bonus-action mark that adds 1d6 damage to attacks against the target.",
            "Cutting Words lets the bard subtract a die from an enemy's attack, check, or damage roll.",
            "Healing Word is a bonus-action ranged heal. It is the fastest way to pick someone up.",
            "Guiding Bolt is a ranged radiant attack that also makes the next hit against the target easier.",
            "Hold Person forces a Wisdom save. Fail and a humanoid becomes paralyzed, which can end a fight fast.",
            "Bless adds a d4 to attacks and saving throws for allies.",
            "Spiritual Weapon is a floating weapon that keeps attacking as a bonus action every round.",
            "Mirror Image creates fake duplicates so attacks can miss the copies instead of the wizard.",
            "Shield is a reaction that spikes AC for a round and can save a fragile caster.",
            "Misty Step is a bonus-action teleport up to 30 feet.",
            "Scorching Ray is a spell attack that fires multiple rays, so it is good for focus fire.",
            "Fear makes creatures drop what they are holding and run if they fail the save.",
            "Fireball is a big burst of fire damage in an area. It is the 'no more subtlety' button.",
            "Hex adds damage over time to one target, but it needs concentration.",
            "Sanctuary makes it hard to attack the protected target unless the attacker passes a Wisdom save.",
            "Aid raises multiple allies' max HP and current HP at once.",
            "Moonbeam is radiant area damage that punishes movement through a lane.",
            "Command forces a one-word order on a failed Wisdom save.",
            "Sleep drops low-HP creatures unconscious, so it is best used to finish or disable the weak.",
            "Bane makes enemies worse at attacks and saving throws. It is a slow pressure spell.",
            "Mind Sliver is psychic chip damage that also makes the target worse at its next save.",
            "Detect Thoughts reads surface thoughts. It is for information, not damage.",
            "Tasha's Hideous Laughter makes a target fall over laughing and waste turns if it fails the save.",
            "Thunderwave is a close-range blast that pushes enemies away.",
            "Radiant Rebuke is a reaction-style punishment when the exorcist gets hit.",
            "Shield of Faith gives a target +2 AC while concentration holds.",
            "Command and Hold Person are control tools. They do not kill by themselves, but they can open a target for someone else."
          ].map((line) => (
            <div key={line} className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
              {line}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold tracking-tight">Move reference</h2>
        <p className="mt-1 text-sm text-black/70 dark:text-white/70">
          Every attack, spell, and special move used on this page has a one-line explanation here.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Greatsword:</span> heavy two-handed blade, good for straightforward damage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Longsword:</span> balanced melee blade for reliable hits.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Spear:</span> reach weapon that keeps people at arm&apos;s length.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Mace:</span> blunt weapon for simple, steady pressure.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Warhammer:</span> heavy blunt strike that hits hard and feels committed.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Greataxe:</span> large, brutal swing for raw damage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Shield Bash:</span> shield hit that can shove or knock a target off balance.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Shortsword:</span> quick close-range blade for agile pressure.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Rapier:</span> precise fencing blade that rewards positioning.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Unarmed Strike:</span> a punch, elbow, or knee. Fast and repeatable.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Battleaxe:</span> an axe that trades finesse for hard damage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Light crossbow:</span> ranged shot for steady, ordinary damage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Hand crossbow:</span> smaller ranged shot for mobile pressure.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Dagger:</span> light blade for stabbing, throwing, or dirty work.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Maul:</span> two-handed hammer for smashing someone flat.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Quarterstaff:</span> simple staff used for balance and disruption.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Longbow:</span> ranged weapon for safe pressure from afar.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Spiritual Weapon:</span> floating divine weapon that attacks on its own each round.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Guiding Bolt:</span> radiant blast that makes the target easier to hit next.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Hold Person:</span> control spell that can paralyze a humanoid target.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Healing Word:</span> fast ranged heal you can use as a bonus action.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Bless:</span> support spell that boosts allies&apos; attacks and saves.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Mirror Image:</span> creates fake copies to soak enemy attacks.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Shield:</span> reaction that spikes AC for a round and can cancel a hit.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Misty Step:</span> short teleport that gets a caster out of danger.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Scorching Ray:</span> multi-ray fire spell for focus fire.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Hunter&apos;s Mark:</span> bonus damage to one marked target.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Cutting Words:</span> bardic interruption that subtracts from an enemy roll.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Divine Smite:</span> extra radiant damage added after a weapon hit lands.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Lay on Hands:</span> paladin healing pool spent in chunks as needed.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Flurry of Blows:</span> monk bonus action for two extra unarmed strikes.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Stunning Strike:</span> monk hit that can stun if the target fails the save.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Step of the Wind:</span> monk movement tool for Dash or Disengage as a bonus action.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Action Surge:</span> fighter burst that gives one extra action for the match.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Second Wind:</span> fighter self-heal once per match.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Rage:</span> barbarian mode that increases durability and usually damage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Trip Attack:</span> maneuver that knocks the target prone.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Precision Attack:</span> maneuver that helps a missed attack connect.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Disarming Attack:</span> maneuver that can knock a weapon away.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Defensive Stance:</span> temporary defense boost that makes the fighter harder to hit.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Thunderwave:</span> close-range burst that damages and pushes enemies back.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Cunning Device:</span> a gadget or setup that creates cover or battlefield advantage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Heat Burst:</span> forge-style heat surge that adds fire damage.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Repairing Breath:</span> quick in-combat reset that restores a bit of HP.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Moonbeam:</span> radiant lane spell that punishes movement through it.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Sanctuary:</span> ward that makes attacking the target much harder.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Aid:</span> group buff that raises allies&apos; current and max HP.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Command:</span> one-word force spell that can make a target waste a turn.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Radiant Rebuke:</span> a punishment effect that burns someone who hits the exorcist.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Bane:</span> debuff spell that makes a target worse at attacks and saves.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Sleep:</span> low-HP shutdown spell that drops weak targets unconscious.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Hex:</span> damage rider that adds extra hurt to one target.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Fear:</span> panic spell that makes enemies drop focus and run.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Fireball:</span> big area blast, the obvious &apos;enough subtlety&apos; spell.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Mind Sliver:</span> psychic chip damage that weakens the target&apos;s next save.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Detect Thoughts:</span> utility spell for reading surface thoughts and motives.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Tasha&apos;s Hideous Laughter:</span> control spell that makes a target waste turns laughing.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Cover Shot:</span> a defensive ranged shot that helps keep the user alive.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Feint:</span> a fake-out that makes the next attack easier to land.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Fancy Footwork:</span> move cleanly after striking so the enemy cannot punish you as easily.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Poison Vial:</span> a one-use poison add-on that makes one hit more dangerous.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Guard Step:</span> a defensive reposition that helps avoid a hit.
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3 text-sm text-black/75 dark:bg-white/5 dark:text-white/75">
            <span className="font-medium">Brutal Finish:</span> extra damage against someone who is already bloodied.
          </div>
        </div>
      </section>

      {roster.map((guild) => (
        <section key={guild.label} className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{guild.label}</h2>
            <p className="mt-1 text-sm text-black/65 dark:text-white/65">{guild.note}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {guild.fighters.map((f) => (
              <article
                key={f.name}
                className={classNames(
                  "rounded-3xl border p-5 shadow-sm",
                  "border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-black/60 dark:text-white/60">{f.guild}</div>
                    <h3 className="text-xl font-semibold tracking-tight">{f.name}</h3>
                    <div className="mt-1 text-sm text-black/65 dark:text-white/65">{f.role}</div>
                  </div>
                  <div className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-black/55 dark:border-white/10 dark:text-white/55">
                    {f.kill}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                  <div className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/5">
                    <div className="text-black/50 dark:text-white/50">Level</div>
                    <div className="font-medium">{f.level}</div>
                  </div>
                  <div className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/5">
                    <div className="text-black/50 dark:text-white/50">AC</div>
                    <div className="font-medium">{f.ac}</div>
                  </div>
                  <div className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/5">
                    <div className="text-black/50 dark:text-white/50">HP</div>
                    <div className="font-medium">{f.hp}</div>
                  </div>
                  <div className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/5">
                    <div className="text-black/50 dark:text-white/50">Speed</div>
                    <div className="font-medium">{f.speed}</div>
                  </div>
                  {f.spellSlots ? (
                    <div className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/5 md:col-span-2">
                      <div className="text-black/50 dark:text-white/50">Spell slots</div>
                      <div className="font-medium">{f.spellSlots}</div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Action economy</div>
                    <div className="text-black/70 dark:text-white/70">{f.economy ?? fallbackEconomy(f)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Open</div>
                    <div className="text-black/70 dark:text-white/70">{openingMove(f)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Priority</div>
                    <div className="text-black/70 dark:text-white/70">{priorityTarget(f)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Reaction</div>
                    <div className="text-black/70 dark:text-white/70">{reactionLine(f)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Attack</div>
                    <div className="text-black/70 dark:text-white/70">{f.attack}</div>
                  </div>
                  {f.statBlock ? (
                    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="font-medium">Stat block</div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <div>
                          <div className="text-black/50 dark:text-white/50">Abilities</div>
                          <div className="text-black/75 dark:text-white/75">{f.statBlock.abilities}</div>
                        </div>
                        <div>
                          <div className="text-black/50 dark:text-white/50">Saves</div>
                          <div className="text-black/75 dark:text-white/75">{f.statBlock.saves}</div>
                        </div>
                        <div>
                          <div className="text-black/50 dark:text-white/50">Skills</div>
                          <div className="text-black/75 dark:text-white/75">{f.statBlock.skills}</div>
                        </div>
                        <div>
                          <div className="text-black/50 dark:text-white/50">Senses</div>
                          <div className="text-black/75 dark:text-white/75">{f.statBlock.senses}</div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="text-black/50 dark:text-white/50">Traits</div>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-black/75 dark:text-white/75">
                            {f.statBlock.traits.map((trait) => (
                              <li key={trait}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-black/50 dark:text-white/50">Actions</div>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-black/75 dark:text-white/75">
                            {f.statBlock.actions.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ul>
                        </div>
                        {f.statBlock.bonusActions?.length ? (
                          <div>
                            <div className="text-black/50 dark:text-white/50">Bonus actions</div>
                            <ul className="mt-1 list-disc space-y-1 pl-5 text-black/75 dark:text-white/75">
                              {f.statBlock.bonusActions.map((action) => (
                                <li key={action}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {f.statBlock.reactions?.length ? (
                          <div>
                            <div className="text-black/50 dark:text-white/50">Reactions</div>
                            <ul className="mt-1 list-disc space-y-1 pl-5 text-black/75 dark:text-white/75">
                              {f.statBlock.reactions.map((reaction) => (
                                <li key={reaction}>{reaction}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <div className="font-medium">Signature mechanics</div>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-black/70 dark:text-white/70">
                      {f.signature.map((s) => (
                        <li key={s}>
                          <span className="font-medium text-black dark:text-white">{s}</span>
                          <span className="ml-2 text-black/60 dark:text-white/60">- {signatureNote(s)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Turn script</div>
                    <div className="mt-1 text-black/70 dark:text-white/70">{f.run}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
