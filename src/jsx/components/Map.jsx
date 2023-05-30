import React, {
  useEffect, useCallback, useState, useRef, memo
} from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/d3/d3-geo-projection/
// import { transverseMercator } from 'd3-geo-projection';

// https://www.npmjs.com/package/topojson
import * as topojson from 'topojson-client';

// Load helpers.
import { getMapData } from '../helpers/GetMapData.js';

function Map({ data }) {
  const appRef = useRef();
  const mapRef = useRef();

  const [currentAreaData, setCurrentAreaData] = useState([]);
  const [mapData, setMapdata] = useState(false);

  // Hide area info
  const hideData = () => {
    appRef.current.querySelector('.map_info').style.visibility = 'hidden';
    appRef.current.querySelector('.map_info').style.opacity = 0;
    document.querySelector('#app_search_place').value = '';
  };

  const updateMap = useCallback(() => {
    d3.select(appRef.current).select('.map_container').selectAll('path').attr('fill', () => '#faeada');
  }, []);

  const showData = useCallback((event, d) => {
    appRef.current.querySelector('.map_info').style.visibility = 'visible';
    appRef.current.querySelector('.map_info').style.opacity = 1;
    if (d === false) {
      const place_name = document.querySelector(`#app_places option[value='${event.target.value}']`)?.dataset.value;
      setCurrentAreaData(data.filter(place => place.place === place_name)[0]);
    } else {
      setCurrentAreaData(d);
    }
  }, [data]);

  const drawMarkers = useCallback((projection, svg) => {
    // Show area info
    const showTooltip = (event, d) => {
      d3.select(appRef.current).select('.map_tooltip')
        .style('left', `${event.offsetX + 10}px`)
        .style('top', `${event.offsetY + 10}px`)
        .style('display', 'inline')
        .style('opacity', 1)
        .html(`<strong>${d.place}</strong>`);
    };
    const hideTooltip = () => {
      d3.select(appRef.current).select('.map_tooltip')
        .style('opacity', 0)
        .style('display', 'none');
    };

    svg.selectAll('.marker')
      .data(data)
      .enter().append('svg:path')
      .attr('class', 'marker')
      .attr('d', 'M0,0l-8.8-17.7C-12.1-24.3-7.4-32,0-32h0c7.4,0,12.1,7.7,8.8,14.3L0,0z')
      .on('mouseover', (event, d) => {
        showTooltip(event, d);
      })
      .on('mouseout', () => {
        hideTooltip();
      })
    // https://stackoverflow.com/questions/63693132/unable-to-get-node-datum-on-mouseover-in-d3-v6
      .on('click', (event, d) => {
        hideTooltip();
        showData(event, d);
      })
      .attr('transform', (d) => `translate(${projection([d.coordinates_x, d.coordinates_y])[0]},${projection([d.coordinates_x, d.coordinates_y])[1]}) scale(0)`)
      .transition()
      .delay(400)
      .ease(d3.easeElastic)
      .duration(400)
      .attr('transform', (d) => `translate(${projection([d.coordinates_x, d.coordinates_y])[0]},${projection([d.coordinates_x, d.coordinates_y])[1]}) scale(1)`);
    // .on('mouseover', function(d){})
  }, [showData, data]);

  const drawMap = useCallback((map_data) => {
    const svg = d3.select('.map_container')
      .append('svg')
      .attr('height', 650)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('svg-content', true)
      .attr('width', appRef.current.offsetWidth);

    const map = topojson.feature(map_data, map_data.objects.features);
    // https://observablehq.com/@d3/robinson
    const projection = d3.geoTransverseMercator().rotate([-26.5, 0]).fitExtent([[50, 0], [appRef.current.offsetWidth - 50, 700]], map);
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .attr('class', 'areas')
      .selectAll('path')
      .data(map.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('id', (d, i) => i)
      .attr('class', 'path');
    updateMap();
    drawMarkers(projection, svg);
  }, [drawMarkers, updateMap]);

  useEffect(() => {
    getMapData().then(mapdata => {
      setMapdata(mapdata);
    });
  }, []);

  useEffect(() => {
    if (mapData !== false && d3.select(appRef.current).select('.map_container svg').empty() === true) drawMap(mapData);
  }, [drawMap, mapData]);

  return (
    <>
      <h2>Löydä kirja</h2>
      <h4>Valitse paikka</h4>
      <div className="map_wrapper map_municipality" ref={appRef}>
        <div className="input_container">
          <label htmlFor="app_search_place">
            <input list="app_places" id="app_search_place" name="" placeholder="Valitse paikka" onChange={(event) => showData(event, false)} />
          </label>
          <datalist id="app_places">
            {data && data.map(place => (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
              <option key={place.place} data-value={place.place} value={place.place}>{place.place}</option>
            ))}
          </datalist>
        </div>
        <IsVisible once>
          {(isVisible) => (
            <div className="map_container map" ref={mapRef} style={isVisible ? { opacity: 1 } : {}} />
          )}
        </IsVisible>
        <div className="map_info">
          <div className="map_info_content">
            <h3>{currentAreaData.place}</h3>
            <div className="current_municipality_status">
              <p>{currentAreaData.text}</p>
            </div>
            <div className="close_container"><button className="close" type="button" onClick={() => hideData()}>Sulje</button></div>
          </div>
        </div>
        <div className="map_tooltip" />
      </div>
    </>
  );
}

Map.propTypes = {
  data: PropTypes.instanceOf(Array).isRequired,
};

Map.defaultProps = {
};

export default memo(Map);
