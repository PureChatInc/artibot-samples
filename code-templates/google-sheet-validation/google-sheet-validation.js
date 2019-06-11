/**
 * This template looks for valid answers to a question in a Google Spreadsheet.
 * If an invalid answer is provided, this code indicates that the answer was
 * invalid and writes out all acceptable answers in the chat.
 * 
 * First step is to get an API key from Google.
 * TODO: Step by step through that process here..........................................
 * 
 * Once you get your key, paste it in the `GOOGLE_API_KEY` constant down below.
 * 
 * Next create an Google Sheet.
 * TODO: Document sharing / permissions..................................................
 * Put the field name of that question in the `ADDRESS_FIELD_NAME` constant.
 * 
 * This example is designed to be used as a Code Question.
 */

 const https = require('https');

 // API key from Google.
const GOOGLE_API_KEY = '<GOOGLE_API_KEY>';

/**
 * This ID is the value between the "/d/" and the "/edit" in the URL of your spreadsheet.
 * For example, consider the following URL that references a Google Sheets spreadsheet:
 * https://docs.google.com/spreadsheets/d/GOOGLE_SPREADSHEET_ID/edit#gid=0
 */
 const GOOGLE_SPREADSHEET_ID = '<GOOGLE_SPREADSHEET_ID>';

// Max length of the list in your google sheet
const MAX_LIST_LENGTH = 100; 

/**
 * ArtiBot Code Handler
 */
exports.handler = (artibotContext, callback) => {

	const options = {
		hostname: 'sheets.googleapis.com',
		port: 443,
		path: `/v4/spreadsheets/${GOOGLE_SHEETS_DOCUMENT_ID}/values/Sheet1!A1:A${MAX_LIST_LENGTH}?key=${GOOGLE_API_KEY}`,
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
