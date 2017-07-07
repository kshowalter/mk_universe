import Chance from 'chance';
import mk_planet_sensor from './mk_planet_sensor';
import f from 'functions';
import great_circle_distance from './function/great_circle_distance';
import merge_cities from './function/merge_cities';



export default function(planet_name){
  console.log( 'TRAVELING TO: ', planet_name );
  var chance = Chance(planet_name);
  var planet = {};

  planet.name = planet_name;
  planet.radius = 6000; // average, km
  planet.radius_deviation = 10; // +/- km
  planet.sealevel = planet.radius + ( planet.radius_deviation*2 * 0.6 - planet.radius_deviation );
  planet.max_altitude = planet.radius + planet.radius_deviation - planet.sealevel;
  planet.max_depth = planet.sealevel - (planet.radius - planet.radius_deviation);

  var sensor = mk_planet_sensor(planet);


  planet.sensor = sensor;

  planet.cities = [];



  var continent_map = [];
  var water_count = 0;
  for (var lon = -179; lon <= 180; lon++) {
    var lon_water_level = 0;
    for (var lat = -60; lat <= 60; lat++) {
      var measurment = planet.sensor([lon,lat]);
      if( measurment.altitude < 0 ) {
        lon_water_level++;
      }
    }
    if( lon_water_level > 60*2*0.95 ){
      water_count++;
    } else {
      water_count = 0;
    }
    continent_map.push({
      lon,
      lon_water_level,
      water_count,
      center_lon: lon-water_count/2
    });
  }
  continent_map.sort(function(a,b){
    return b.water_count - a.water_count;
  });
  planet.longitude_sensor_correction_factor = continent_map[1].center_lon - 180;





  var potential_cities = [];
  f.range(200).forEach(function(){
    var city_name = chance.city();
    var lon = chance.floating({min: -180, max: 180});
    var lat = chance.floating({min: -90, max: 90});
    var measurment = sensor([lon,lat]);
    var population = Math.floor( ( chance.normal({mean: 500000, dev: 50000}) +
                       chance.integer({min:0,max:1000000}) +
                      chance.integer({min:0,max:10000000})
                    )/3 );
    var size = Math.floor( population / 1000000 );
    var potential_city_values = {};
    //if( measurment.altitude > 0 ) potential_city_values.not_floded = 100;
    var max_altitude = planet.radius + planet.radius_deviation - planet.sealevel;
    var max_depth = planet.sealevel - ( planet.radius - planet.radius_deviation ) ;
    if( measurment.altitude > 0 ){
      potential_city_values.altitude = Math.pow(max_altitude-measurment.altitude,3)/Math.pow(max_altitude,3) * 100;
    } else {
      var depth = -measurment.altitude ;
      potential_city_values.altitude = - Math.pow(depth,0.5)/Math.pow(max_depth,0.5)*100;
    }
    potential_city_values.temperature = 100-Math.pow(Math.abs(15-measurment.temperature),0.5)/Math.pow(15,0.5)*100;
    potential_city_values.rainfall = 100 - Math.abs( measurment.rainfall - 250 )*100/200;

    var potential_city_value = Object.keys(potential_city_values).reduce(function(sum,name){
      return sum + potential_city_values[name];
    },0) / Object.keys(potential_city_values).length;

    var city = {
      name: city_name,
      lon: lon,
      lat: lat,
      population: population,
      size: size,
      color: chance.color({format: 'rgb'}),
      measurment: measurment,
      potential_city_value: potential_city_value,
      potential_city_values: potential_city_values,
      events: []
    };

    potential_cities.push(city);

  });

  potential_cities.sort(function(a,b){
    return b.potential_city_value - a.potential_city_value;
  });

  potential_cities = potential_cities.slice(0,20);

  potential_cities.some(function(city){
    var incorporated = false;
    planet.cities.forEach(function(second_city){
      if( city.name !== second_city.name ){
        var distance = great_circle_distance( city.lat, city.lon, second_city.lat, second_city.lon);
        if( distance < 1000 ){
          //console.log(distance, 'merging: ', city, second_city);
          second_city = merge_cities(second_city, city);
          incorporated = true;
          return true;
        }
      }

    });
    if( ! incorporated ){
      planet.cities.push(city);
    }
  });

  /*
  planet.cities.forEach(function(city){
    console.log(
      'T',
      city.measurment.temperature.toFixed(2),
      city.potential_city_values.temperature.toFixed(2),
      'A',
      city.measurment.altitude.toFixed(2),
      city.potential_city_values.altitude.toFixed(2),
      'R',
      city.measurment.rainfall.toFixed(2),
      city.potential_city_values.rainfall.toFixed(2),
      city.name,
    );
  })
  //*/

  return planet;
}
