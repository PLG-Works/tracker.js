* Installation
```
npm install @plgworks/tracker --save
```

* Importing and Initialization

```js
import PlgTracker from "@plgworks/tracker";

// Initialize the tracker - needs to be done once.
const appIdentifier = 'APP_IDENTIFIER';
const initialParams = {};
const trackerEndpoint = 'https://TRACKER_ENDPOINT';
PlgTracker.initInstance(appIdentifier, trackerEndpoint, initialParams);
```

* Droping Page View Pixel
```
PlgTracker.dropPixel("page", "view", {});
```