import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './jsx/App.jsx';

const appName = '2023-06-kirjakartta';
const ROOT_SELECTOR = `#app-root-${appName}`;

const eventHandlers = {
  onMount: (name, element, services) => {
    if (name !== appName) {
      return;
    }
    const container = element.querySelector(ROOT_SELECTOR);
    if (!container) {
      return;
    }
    // Parameters passed from Yddrasil.
    const parameters = services.getParameters() || {};

    const root = createRoot(container);

    root.render(<App parameters={parameters} />);
  }
};

if (process.env.NODE_ENV === 'production' && window.yleVisualisation) {
// DRUPAL
  window.yleVisualisationEmbeds = window.yleVisualisationEmbeds || {};
  window.yleVisualisationEmbeds[appName] = eventHandlers;
} else if ((process.env.NODE_ENV === 'production' && window.location.href.includes('github')) || process.env.NODE_ENV === 'development') {
  // GITHUB PAGES OR DEVELOPMENT
  const parameters = {};
  const searchParameters = new URLSearchParams(window.location.search);
  // eslint-disable-next-line
  for (const [key, value] of searchParameters) {
    parameters[key] = value;
  }
  const root = createRoot(document.querySelector(ROOT_SELECTOR));
  root.render(<App parameters={parameters} />);
} else if (process.env.NODE_ENV === 'production' && !window.yleVisualisation) {
  // ARTICLE RENDERER OR STATIC HOSTING
  window.plusApp = window.plusApp || {};
  // Go through all Dataviz blocks using this React app
  document
    .querySelectorAll(`${ROOT_SELECTOR}:not([data-yle-vis-processed])`)
    .forEach((element) => {
      element.setAttribute('data-yle-vis-processed', appName);
      // Distribute each Yddrasil parameter set to the closest React component
      const parent = element.closest('[data-yle-external-content-parameters]')
        || element.parentElement
        || document.body;

      const services = {
        getParameters() {
          return {};
        },
      };
      let parameters;
      if (parent.hasAttribute('data-yle-external-content-parameters')) {
        try {
          parameters = JSON.parse(
            parent.getAttribute('data-yle-external-content-parameters')
          );
        } catch (e) {
          console.log(e);
        }
        if (
          typeof parameters === 'object'
          && parameters !== null
          && !Array.isArray(parameters)
        ) {
          services.getParameters = () => parameters;
        }
      }
      eventHandlers.onMount(appName, parent, services);
    });
} else {
  console.log('no env');
}
