import EventEmitter from "eventemitter3";
const emptyObject = {};
const emitter = new EventEmitter();
const capitalize = ( str ) => {
  if ( typeof str === 'string' && str.length > 0) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
}
class ObservableHistoryClass {
  constructor() {
    const oThis = this;
    oThis.originalUrl = oThis.getLocationHref();
    oThis.currentUrl  = oThis.originalPageUrl;
    console.log("addGenericEvents...");
    oThis.addGenericEvents();
    console.log("addCustomEvents...");
    oThis.addCustomEvents();
  }

  addCustomEvents() {
    const oThis = this;
    emitter.on('onBack',          oThis.checkUrlChanged, oThis);
    emitter.on('onForward',       oThis.checkUrlChanged, oThis);
    emitter.on('onGo',            oThis.checkUrlChanged, oThis);
    emitter.on('onPushState',     oThis.checkUrlChanged, oThis);
    emitter.on('onReplaceState',  oThis.checkUrlChanged, oThis);
  }

  checkUrlChanged( summary ) {
    const oThis = this;
    // Break the synchronous operation to allow browser to do stuff.
    
    setTimeout(() => {
      const href = oThis.getLocationHref();
      const fromUrl = oThis.currentUrl;
      const eventName = 'onUrlChanged';
      if( fromUrl !== href ) {
        oThis.currentUrl = href;
        console.log(`Firing ${eventName}`);
        // Href has changed.
        emitter.emit(eventName, [{
          from: fromUrl,
          to: href
        }]);
      }
    }, 200);
  }

  addGenericEvents() {
    const oThis = this;
    const historyObj = oThis.getHistory();
    for( let keyName in historyObj ) {
      let v = historyObj[ keyName ];
      
      // Find all functions
      if ( typeof v === 'function') {     
        historyObj[ keyName ] = oThis.wrapHistoryMethod( keyName, v, historyObj);
      }
    }
  }

  wrapHistoryMethod( fnName, fn, historyObj ) {
    let eventName = "on" + capitalize(fnName);
    console.log("EventName", eventName);
    let orgFn = fn;
    return (...args) => {
      let retVal = orgFn.apply( historyObj, args );
      let summary = {
        input: args,
        output: retVal
      };
      console.log(`Firing ${eventName}`);
      emitter.emit(eventName, [summary]);
      return retVal;
    };
  }

  getHistory() {
    if ( typeof history === 'undefined') {
      return emptyObject;
    }
    return history;
  }

  getLocation() {
    if ( typeof location === 'undefined') {
      return emptyObject;
    }
    return location;
  }

  getLocationHref() {
    const oThis = this;
    return oThis.getLocation().href || '';
  }
}

const ObservableHistory = new ObservableHistoryClass()
const HistoryObserver = emitter;
export default HistoryObserver;
