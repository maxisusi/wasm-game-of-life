export interface ISubject {
  /** Hydrate observers */
  update: () => void;
  /** Add observer */
  register: (object: Observer) => void;
  /** Removes observer */
  unregister: (object: Observer) => void;
}

export abstract class Subject implements ISubject {
  observerList: Observer[] = [];
  constructor() {}

  update() {
    this.observerList.forEach((o) => o.update(this));
  }

  register(obs: IObserver) {
    this.observerList.push(obs);
  }

  unregister(objs: IObserver) {
    const idx = this.observerList.findIndex((o) => o === objs);
    if (idx >= 0) {
      this.observerList.splice(idx, 1);
    }
  }
}

export interface IObserver {
  update: (object: ISubject) => void;
}

export abstract class Observer implements IObserver {
  constructor(subject: ISubject) {
    subject.register(this);
  }
  abstract update(obj: ISubject): void;
}

// USE CASE
// class ClientMovement extends Subject {
//   positon: Vector2d = new Vector2d(0, 0);
//   setNewPosition(pos: Vector2d) {
//     this.positon = pos;
//     this.update();
//   }
//
//   getPosition() {
//     return this.positon;
//   }
// }
//
// class Blocks extends Observer {
//   update(obj: ClientMovement): void {
//     const position = obj.getPosition();
//   }
// }
