/**
 * @internal
 */
export class Queue<TValue> implements Iterable<TValue> {
  protected head: QueueNode<TValue> | undefined = undefined;
  protected tail: QueueNode<TValue> | undefined = undefined;
  protected _size = 0;

  constructor(values?: TValue[]) {
    for (const value of values ?? []) {
      this.enqueue(value);
    }
  }

  enqueue(value: TValue) {
    const node = new QueueNode(value);

    if (this.head) {
      this.tail && (this.tail.next = node);
      this.tail = node;
      this._size++;

      return;
    }

    this.head = node;
    this.tail = node;
    this._size++;
  }

  dequeue(): TValue | undefined {
    const current = this.head;
    if (!current) return;

    this.head = this.head?.next;
    this._size--;
    return current.value;
  }

  clear() {
    this.head = undefined;
    this.tail = undefined;
    this._size = 0;
  }

  get size() {
    return this._size;
  }

  *[Symbol.iterator]() {
    let current = this.head;

    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

/**
 * @internal
 */
export class QueueNode<TValue> {
  value: TValue;
  next: QueueNode<TValue> | undefined = undefined;

  constructor(value: TValue) {
    this.value = value;
  }
}
