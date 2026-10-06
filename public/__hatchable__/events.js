window.hatchable = window.hatchable || {};
window.hatchable.events = window.hatchable.events || {
  connect() {
    return {
      channel() {
        return { on() { return this; } };
      }
    };
  }
};
