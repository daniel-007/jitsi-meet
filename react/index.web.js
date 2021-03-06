/* global APP */

import React from 'react';
import ReactDOM from 'react-dom';
import { compose, createStore } from 'redux';
import Thunk from 'redux-thunk';

import config from './config';
import { App } from './features/app';
import { MiddlewareRegistry, ReducerRegistry } from './features/base/redux';

const logger = require('jitsi-meet-logger').getLogger(__filename);

// Create combined reducer from all reducers in registry.
const reducer = ReducerRegistry.combineReducers();

// Apply all registered middleware from the MiddlewareRegistry + additional
// 3rd party middleware:
// - Thunk - allows us to dispatch async actions easily. For more info
// @see https://github.com/gaearon/redux-thunk.
let middleware = MiddlewareRegistry.applyMiddleware(Thunk);

// Try to enable Redux DevTools Chrome extension in order to make it available
// for the purposes of facilitating development.
let devToolsExtension;

if (typeof window === 'object'
        && (devToolsExtension = window.devToolsExtension)) {
    middleware = compose(middleware, devToolsExtension());
}

// Create Redux store with our reducer and middleware.
const store = createStore(reducer, middleware);

/**
 * Renders the app when the DOM tree has been loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    const now = window.performance.now();

    APP.connectionTimes['document.ready'] = now;
    logger.log('(TIME) document ready:\t', now);

    // Render the main Component.
    ReactDOM.render(
        <App
            config = { config }
            store = { store } />,
        document.getElementById('react'));
});

/**
 * Stops collecting the logs and disposing the API when the user closes the
 * page.
 */
window.addEventListener('beforeunload', () => {
    // Stop the LogCollector
    if (APP.logCollectorStarted) {
        APP.logCollector.stop();
        APP.logCollectorStarted = false;
    }
    APP.API.dispose();
});
