import TrackerCore from "./libs/core";
import HistoryObserver from "./libs/history"; 

class Tracker {

  constructor() {
    this.coreInstance     = null;
    this.isBrowser        = typeof window !== 'undefined' && typeof document !== 'undefined';
    this.appIdentifier    = null;
    this.trackerEndpoint  = null;
  }

  initInstance(appIdentifier, trackerEndpoint, initialParams) {
    if ( !this.isBrowser ) {
      return;
    }
    this.coreInstance = new TrackerCore(appIdentifier, trackerEndpoint, initialParams);
  }

  getInstance() {
    return this.coreInstance;
  }

  flushInstance() {
    this.coreInstance = null;
  }

  dropPixel(...args) {
    if( !this.isBrowser ) {
      return Promise.resolve(false);
    }
    return this.coreInstance.dropPixel(...args);
  }

  getHistoryObserver() {
    return HistoryObserver;
  }

  getCoreClass() {
    return TrackerCore;
  }
}

export default new Tracker();
export {HistoryObserver};