import { Entity } from './entity.js';

export class DropItem extends Entity {
  constructor(x, y, item) {
    super(x, y, 5);
    this.item = item;
    this.life = 900;
  }
}