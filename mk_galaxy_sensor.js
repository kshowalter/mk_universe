import Chance from 'chance';
var noise = require('./lib/noisejs/perlin');



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

export default function(galaxy){
  var chance = Chance(galaxy.id);
  var noise_seed = chance.floating({min:0,max:1});

  noise.seed(noise_seed);


  var galaxy_density_factor = 100;


  var sensor = function(coor){
    // kly from galaxy center
    var x = coor[0];
    var y = coor[1];
    var z = coor[2];

    //x = roundTo( x, 2 );
    //y = roundTo( y, 2 );
    //z = roundTo( z, 2 );

    var measurment_id = galaxy.id+'_'+x+'-'+y+'-'+z;

    var measurment;
    if( global.measurments[measurment_id] ){
      //global.to_inspect.reused_anal(timer());
      measurment = global.measurments[measurment_id];
      return measurment;
    } else {
      measurment = {
        coor: coor
      };

      var distance = Math.sqrt( Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2) );
      var density_halfway = 50; //kly
      var d = ( density_halfway - distance ) / density_halfway;
      //d = d > 0 ? d : 0; // remove negative densities.

      var galaxy_density_noise = noise.simplex3( x/galaxy_density_factor, y/galaxy_density_factor, z/galaxy_density_factor );
      //console.log(x,y,z,galaxy_density_noise);
      galaxy_density_noise = ( galaxy_density_noise + 1 ) / 2;

      measurment.density = ( galaxy_density_noise + d ) / 2;

      //measurment.density = chance.normal({mean: 0.5, dev: 0.2});
      if( measurment.density < 0.05 ){ measurment.density = 0.05; }
      if( measurment.density > 0.95 ){ measurment.density = 0.95; }

      //global.measurments[lat] = global.measurments[lat] || [];
      global.measurments[measurment_id] = measurment;
      //global.to_inspect.calculated_anal(timer());
      return measurment;

    }
  };


  return sensor;
}
