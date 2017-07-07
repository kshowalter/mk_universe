import Chance from 'chance';
import mk_galaxy_sensor from './mk_galaxy_sensor';



export default function(galaxy_id){
  console.log( 'MAKING GALAXY: ', galaxy_id );
  var chance = Chance(galaxy_id);
  var galaxy = {};

  galaxy.id = galaxy_id;

  galaxy.desity = chance.normal({mean: 0.5, dev: 0.2});
  if( galaxy.density < 0.05 ){ galaxy.density = 0.05; }
  if( galaxy.density > 0.95 ){ galaxy.density = 0.95; }

  var sensor = mk_galaxy_sensor(galaxy);

  galaxy.sensor = sensor;

  return galaxy;
}
