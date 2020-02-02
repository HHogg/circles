/* eslint-disable @typescript-eslint/no-explicit-any */
interface Action {
  undo: () => void;
  redo: () => void;
}

interface Store {
  history: Action[];
  future: Action[];
}

type ChangeHandler = (state: { canUndo: boolean; canRedo: boolean }) => void;

const MAX_TRACK = 100;

export default class EditorHistory {
  onChange: ChangeHandler
  store: Store

  constructor(onChange: ChangeHandler) {
    this.onChange = onChange;
    this.store = {
      history: [],
      future: [],
    };
  }

  handleOnChange() {
    this.onChange({
      canUndo: !!this.store.history.length,
      canRedo: !!this.store.future.length,
    });
  }

  commit() {
    this.store = {
      history: [],
      future: [],
    };

    this.handleOnChange();
  }

  push(actions: Action) {
    this.store.future = [];
    this.store.history.push(actions);

    if (this.store.history.length > MAX_TRACK) {
      this.store.history = this.store.history.slice(MAX_TRACK * -1);
    }

    this.handleOnChange();
  }

  pop() {
    const actions = this.store.history.pop();

    if (actions) {
      this.store.future.push(actions);
      this.handleOnChange();
      actions.undo();
    }
  }

  replay() {
    const actions = this.store.future.pop();

    if (actions){
      this.store.history.push(actions);
      this.handleOnChange();
      actions.redo();
    }
  }
}
