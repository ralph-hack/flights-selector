const fs = require('fs');

function processFlights(data) {
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
    // if (a.destination.city.name !== b.destination.city.name) {
    //   return b.destination.city.name - a.destination.city.name;
    // } 
    // else if (a.location.flight.date !== b.location.flight.date) {
        return a.flight.date - b.flight.date;
    // } 
    // else  {
    //   return a.flight.expectedPrice - b.flight.expectedPrice;
    // }
  });

  // Group accommodations by review rating
  // const groupedLocations = {};
  // for (const location of locations) {
  //   const key = location.destination.city.name;
  //   if (!groupedLocations[key]) {
  //     groupedLocations[key] = [];
  //   }
  //   groupedLocations[key].push(location);
  // }

  // return groupedLocations;

  return locations;
}

// Load the JSON data
fs.readFile('flights.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const json = JSON.parse(data);
    const groupedData = processFlights(json);

    // Print the grouped data (optional)
    // for (const cityName in groupedData) {
    //   console.log(`City: ${cityName}`);
    //   for (const location of groupedData[cityName]) {
    //     console.log(`\t- ${location.label}: $${location.flight.expectedPrice} ${location.searchUrl}`); //(${location.flight.url})`);
    //   }
    // }

    for(const location of groupedData) {
      console.log(`${location.label}: $${location.flight.expectedPrice} ${location.searchUrl}`);
    }
  } catch (error) {
    console.error('Error processing JSON data:', error);
  }
});
