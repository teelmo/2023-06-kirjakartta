import React, {
  useEffect, useState/* , useRef, useCallback */
} from 'react';
// import PropTypes from 'prop-types';

import '../styles/styles.less';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';
// import easingFn from './helpers/EasingFn.js';

import Map from './components/Map.jsx';

function App() {
  const [data, setData] = useState(false);

  useEffect(() => {
    const getDataPath = () => {
      if (window.location.href.includes('github')) return './assets/data/';
      if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2023-06-kirjakartta/assets/data';
      return 'assets/data';
    };

    try {
      Promise.all([
        fetch(`${getDataPath()}/2023-06-kirjakartta_data.csv`)
          .then((response) => {
            if (!response.ok) {
              throw Error(response.statusText);
            }
            return response.text();
          })
          .then(body => setData(CSVtoJSON(body))),
      ]);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="app">
      <div className="content_wrapper">
        <div className="content_container">
          {data && <Map data={data} />}
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
