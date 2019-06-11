const https = require('https');

exports.handler = (artibotContext, callback) => {

	const listLength = 100; // Max length of the list in your google sheets
	const googleKey = 'AIzaSyDY5ukHiFc6dHi0lgtGPTTIw8cXuuK3Oq4';

	const options = {
		hostname: 'sheets.googleapis.com',
		port: 443,
		path: `/v4/spreadsheets/13DQ0XT8vXGtW-gP1AzHBsqB1iKR2GHAwu8iWtb1k2Dg/values/Sheet1!A1:A${listLength}?key=${googleKey}`,
		method: 'GET'
	};

	const req = https.request(options, (res) => {
		let data = '';

		res.on('data', (d) => {
			data += d;
		});

		res.on('end', () => {
			let responseJson = JSON.parse(data);
			let allResponses = [];

			if (responseJson.values) {
				let inputToLower = artibotContext.input.toLowerCase();

				for (let i = 0; i < responseJson.values.length; i++) {
					let nextRow = responseJson.values[i];

					if (nextRow.length > 0) {
						nextAcceptableValue = nextRow[0];

						if (nextAcceptableValue !== null && inputToLower === nextAcceptableValue.toLowerCase()) {
							callback({ value: responseJson.values[0] });
						}

						allResponses.push(nextAcceptableValue);
					}
				}

				callback({
					is_valid_input: false,
					statements: [
						{
							statement: `${artibotContext.input} is invalid.  Acceptable values are ${allResponses.join(', ')}`
						}
					]
				});
			}
		});
	});

	req.on('error', (e) => {
		console.error(e);
	});

	req.end();
};
