import Chance from 'chance';
import mk_sector_sensor from './mk_sector_sensor';



export default function( galaxy, sector_id ){
  console.log( 'MAKING SECTOR: ', sector_id );
  var chance = Chance(sector_id);

  var coor = sector_id.split('-');

  var measurment = galaxy.sensor(coor);

  var sector = {};
  sector.id = sector_id;

  sector.density = measurment.density;

  var sensor = mk_sector_sensor(sector);

  sector.sensor = sensor;

  sector.systems = [];
  sector.habitable_systems = [];
  sector.habitable_systems_with_life = [];

  f.range(50).forEach(function(i){
    var matter_cloud_coalesce = chance.bool({likelihood: sector.density*100 });
    if( matter_cloud_coalesce ){
      var system = {
        id: sector.id +'_'+ i,
        coor: [
          chance.integer({min: 0, max: 999}),
          chance.integer({min: 0, max: 999}),
          chance.integer({min: 0, max: 999}),
        ],
        habitable: chance.bool({likelihood: 20})
      };
      if( system.habitable ){
        sector.habitable_systems.push(system);
        sector.has_life = chance.bool({likelihood: (1-sector.density)*100 });
        if( sector.has_life ){
          sector.name = chance.sentence({words: 2});
          sector.habitable_systems_with_life.push(system);
        }

      }

      sector.systems.push(system);
    }
  });



  return sector;
}
