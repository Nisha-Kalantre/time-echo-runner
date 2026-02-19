import { Level } from './types';

export const levels: Level[] = [
  {
    name: 'First Steps',
    width: 900, height: 500,
    platforms: [
      { x: 0, y: 450, w: 280, h: 50 },
      { x: 330, y: 400, w: 100, h: 16 },
      { x: 480, y: 360, w: 120, h: 16 },
      { x: 650, y: 450, w: 250, h: 50 },
    ],
    switches: [],
    doors: [],
    lasers: [],
    collectibles: [
      { x: 360, y: 370, w: 16, h: 16, collected: false },
      { x: 520, y: 330, w: 16, h: 16, collected: false },
    ],
    goal: { x: 830, y: 400, w: 40, h: 48 },
    playerStart: { x: 50, y: 410 },
    maxClones: 2,
    cloneInterval: 600,
  },
  {
    name: 'Clone Duty',
    width: 1100, height: 500,
    platforms: [
      { x: 0, y: 450, w: 500, h: 50 },
      { x: 600, y: 450, w: 500, h: 50 },
    ],
    switches: [
      { x: 250, y: 430, w: 32, h: 20, id: 's1', activated: false },
    ],
    doors: [
      { x: 620, y: 150, w: 20, h: 300, switchId: 's1', open: false },
    ],
    lasers: [],
    collectibles: [
      { x: 400, y: 420, w: 16, h: 16, collected: false },
      { x: 800, y: 420, w: 16, h: 16, collected: false },
    ],
    goal: { x: 1000, y: 400, w: 40, h: 48 },
    playerStart: { x: 50, y: 410 },
    maxClones: 2,
    cloneInterval: 600,
  },
  {
    name: 'Laser Dodge',
    width: 1200, height: 500,
    platforms: [
      { x: 0, y: 450, w: 400, h: 50 },
      { x: 450, y: 400, w: 80, h: 16 },
      { x: 580, y: 450, w: 300, h: 50 },
      { x: 930, y: 450, w: 270, h: 50 },
    ],
    switches: [
      { x: 300, y: 430, w: 32, h: 20, id: 's1', activated: false },
    ],
    doors: [],
    lasers: [
      { x: 520, y: 280, w: 60, h: 170, switchId: 's1' },
    ],
    collectibles: [
      { x: 470, y: 370, w: 16, h: 16, collected: false },
      { x: 700, y: 420, w: 16, h: 16, collected: false },
      { x: 1050, y: 420, w: 16, h: 16, collected: false },
    ],
    goal: { x: 1120, y: 400, w: 40, h: 48 },
    playerStart: { x: 50, y: 410 },
    maxClones: 3,
    cloneInterval: 600,
  },
  {
    name: 'Moving Ground',
    width: 1300, height: 500,
    platforms: [
      { x: 0, y: 450, w: 250, h: 50 },
      { x: 350, y: 380, w: 80, h: 16, moving: true, moveAxis: 'x', moveRange: 100, moveSpeed: 1.5, origX: 350, origY: 380, moveDir: 1 },
      { x: 550, y: 320, w: 80, h: 16, moving: true, moveAxis: 'y', moveRange: 80, moveSpeed: 1, origX: 550, origY: 320, moveDir: 1 },
      { x: 700, y: 450, w: 200, h: 50 },
      { x: 950, y: 450, w: 350, h: 50 },
    ],
    switches: [
      { x: 750, y: 430, w: 32, h: 20, id: 's1', activated: false },
    ],
    doors: [
      { x: 970, y: 150, w: 20, h: 300, switchId: 's1', open: false },
    ],
    lasers: [],
    collectibles: [
      { x: 380, y: 350, w: 16, h: 16, collected: false },
      { x: 580, y: 290, w: 16, h: 16, collected: false },
    ],
    goal: { x: 1220, y: 400, w: 40, h: 48 },
    playerStart: { x: 50, y: 410 },
    maxClones: 3,
    cloneInterval: 600,
  },
  {
    name: 'The Gauntlet',
    width: 1600, height: 500,
    platforms: [
      { x: 0, y: 450, w: 300, h: 50 },
      { x: 350, y: 380, w: 100, h: 16 },
      { x: 500, y: 450, w: 200, h: 50 },
      { x: 750, y: 400, w: 80, h: 16, moving: true, moveAxis: 'x', moveRange: 80, moveSpeed: 1.2, origX: 750, origY: 400, moveDir: 1 },
      { x: 900, y: 450, w: 300, h: 50 },
      { x: 1250, y: 450, w: 350, h: 50 },
    ],
    switches: [
      { x: 200, y: 430, w: 32, h: 20, id: 's1', activated: false },
      { x: 600, y: 430, w: 32, h: 20, id: 's2', activated: false },
      { x: 1000, y: 430, w: 32, h: 20, id: 's3', activated: false },
    ],
    doors: [
      { x: 520, y: 150, w: 20, h: 300, switchId: 's1', open: false },
      { x: 1270, y: 150, w: 20, h: 300, switchId: 's3', open: false },
    ],
    lasers: [
      { x: 870, y: 280, w: 60, h: 170, switchId: 's2' },
    ],
    collectibles: [
      { x: 380, y: 350, w: 16, h: 16, collected: false },
      { x: 550, y: 420, w: 16, h: 16, collected: false },
      { x: 950, y: 420, w: 16, h: 16, collected: false },
      { x: 1400, y: 420, w: 16, h: 16, collected: false },
    ],
    goal: { x: 1520, y: 400, w: 40, h: 48 },
    playerStart: { x: 50, y: 410 },
    maxClones: 5,
    cloneInterval: 600,
  },
];
