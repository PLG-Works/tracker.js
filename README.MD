# Installation
```
npm install @plgworks/tracker --save
```

# Importing, Initialization and Dropping Page View pixel in Multipage application.

```js
import PlgTracker from "@plgworks/tracker";

// Initialize the tracker - needs to be done once.
const appIdentifier = 'APP_IDENTIFIER';
const trackerEndpoint = 'https://TRACKER_ENDPOINT';

// Initialize
PlgTracker.initInstance(appIdentifier, trackerEndpoint);

// Drop page view pixel.
PlgTracker.dropPixel("page", "view", {});
```

# Importing, Initialization and Dropping Page View pixel in React SPA.
```js
/**
 * Begin - PLG Tracker code for React SPA
 */
  const isTrackerInitialzed = useRef(false); 
  useEffect(() => {
    const trackerEndpoint = 'https://TRACKER_ENDPOINT';
    const trackerAppIdentifier = 'APP_IDENTIFIER';
    //Make sure pixels are fired from browser only and not from service workers or server side.
    const useTracker = trackerEndpoint && typeof window !== 'undefined';
    if ( isTrackerInitialzed.current && useTracker ) {
      // Already Initialized.
      isTrackerInitialzed.current = true;
      return;
    }

    isTrackerInitialzed.current = true;
    PlgTracker.initInstance(trackerAppIdentifier, trackerEndpoint);
    // Drop page view pixel on url change.
    PlgTracker.getHistoryObserver().on("urlChange", () => {
      PlgTracker.dropPixel("page", "view");
    });
    
    // Drop pixel for first page load.
    PlgTracker.dropPixel("page", "view");
  });
/**
 * End - PLG Tracker code for React SPA
 */
```

# Page View Pixel For Other SPA(s)
You can use the History Observer to detect change in url. 
History Observer is an instance of [EventEmiter3](https://github.com/primus/eventemitter3).
Listen for the `urlChange` Event to detect page navigation and drop the pavge  
```js
  const historyObserver = PlgTracker.getHistoryObserver();
  PlgTracker.getHistoryObserver().on("urlChange", () => {
      PlgTracker.dropPixel("page", "view");
    });
```


# Dropping Pixels.
```js
PlgTracker.dropPixel('<EVENT_ENTITY>', '<EVENT_ACTION>', {<EVENT_EXTRA_DETAILS>} );
```

where:
- <EVENT_ENTITY> (mandatory): Define generic event entity like page, button, form, etc. This data point will be parsed and populated in a separate column `event_entity`.
- <EVENT_ACTION> (mandatory): Define generic event entity action like load, click, submit, scroll etc. This data point will be parsed and populated in a separate column `event_action`.
- <EVENT_EXTRA_DETAILS> (optional): Event extra details is an object having few known keys and you can add extra details as well. The known keys will be populated in separate columns and the extra details will be stored in `event_extra_details_json`. Following are the known keys:
    - `page_name`: Page name will be parsed and populated in a separate column `page_name`. Define generic page names for your pages like: home, signup, login, product, order, cart etc.
    - `page_id`: Page identifier will be parsed and populated in a separate column `page_id`. Define specific page identifiers for your pages like: product id, cart id, order id
    - `user_id`: User id will be parsed and populated in a separate column `user_id`. This identifies the logged in user.

Examples:
- Logged in user visiting a product page:
```js
    PlgTracker.dropPixel("page", "load", {"page_name": "product", "page_id": "p_10", "user_id": "1000"});
```
- Logged out user visiting a product page:
```js
    PlgTracker.dropPixel("page", "load", {"page_name": "product", "page_id": "p_11"});
```
- Sign up page load:
```js
    PlgTracker.dropPixel("page", "load", {"page_name": "signup"});
```
- User visiting a search page:
```js
    PlgTracker.dropPixel("page", "load", {"page_name": "search", "search_term": "headphones", "page_number": "2"});
```
- User scrolled and reached the footer of a page.
```js
    PlgTracker.dropPixel("page", "scroll", {"page_name": "search", "viewed_footer": "true"});
```
- User clicked add to cart
```js
    PlgTracker.dropPixel("button", "click", {"page_name": "product", "product_id": "123", "button_id": "add_to_cart"});
```
OR
```js
    PlgTracker.dropPixel("add_to_cart", "click", {"page_name": "product", "product_id": "123"});
```

The fired pixel will have parameter names shortened and parameter values URI encoded. The parameter names are shortened to keep the pixel URL withing the permissable character length. An example of the formatted pixel is given below:
```
https://example.com/pixel.png?tid=341c6cd8b4020124a62e17b216621117&sesid=341c6cd8b4020124a62e17b2166211171661425858063&ee=page&ea=view&uid=543210&tz=-330&pn=product&pid=9769&purl=https%3A%2F%2Fexample.com%3F&rurl=https%3A%2F%2Fexample.com%3Freferrer%3Dproducthunt%26product%3Dtracker&ref=footer&utm_type=u_type&utm_source=u_source&utm_medium=u_medium&utm_campaign=u_campaign&utm_term=u_term&utm_content=u_content&ai=WEB&dr=2880X1754&dos=MacOS&dl=en-GB&ir=1&dw=1440&dh=877&bw=1440&bh=798&ce=1&user_rating=%F0%9F%98%80%20Happy
```

# Build Instructions
```
npm run build
```
