const fs = require('fs');

function processFlightsByCityAndPrice(data) {
  const locations = [];
  for (const itinerary of data.destinations) {
    const flight = itinerary.flightInfo;
    const {city, country, airport} = itinerary;
    const searchUrl = `https://www.kayak.com${itinerary.clickoutUrl}`
    const location = {
      destination: {
        city: {
            id: city.id,
            name: city.name
        },
        country: {
            id: country.id, 
            name: country.name,
            code: country.code
        }
      },
      label: `${city.name}, ${country.name}`,
      flight: {
        expectedPrice: flight.priceUSD,
        airline: {
            name: itinerary.airline,
            code: itinerary.airlineCode
        },
        airport: {
            name: airport.name,
            code: airport.shortName,
            latitude: airport.latitude,
            longitude: airport.longitude
        }
      },
      searchUrl: searchUrl
    };
    console.log('location ===> ',location)
    locations.push(location);
  }

  // Sort accommodations by destination aka city.name (ascending), TODO[by month (ascending)] and then by price (ascending)
  locations.sort((a, b) => {
    if (a.destination.city.name !== b.destination.city.name) {
      //return b.destination.city.name - a.destination.city.name;
      return a.destination.city.name.localeCompare(b.destination.city.name);
    } 
    // else if (a.location.flight.date !== b.location.flight.date) {
        // return a.flight.date - b.flight.date;
    // } 
    else  {
      return a.flight.expectedPrice - b.flight.expectedPrice;
    }
  });

  // Group flights by city destination
  return groupByCityName(locations);

  // return locations;
}

function processFlights(data, sortStrategy) {
  const locations = [];
  for (const itinerary of data.destinations) {
    const flight = itinerary.flightInfo;
    const {city, country, airport} = itinerary;
    const searchUrl = `https://www.kayak.com${itinerary.clickoutUrl}`
    const location = {
      destination: {
        city: {
            id: city.id,
            name: city.name
        },
        country: {
            id: country.id, 
            name: country.name,
            code: country.code
        }
      },
      label: `${city.name}, ${country.name}`,
      flight: {
        expectedPrice: flight.priceUSD,
        airline: {
            name: itinerary.airline,
            code: itinerary.airlineCode
        },
        airport: {
            name: airport.name,
            code: airport.shortName,
            latitude: airport.latitude,
            longitude: airport.longitude
        }
      },
      searchUrl: searchUrl
    };
    console.log('location ===> ',location)
    locations.push(location);
  }

  locations.sort(sortStrategy);
  return locations;
}

const strategyGroupedSortByCityAndPrice = (a, b) => {
  if (a.destination.city.name !== b.destination.city.name) {
    //return b.destination.city.name - a.destination.city.name;
    return a.destination.city.name.localeCompare(b.destination.city.name);
  } 
  // else if (a.location.flight.date !== b.location.flight.date) {
      // return a.flight.date - b.flight.date;
  // } 
  else  {
    return a.flight.expectedPrice - b.flight.expectedPrice;
  }
};

function countryName(location){
  return location.destination.country.name;
}

const strategyGroupedSortByCountryAndPrice = (a, b) => {
  const countryA = countryName(a);
  const countryB = countryName(b);
  if (countryA !== countryB) {
    return countryA.localeCompare(countryB);
  } 
  else  {
    return a.flight.expectedPrice - b.flight.expectedPrice;
  }
};


const strategySortByPrice = (a, b) => {
    return a.flight.expectedPrice - b.flight.expectedPrice;
};

function main(){
  // Load the JSON data
  fs.readFile('flights.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    try {
      const json = JSON.parse(data);
      //sortByCityAndPrice(json);
      //sortByCityAndPriceGeneric(json);
      //sortByPriceGeneric(json)
      //sortByCountryAndPriceGeneric(json);
      searchForCountryDestinations(json,['Japan','China','Thailand','Cambodia','Philippines','Vietnam','Indonesia','Malaysia','Singapore'])
    } catch (error) {
      console.error('Error processing JSON data:', error);
    }
  });
}

// ----------------------------------------------------------------
// HELPER ROUTINES
// ----------------------------------------------------------------
function sortByPriceGeneric(json) {
  const locations = processFlights(json,strategySortByPrice);
  printByPrice(locations);
}

function sortByCityAndPriceGeneric(json) {
  const locations = processFlights(json,strategyGroupedSortByCityAndPrice);
  const groupedData = groupByCityName(locations);
  printGroupedByCityAndPrice(groupedData);
}

function sortByCountryAndPriceGeneric(json) {
  const locations = processFlights(json,strategyGroupedSortByCountryAndPrice);
  const groupedData = groupByCountryName(locations);
  printGroupedByCountryAndPrice(groupedData);
}

function sortByCityAndPrice(json) {
  const groupedData = processFlightsByCityAndPrice(json);
  printGroupedByCityAndPrice(groupedData);
}

function searchForCountryDestinations(json, countries) {
  const locations = processFlights(json,strategyGroupedSortByCountryAndPrice);
  const groupedData = groupByCountryName(locations);
  const result = {}
  console.log(countries);
  countries.forEach(countryName =>  {
    if(groupedData[countryName]){
      // result.push(groupedData[countryName])
      if (!result[countryName]) {
        result[countryName] = [];
      }
      result[countryName] = groupedData[countryName];
    }
    else{
      console.log('Not found ',countryName);
    }
  });
  printGroupedByCountryAndPrice(result);
}


// ----------------------------------------------------------------
// HELPER SUBROUTINES
// ----------------------------------------------------------------
function printByPrice(groupedData) {
  for (const location of groupedData) {
    console.log(`${location.label}: $${location.flight.expectedPrice} ${location.searchUrl}`);
  }
}

function printGroupedByCityAndPrice(groupedData) {
  for (const cityName in groupedData) {
    console.log(`City: ${cityName}`);
    for (const location of groupedData[cityName]) {
      console.log(`\t- ${location.label}: $${location.flight.expectedPrice} ${location.searchUrl}`);
    }
  }
}

function printGroupedByCountryAndPrice(groupedData) {
  for (const cityName in groupedData) {
    console.log(`Country: ${cityName}`);
    for (const location of groupedData[cityName]) {
      console.log(`\t- ${location.label}: $${location.flight.expectedPrice} ${location.searchUrl}`);
    }
  }
}

function groupByCityName(locations) {
  const groupedLocations = {};
  for (const location of locations) {
    const key = location.destination.city.name;
    if (!groupedLocations[key]) {
      groupedLocations[key] = [];
    }
    groupedLocations[key].push(location);
  }

  return groupedLocations;
}

function groupByCountryName(locations) {
  const groupedLocations = {};
  for (const location of locations) {
    const key = countryName(location);
    if (!groupedLocations[key]) {
      groupedLocations[key] = [];
    }
    groupedLocations[key].push(location);
  }

  return groupedLocations;
}

main();