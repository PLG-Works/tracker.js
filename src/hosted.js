import PlgTracker from "./index";
if ( typeof window !== 'undefined') {
  const queuedSignals = window.PlgTracker && window.PlgTracker._q;
  if ( queuedSignals && queuedSignals.length ) {
    for( let cnt = 0; cnt < queuedSignals.length; cnt++ ) {
      const signal = queuedSignals[ cnt ];
      const args = signal.a || [];
      PlgTracker[ signal.m ](...args);
    }
  }
  window.PlgTracker = PlgTracker;
}
