import TrackerCore from "./libs/core";

class Tracker {

  constructor() {
    this.coreInstance     = null;
    this.isBrowser        = typeof window !== 'undefined' && typeof document !== 'undefined';
    this.appIdentifier    = null;
    this.trackerEndpoint  = null;
  }

  initInstance(appIdentifier, trackerEndpoint, initialParams) {
    console.log("cp1");
    if ( !this.isBrowser ) {
      return;
    }
    console.log("cp1.a");
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

  getCoreClass() {
    return TrackerCore;
  }
}

export default new Tracker();
