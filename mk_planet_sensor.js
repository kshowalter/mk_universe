import Chance from 'chance';
var noise = require('./lib/noisejs/perlin');


var to_cartesian = function(r,lat,lon){
  lat *= Math.PI/180;
  lon *= Math.PI/180;

  // https://stackoverflow.com/a/1185413
  //var x = r * Math.cos(lat) * Math.cos(lon);
  //var y = r * Math.cos(lat) * Math.sin(lon);
  //var z = r * Math.sin(lat);

  // http://astro.uchicago.edu/cosmus/tech/latlong.html
  var x = -r * Math.cos(lat) * Math.cos(lon);
  var y =  r * Math.sin(lat) ;
  var z =  r * Math.cos(lat) * Math.sin(lon);

  return [x,y,z];
};

// https://stackoverflow.com/a/15762794
function roundTo(n, digits) {
  if (digits === undefined) {
    digits = 0;
  }

  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  var test =(Math.round(n) / multiplicator);
  return +(test.toFixed(digits));
}

export default function(planet){
  console.log( 'SCANNING: ', planet.name );
  var chance = Chance(planet.name);
  var noise_seed = chance.floating({min:0,max:1});

  noise.seed(noise_seed);

  var continent_factor = 6000;
  var continent_noise_factor = 1500;
  var temperature_factor = 2300;
  var rain_factor = 4200;

  var sensor = function(coor){
    var timer = global.Timer();

    var longitude_sensor_correction_factor = planet.longitude_sensor_correction_factor || 0;
    var lat = coor[1];
    var lon = coor[0] + longitude_sensor_correction_factor;
    //lat = Number( lat.toFixed(1) );
    //lon = Number( lon.toFixed(1) );
    lon = roundTo( lon, 1 );
    lat = roundTo( lat, 1 );
    //var lat_fraction = Number(( (lat %1) * 4 ).toFixed(0))/4;
    //var lon_fraction = Number(( (lon %1) * 4 ).toFixed(0))/4;
    //lat = Number( lat.toFixed(0) ) + lat_fraction;
    //lon = Number( lon.toFixed(0) ) + lon_fraction;
    //global.to_inspect.lons = global.to_inspect.lons || {};
    //global.to_inspect.lons[lon%1] = global.to_inspect.lons[lon%1] ? global.to_inspect.lons[lon%1]+1 : 1;

    var measurment_id = planet.name+'_'+lat+'_'+lon;

    global.to_inspect.samples++;
    var measurment;
    if( global.measurments[measurment_id] ){
      global.to_inspect.reused++;
      //global.to_inspect.reused_anal(timer());
      measurment = global.measurments[measurment_id];
      return measurment;
    } else {
      global.to_inspect.calculated++;
      measurment = {
        coor: coor
      };

      var location = measurment.location = to_cartesian(planet.radius,lat,lon);

      // All noise functions return values in the range of -1 to 1.
      var radius_deviation_factor = noise.simplex3( location[0]/continent_factor, location[1]/continent_factor, location[2]/continent_factor );
      var radius_deviation_factor_noise = noise.simplex3( location[0]/continent_noise_factor, location[1]/continent_noise_factor, location[2]/continent_noise_factor );
      var termperature_noise = noise.simplex3( location[0]/temperature_factor, location[1]/temperature_factor, location[2]/temperature_factor );
      var rain_noise = noise.simplex3( location[0]/rain_factor, location[1]/rain_factor, location[2]/rain_factor );

      radius_deviation_factor_noise *= 0.2;
      radius_deviation_factor += radius_deviation_factor_noise;
      measurment.radius_deviation_factor = radius_deviation_factor;

      var altitude_factor = ( ( measurment.radius_deviation_factor + 1 ) - ( planet.sealevel + 1 ) )/2;

      measurment.radius = planet.radius + measurment.radius_deviation_factor * planet.radius_deviation;
      measurment.altitude = measurment.radius - planet.sealevel;



      // max avg temp = 30
      // min avg temp = -30
      var temperature = ( (90-Math.abs(lat))/90 * 60 - 30 ) + ( radius_deviation_factor * 5 ) + ( termperature_noise * 2 );
      measurment.temperature = temperature;

      // Mean annual rainfall (cm)
      // range 0-350+ cm
      var rainfall = 300 - ( Math.abs(radius_deviation_factor) * 250 ) + ( rain_noise * 50 );
      measurment.rainfall = rainfall;

      var biome_name;
      if( temperature > 5 ){
        if( rainfall < 40 ){
          biome_name = 'desert';
        } else if( rainfall < 75){
          biome_name = 'plains';
        } else if( rainfall < 200){
          biome_name = 'temperate forest';
        } else {
          biome_name = 'tropical forest';
        }
      } else {
        if( rainfall < 150 ){
          biome_name = 'tundra';
        } else {
          biome_name = 'polar';
        }
      }
      measurment.biome_name = biome_name;

      //global.measurments[lat] = global.measurments[lat] || [];
      global.measurments[measurment_id] = measurment;
      //global.to_inspect.calculated_anal(timer());
      return measurment;

    }
  };


  return sensor;
}
