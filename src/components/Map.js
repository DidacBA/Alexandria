import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import '../styles/map.css';
import 'mapbox-gl/dist/mapbox-gl.css';

export default class Map extends Component {
    
  geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
  });

  componentDidMount(){
    const { token } = this.props;
    const{ books } = this.props;

    const mapConfig = {
      container: 'map',
      style: 'mapbox://styles/ajer/cjsp3c4s03rzb1gk4ocy4zckt',
      center: [2.15, 41.39], 
      zoom: 9,
    };

    mapboxgl.accessToken = token;
    
    this.map = new mapboxgl.Map(mapConfig);
    
    this.map.on('load', () => {
      // Add geolocate control to the map.
      this.map.addControl(this.geolocate);
      this.map.addControl(new mapboxgl.NavigationControl())
      books.forEach(book => {
        const popup = new mapboxgl.Popup()
          .setHTML(`<button>${book.info.author}</button>`);

          new mapboxgl.Marker({name: 'a',anchor: 'center', color:'red'})
            .setLngLat(book.location.coordinates)
            .setPopup(popup)
            .addTo(this.map);
      })
    });
  }

  render(){
    const { books } = this.props;
    return (
        <div className='map' id='map'></div>
    );
  }
}