﻿/**
 * This template checks the entered zip code and validates
 * it against a list of supported zip codes.  If the zip code entered
 * is not in the list of supported zip codes, a statement is output and
 * the question is asked again or the bot branches to another field.
 *
 * Provide the list of supported area codes in `SUPPORTED_ZIP_CODES`.
 *
 * If you wish to branch to another place in your bot if the entered 
 * zip code is not in the supported zip codes list, enter the name of
 * the field to branch to in `INVALID_BRANCH_TARGET`. 
 * 
 * This example is designed to be used as a Code Question.
 */

// Example supported zip codes
const SUPPORTED_ZIP_CODES = [ '85260', '85261' ];

// Enter the name of a field to branch here to if you would like to use
// branching rather than re-prompting if the provided zip code
// is not in the supported list;
const INVALID_BRANCH_TARGET = null; // Ex: 'Unsupported Zip Code';

/**
 * ArtiBot Code Handler
 */
exports.handler = (artibotContext) => {
    const input = artibotContext.input;
    const branchOnFailure = INVALID_BRANCH_TARGET !== null;

    const zipCodeIsSupported = SUPPORTED_ZIP_CODES.includes(input);

    let result = {};

    if (!zipCodeIsSupported) {
        if (branchOnFailure) {
            result.branch_to_override = INVALID_BRANCH_TARGET;
        } else {
            result.is_valid_input = false;
        }

        result.statements = [
            {
                statement: 'I am sorry but we do not support that zip code.  We currently support the following zip codes: ' + SUPPORTED_ZIP_CODES.join()
            }
        ];
    }
    
    return result;
};
