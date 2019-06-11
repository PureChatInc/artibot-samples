/**
 * This template takes a city and look up the weather for that city
 * via the OpenWeatherMap API. It stores the current temperature
 * and cloud coverage as additional data on the lead.
 * 
 * The first step is to obtain an API key from OpenWeatherMap, which
 * can be done by signing up at: https://openweathermap.org/.
 * Once you have your API key, put that into the `OPEN_WEATHER_MAP_API_KEY`
 * variable.
 * 
 * Next provide the field name of where to grab the city provided
 * by the user in the `CITY_FIELD` variable.
 * 
 * This example is designed to be used as a Code Action (code runs
 * without a question being asked.) It relies on input from another
 * question (the `CITY_FIELD` question.)
 * 
 * It could be written to work as a Code Question with the city being 
 * provided as the input rather than relying on pulling in the answer
 * to a city question from `CITY_FIELD`.
 */

const https = require('https');
const querystring = require('querystring');

// OpenWeatherMap API key obtained from https://openweathermap.org/
const OPEN_WEATHER_MAP_API_KEY = '<OPEN_WEATHER_MAP_API_KEY>';

// Name of the field to grab city from
const CITY_FIELD = '<CITY_FIELD>';

/**
 * ArtiBot Code Handler
 */
exports.handler = (artibotContext, callback) => {

    const city = artibotContext.lead.data[CITY_FIELD].value;
    
    const parameters = {
        units: 'imperial',
        cnt: 1,
        q: city,
        mode: 'json',
        appid: OPEN_WEATHER_MAP_API_KEY
    };

    const options = {
        host: 'api.openweathermap.org',
        port: 443,
        path: `/data/2.5/forecast?${querystring.stringify(parameters)}`,
        method: 'POST'
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (d) => {
            data += d;
        });

        res.on('end', () => {
            let responseJson = JSON.parse(data);
            let temp = null;
            let clouds = null;

            if (responseJson !== null && responseJson.list.length > 0) {
                const cityInfo = responseJson.list[0];
                temp = cityInfo.main.temp;

                if (cityInfo.weather !== null && cityInfo.weather.length > 0) {
                    clouds = cityInfo.weather[0].description;
                }
            }

            const additionalLeadData = {
                additional_data: [{
                    name: 'Temperature',
                    value: temp.toFixed(1) + '°'
                }, {
                    name: 'Clouds',
                    value: clouds
                }]
            };
            callback(additionalLeadData);
        });
    });

    req.on('error', (error) => {
        throw new Error(error);
    });

    req.end();
};
