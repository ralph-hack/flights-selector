const fs = require('fs');

function processFlights(data) {
  const flights = [];
  for (const itinerary of data.destinations) {
    const flight = itinerary.flightInfo;
    const {city, country, airport} = itinerary;
    const searchUrl = `https://www.kayak.com/${itinerary.clickoutUrl}`
    const location = {
      city: {
        id: city.id,
        name: city.name
      },
      country: {
        id: country.id, 
        name: country.name,
        code: country.code
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
    flights.push(location);
  }

  // Sort accommodations by review rating (descending) and then by price (ascending)
  flights.sort((a, b) => {
    if (a.reviewRating !== b.reviewRating) {
      return b.reviewRating - a.reviewRating;
    } else {
      return a.price - b.price;
    }
  });

  // Group accommodations by review rating
  const groupedAccommodations = {};
  for (const accommodation of flights) {
    const reviewRating = accommodation.reviewRating;
    const reviewRatingAsSting = accommodation.reviewRatingAsString
    const key = reviewRating ?? reviewRatingAsSting
    if (!groupedAccommodations[key]) {
      groupedAccommodations[key] = [];
    }
    groupedAccommodations[key].push(accommodation);
  }

  return groupedAccommodations;
}

// Load the JSON data
fs.readFile('accommodations.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const json = JSON.parse(data);
    const groupedData = processFlights(json);

    // Print the grouped data (optional)
    for (const score in groupedData) {
      console.log(`Review Score: ${score}`);
      for (const accommodation of groupedData[score]) {
        console.log(`\t- ${accommodation.title}: $${accommodation.price} ${accommodation.url}`);
      }
    }
  } catch (error) {
    console.error('Error processing JSON data:', error);
  }
});
