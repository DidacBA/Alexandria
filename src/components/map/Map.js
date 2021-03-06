import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import './styles/map.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { withAuth } from '../providers/AuthProvider';
import { withBooks } from '../providers/BookProvider';
import { popUpCreator } from '../../functions/popUpCreator';
import ReactDOM from 'react-dom';
import PopUpCard from './PopUpCard';
import AddBookButton from '../addBookButton/addBookButton';

class Map extends Component {
  state = {
    // isLoggedIn: false,
    books: this.props.books,
    isPopUpOpen: false,
    nodeList: [],
  }

  geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });

  handleUpdateBooks = () => {
    this.props.updateBooks();
  }

  componentDidMount() {
    this.mounted = true;
    const {
      books
    } = this.props;

    const mapConfig = {
      container: 'map',
      style: 'mapbox://styles/ajer/cjsqedagl1fb51fnvxopap6mz',
      center: [2.1905327, 41.397765199999995],
      zoom: 9,
    };

    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

    /* Create map instance and sets markers and popups through popupCreator function */

    this.map = new mapboxgl.Map(mapConfig);

    this.map.on('load', () => {
      // Add geolocate control to the map.
      this.map.addControl(this.geolocate)

      books.forEach(book => {
        popUpCreator(book, this.map);
      });
    });

    /* Search the HTML DOM for mapbox popup nodes for Portal setup using MutationObserver. 
    Push the last created popup node into array in state */

    const nodeList = document.querySelectorAll('.mapboxgl-popup-content');
    
    if (nodeList.length > 0 && this.mounted) {
      this.setState({
        nodeList,
      });
    }

    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const newNodes = mutation.addedNodes;
        newNodes.forEach(node => {
          if (this.mounted && node.classList && node.classList.contains('mapboxgl-popup-content')) {
              this.setState(prevState => ({nodeList: [node]}));
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, {
      attributes: false,
      characterData: false,
      childList: true,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
    });
    
  }

  /* Adding a componentWillUnmount check for the setStates fixes possible memory leak */

  componentWillUnmount(){
    this.mounted = false;
  }

  /* Portal to PopUp Card component */

  render() {
    const nodeList = [...this.state.nodeList];
    const portal = (nodeList.length > 0) ? nodeList.map((node, i) =>
      (
        <PopUpPortal key={ i } node={ node }>
          <PopUpCard node={ node } { ...this.props } /> 
        </PopUpPortal>
      )
    ) :
    null;

    return <div>
      < AddBookButton {...this.props} />
      <div className='map' id='map'></div>
      {portal}
    </div>
  }
}

class PopUpPortal extends Component {
  render() {
    return ReactDOM.createPortal(this.props.children, this.props.node);
  }
}

export default withBooks(withAuth(Map));
