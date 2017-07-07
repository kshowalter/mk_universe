export default function(city1, city2){
  city1.events.push('incorporated: '+city2.name);

  city1.population += city2.population;



  return city1;
}
