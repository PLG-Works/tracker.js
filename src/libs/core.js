import UAParser from "ua-parser-js";
import cookie from "cookie_js";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const CONST = {
  TRACKER_ID: 'tid',
  SESSION_ID: 'tsid',
  SESSION_EXP_ID: 'tsid_exp',
  SESSION_DURATION: (1000 * 60 * 20) // 20 minutes
};


export default class TrackerCore {
  constructor( appIdentifier, pixelPath) {
    console.log("cp2");
    const oThis = this;
    oThis.pixelPathPrefix = pixelPath || "/pixel.png";
    oThis.paramNames      = {
      timeZoneParamName	  : "tz"
      ,eventAction		    : "ea"
      ,eventEntity        : "ee"
      ,referrerUri		    : "rurl"
      ,browserHeight      : "bh"
      ,browserWidth       : "bw"
      ,isCookieEnabled    : "ce"
      ,screenHeight		    : "dh"
      ,screenWidth	 	    : "dw"
      ,isRetina			      : "ir"
      ,screenResolution   : "dr"
      ,timeStamp          : "ts"
      ,trackerId          : "tid"
      ,trackerSesId       : "sesid"
      ,pageUrl            : "purl"
    };
    oThis.commonParamNames = ['tid', 'uid', 'sesid', 'tz', 'rurl', 'bh', 'bw', 'ce', 'dh', 'dw', 'ir', 'dr']
    oThis.deviceFingerPrint = null;
    oThis.deviceFPPromise = null;
    oThis.trackerIdPromise = null;
    oThis.precomputeParamPromise = null;
    oThis.pixelContainer = null;
    oThis.precomputedParams = "";
    // oThis.initParams = {
    //   'ai' : appIdentifier
    // };

    oThis.uaParser = new UAParser();
    console.log("cp2.a");
    oThis.init();
  }

  init() {
    const oThis = this;
    
    oThis.createPixelContainer();
    oThis.determineDeviceFingerPrint()
    oThis.initTrackerIdPromise();
    oThis.precomputeParams();
    oThis.initParams = {
      dos   : oThis.getOSName(),
      dl    : navigator.language,
      isTouchDevice   : oThis.getIsTouchDevice() ? 1 : 0
    };
  }

  createPixelContainer() {
    const oThis	=	this,
      dDiv = document.createElement('div'),
      dStyle = dDiv.style
    ;
    dStyle.display      = "none";
    dStyle.height       = "0px";
    dStyle.width        = "0px";
    dStyle.visibility   = "hidden";
    document.body.appendChild( dDiv );
    oThis.pixelContainer = dDiv;
    console.log("pixelContainer" , oThis.pixelContainer );
  }

  getPixelContainer() {
    return this.pixelContainer;
  }

  precomputeParams() {
    const oThis = this;

    let params = [],
      tIdPromise, 
      tSesIdPromise
    ;

    params.push( oThis.getTimeZoneParam() );
    params.push( oThis.getIsCookieEnabledParam() );
    params.push( oThis.getScreenHeightAndWidthParams() );
    params.push( oThis.getScreenResolutionParams() );
    params.push( oThis.getIsRetinaParam() );

    tIdPromise = oThis.getTrackerIdParam();
    tSesIdPromise = oThis.getTrackerSesIdParam();

    oThis.precomputeParamPromise = Promise.all([tIdPromise, tSesIdPromise]).then(function(value){
      params = params.concat(value);
      oThis.precomputedParams = params.join("&");
    });
  }
  
  /**
   * 
   * @returns Name of the OS used by the user.
   */
  getOSName() {
    return this.uaParser.getOS().name;
  }

  /**
   * 
   * @returns true if the device is tough enabled.
   */
  getIsTouchDevice() {
    return "ontouchend" in document;
  }

  /**
   * 
   * @returns precomputed params object.
   */
  getPrecomputedParams() {
    return this.precomputedParams;
  }

  /**
   * 
   * @returns timezone parameter string.
   */
  getTimeZoneParam() {
    const oThis		= this,
      paramNames = oThis.paramNames,
      pName  	= paramNames.timeZoneParamName,
      nowDate    = new Date(),
      timeZoneOffset = nowDate.getTimezoneOffset()
    ;
    return pName + "=" + timeZoneOffset;
  }

  getPageUrlParam() {
    const oThis       = this,
          paramNames  = oThis.paramNames,
          pName       = paramNames.pageUrl
    ;
    return pName + "=" + encodeURIComponent( window.location.href );
  }

  getReferrerUriParam() {
    const oThis		= this,
          paramNames = oThis.paramNames,
          pName  	= paramNames.referrerUri
    ;

    let refUri     = document.referrer;
    /* Send Empty String in Param */
    refUri = encodeURIComponent( refUri );
    return pName + "=" + refUri;
  }

  getEventActionParam( eventAction ) {
    const oThis		=  this,
          paramNames =  oThis.paramNames,
          pName  	=  paramNames.eventAction
    ;
    return pName + "=" + eventAction;
  }

  getEventEntityParam( eventEntity ) {
    const oThis		=  this,
      paramNames =  oThis.paramNames,
      pName  	=  paramNames.eventEntity
    ;
    return pName + "=" + eventEntity;
  }

  setInitialParams( initParamsObj ) {
    const oThis			= this;
    let initParams  	= oThis.initParams || {},
        objKey
    ;
    for( objKey in initParamsObj ) { 
      if( initParamsObj.hasOwnProperty( objKey ) ) {
        key = oThis.getShortKeyNamesForKnownKeys(objKey);
        initParams[ key ] = initParamsObj[ objKey ];
      }
    }
  }

  getInitParams() {
    const oThis			= this;
    let initParams  	= oThis.initParams,
      params = [],
      objKey ,objVal
    ;
    for( objKey in initParams ) { if( initParams.hasOwnProperty( objKey ) ){
      objVal = initParams[ objKey ];
      params.push( objKey + "=" + encodeURIComponent(objVal) );
    }}
    return params.join( "&" );
  }

  getBrowserHeightAndWidthParams() {
    const oThis	        = this,
          paramNames    = oThis.paramNames;
        
    const heightPName	  = paramNames.browserHeight,
          widthPName	  = paramNames.browserWidth
    ;

    let browserHeight ,browserWidth;
    browserHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
    browserWidth  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
    return widthPName + "=" + browserWidth + "&" + heightPName + "=" + browserHeight;
  }

  getShortKeyNamesForKnownKeys(fullKeyName) {
    const shortKeyNameMap =  {
      'app_identifier': 'ai',
      'page_name': 'pn',
      'page_id': 'pid',
      'user_id': 'uid'
    };
    return shortKeyNameMap[fullKeyName] || fullKeyName;
  }

  getScreenHeightAndWidthParams() {
    const oThis			    = this,
          paramNames    = oThis.paramNames,
          heightPName	  = paramNames.screenHeight,
          widthPName	  = paramNames.screenWidth,
          screenHeight  = window.screen.availHeight,
          screenWidth   = window.screen.availWidth
    ;
    return widthPName + "=" + screenWidth + "&" + heightPName + "=" + screenHeight;
  }

  getIsCookieEnabledParam() {
    const oThis			= this,
          paramNames     = oThis.paramNames,
          cookiePName	= paramNames.isCookieEnabled
    ;
    return cookiePName + "=" + (navigator.cookieEnabled ? 1 : 0 );
  }

  getScreenResolutionParams () {
    const oThis                     = this,
          paramNames                 = oThis.paramNames,
          screenResolutionPName      = paramNames.screenResolution
    ;

    let screenHeight ,screenWidth, screenDensity;
    screenDensity = window.devicePixelRatio && window.devicePixelRatio || 1;
    screenHeight  = window.screen.availHeight;
    screenWidth   = window.screen.availWidth;
    return screenResolutionPName + "=" + ( screenWidth * screenDensity ) + "X" + ( screenHeight * screenDensity );
  }

  getIsRetinaParam() {
    const oThis   = this,
      paramNames  = oThis.paramNames,
      pName       = paramNames.isRetina,
      isRetina    = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3))
    ;
    return pName + "=" + (isRetina? 1 : 0);
  }

  getTimeStampParam() {
    const oThis		    = this,
          paramNames  = oThis.paramNames,
          pName  	    = paramNames.timeStamp,
          nowDate     = new Date(),
          timeStamp   = nowDate.getTime()
      ;
    return pName + "=" + timeStamp;
  }

  getPixelPathPrefix() {
    return this.pixelPathPrefix;
  }

  setPixelPath(pixelPath) {
    this.pixelPathPrefix = pixelPath;
  }


  updateSesIdExp(){
    cookie.set(CONST.SESSION_EXP_ID, (new Date()).getTime(), {sameSite: 'Lax'});
  }

  getPixelPath(eventEntity , eventAction, extraParamsObj) {
    const oThis	       = this,
          extraParams  = oThis.convertToUrlParams(extraParamsObj)
    ;

    let   params       = [],
          pixelPath    = oThis.getPixelPathPrefix() + "?"       
    ;

    params.push( oThis.getPageUrlParam() );
    params.push( oThis.getReferrerUriParam() );
    params.push( oThis.getBrowserHeightAndWidthParams() );
    params.push( oThis.getEventEntityParam( eventEntity ) );
    params.push( oThis.getEventActionParam( eventAction ) );
    params.push( oThis.getInitParams() );
    return oThis.precomputeParamPromise
      .then(function(){
        params.push(oThis.getPrecomputedParams());
        params.push( oThis.getTimeStampParam() );
        params = params.concat( extraParams );
        params = params.join("&");
        pixelPath += params;
        console.log( "pixelPath=\n" + pixelPath);
        return pixelPath;
      });
  }

  /**
   * 
   * @param {*} eventEntity 
   * @param {*} eventAction 
   * @param {*} extraParamsObj 
   * @returns A promise that resolves with boolean true or an Error Event or Error Object. The Promise never rejected.
   */
  dropPixel( eventEntity , eventAction, extraParamsObj) {
    const oThis           = this,
          pixelContainer 	=	oThis.getPixelContainer()
    ;

    oThis.updateSesIdExp();
    
    return oThis.getPixelPath(eventEntity , eventAction, extraParamsObj)
      .then((pixelPath) => {
        return new Promise((resolve, reject ) => {
          const dImg  = new Image();
          
          dImg.setAttribute("height" , "0");
          dImg.setAttribute("width" , "0");
          dImg.onload = () => {
            resolve( true );
          };

          dImg.onerror = ( errorEvent ) => {
            resolve( errorEvent );
          };
          dImg.src = pixelPath;
          pixelContainer.appendChild( dImg );
        }); /* End of Promise */

      }) /* End of then */
      .catch(( err ) => {
        return err;
      }) /* End of catch */
  }

  getTrackerSessionId(){
    const oThis       = this,
          tSesIdExp   = cookie.get(CONST.SESSION_EXP_ID),
          tSesId      = cookie.get(CONST.SESSION_ID),
          curTime     = (new Date()).getTime(),
          sesMaxDur   = CONST.SESSION_DURATION
    ;

    if(!tSesId || curTime - sesMaxDur > tSesIdExp){

      return oThis.deviceFPPromise.then(function(fp){
        let sesId = fp + (new Date()).getTime();
        cookie.set(CONST.SESSION_ID, sesId, {sameSite: 'Lax'});
        cookie.set(CONST.SESSION_EXP_ID, (new Date()).getTime(), {sameSite: 'Lax'});
        return sesId;
      });
    }else{
      oThis.deviceFPPromise = new Promise(function(resolve, reject){
        resolve(tSesId);
      });
      return oThis.deviceFPPromise;
    }
  }

  getTrackerSesIdParam() {
    const oThis = this;

    return oThis.getTrackerSessionId()
      .then(function(trackerSesId){
        return oThis.paramNames["trackerSesId"] + "=" + trackerSesId;
      });
  }

  getTrackerIdParam() {
    const oThis = this;

    return oThis.trackerIdPromise
      .then((trackerId) => {
        return oThis.paramNames["trackerId"] + "=" + trackerId;
      });
  }

  initTrackerIdPromise() {
    const oThis       = this,
          trackerId   = cookie.get(CONST.TRACKER_ID)
    ;

    if(!trackerId){
      oThis.trackerIdPromise = oThis.deviceFPPromise
      .then(function(fingerPrint){
        cookie.set(CONST.TRACKER_ID, fingerPrint, {sameSite: 'Lax'});
        return fingerPrint;
      });
      return oThis.trackerIdPromise;
    }else{
      oThis.trackerIdPromise = Promise.resolve(trackerId);
    }
    return oThis.trackerIdPromise;
  }

  determineDeviceFingerPrint(){
    const oThis = this;
    const fpPromise = FingerprintJS.load({monitoring : false});

    oThis.deviceFPPromise = fpPromise
      .then( (fp) => {
        return fp.get()
      })
      .then((result ) => {
        console.log("fp result");
        console.log( result );
        return result.visitorId;
      });

    return this.deviceFPPromise;
  }

  convertToUrlParams(obj) {
    const oThis = this;
    const pairs = [];
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        key = oThis.getShortKeyNamesForKnownKeys(prop);
        let k = encodeURIComponent(key),
          v = encodeURIComponent(obj[prop]);
        pairs.push( k + "=" + v);
      }
    }
    return pairs;
  }
}