export type ObservePayload<THTMLElement extends HTMLElement> = {
  el: THTMLElement;
  waitFor: (subscriber: WaitForSubscriber) => Promise<void>;
  observer: MutationObserver;
};

export type WaitForSubscriber = (el: HTMLElement) => boolean;

export const observe = <THTMLElement extends HTMLElement>(
  el: THTMLElement,
): ObservePayload<THTMLElement> => {
  const waitForSubscribers: {
    subscriber: WaitForSubscriber;
    onDone: () => void;
  }[] = [];

  const observer = new MutationObserver(() => {
    waitForSubscribers.forEach((waitForSubscriber) => {
      const isDone = waitForSubscriber.subscriber(el);
      if (isDone) waitForSubscriber.onDone();
    });
  });

  observer.observe(el, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  return {
    el,
    observer,
    waitFor: (subscriber: WaitForSubscriber) => {
      return new Promise<void>((resolve) => {
        const index = waitForSubscribers.length;

        waitForSubscribers.push({
          subscriber,
          onDone: () => {
            waitForSubscribers.splice(index, 1);
            resolve();
          },
        });

        const isDone = subscriber(el);
        if (isDone) {
          waitForSubscribers.splice(index, 1);
          resolve();
        }
      });
    },
  };
};
