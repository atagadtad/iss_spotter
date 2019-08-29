
const request = require('request');

const fetchMyIP = function (callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      console.log(error);
      callback(error, null);

    } else {
      const data = JSON.parse(body);
      callback(null, data['ip']);
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
  });
};

const fetchCoordsByIP = function (ip, callback) {
  request(`https://ipvigilante.com/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;

    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;

    } else {
      const data = JSON.parse(body);
      let longAndLat = {};
      longAndLat.latitude = data['data']['latitude'];
      longAndLat.longitude = data['data']['longitude'];
      callback(null, longAndLat);
    }
  });
};

const fetchISSFlyOverTimes = function (coords, callback) {
  let distance = coords;
  request(`http://api.open-notify.org/iss-pass.json?lat=${distance['latitude']}&lon=${distance['longitude']}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;

    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;

    } else {
      const data = JSON.parse(body);
      callback(null, data);
    }
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
// const nextISSTimesForMyLocation = function (callback) {
//   fetchMyIP((error, ip) => {
//     if (error) {
//       console.log("It didn't work!", error);
//       return;
//     }
//     return callback(ip);
//   });

//   fetchCoordsByIP(fetchMyIP(callback), (error, data) => {
//     if (error) {
//       console.log('Error: ', error)
//     } else {
//       return callback(data);
//     }
//   });

//   fetchISSFlyOverTimes(fetchCoordsByIP(callback), (error, data) => {
//     if (error) {
//       console.log('Error:', error);
//     } else {
//       return callback(data);
//     }
//   });
// };

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work!", error);
      return;
    }
    fetchCoordsByIP(ip, (error, longAndLat) => {
      fetchISSFlyOverTimes(longAndLat, (error, data) => {
        callback(error, data)
      })
    })
  });
};








module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };