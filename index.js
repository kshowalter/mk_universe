import mk_galaxy from './mk_galaxy';
import mk_sector from './mk_sector';
import mk_planet from './mk_planet';


export default function(id){
  var universe = {
    galaxies: []
  };

  if(id && id.length > 0 ){

    if( id[0] ){ // galaxy
      var galaxy = mk_galaxy( id[0] );
      universe.galaxies.push(galaxy);
      console.log(galaxy);
    }
    if( id[1] ){ // sector
      var sector = mk_sector( galaxy, id[1] );
      console.log(sector);
    }
    if( id[2] ){ // system
      console.log('SYSTEM SELECTED: ', id[2]);
    }
    if( id[3] ){ // system object
      console.log('OBJECT SELECTED: ', id[3]);
      var planet_name = id[3];
      var planet = mk_planet( id[0] );
      console.log( planet_name, ' details: ', planet);
    }
    if( id[4] ){ // system object detail
      console.log('OBJECT DETAIL BEYOND SCAN RANGE: ', id[3]);
    }
  }

  return universe;

}
