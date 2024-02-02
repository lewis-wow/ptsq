export class UndefinedAction extends TypeError {
  constructor() {
    super('This action is not defined.');

    this.name = this.constructor.name;

    Object.setPrototypeOf(this, UndefinedAction.prototype);
  }
}
