export class jinaFilters {
  static simpleFilter = class {
    _val = null;
    onSet = null;
    constructor(options = { defaultValue: null, onSet: null }) {
      this._val = options.defaultValue;
      this.onSet = options.onSet;
    }
    get val() { return this._val ?? null }
    set val(value) {
      this._val = value;
      this.onSet?.(value);
    }
  }
  static lookupFilter = class extends jinaFilters.simpleFilter {
    _params; _onSet;
    constructor(params, onSet) {
      super({ onSet: onSet });
      this._params = params;
    }
    get params() {
      return this._params
    }
  }
}
