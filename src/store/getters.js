export function channels(state) {
  return state.channels.map(ch => ({
    id: ch.id,
    label: `${ch.name} - ${ch.channel}`,
    selected: state.selected.indexOf(ch.id) >= 0
  }));
}

export function selectedChannels(state) {
  return state.channels.filter(ch => state.selected.indexOf(ch.id) >= 0);
}
