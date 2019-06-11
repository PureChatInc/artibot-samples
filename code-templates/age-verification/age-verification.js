﻿/**
 * This template checks the provided age of a lead by and
 * branches differently depending on if they are 21 or older.
 *
 * Provide the field name of the age question field, `AGE_FIELD`, where
 * the user is prompted to provide their age. After that, the check is done,
 * and the bot is told to branch to either the over or under 21 field.
 * Those are provided via the `OVER21_BRANCH_TARGET` and `UNDER21_BRANCH_TARGET`
 * field names.
 * 
 * This example is designed to be used as a Code Action (code runs
 * without a question being asked.) It relies on input from another
 * question (the `AGE_FIELD` question with a Field Type of "Number") and two
 * different fields that can be branched to:
 * `OVER21_BRANCH_TARGET` and `UNDER21_BRANCH_TARGET`.
 */

const AGE_FIELD = '<AGE_FIELD>';
const OVER21_BRANCH_TARGET = '<OVER21_BRANCH_TARGET>';
const UNDER21_BRANCH_TARGET = '<UNDER21_BRANCH_TARGET>';

/**
 * ArtiBot Code Handler
 */
exports.handler = (artibotContext) => {
    if (!artibotContext.lead.data[AGE_FIELD]) {
        throw new Error(`Field named ${AGE_FIELD} does not exist.`);
    }

    const age = parseInt(artibotContext.lead.data[AGE_FIELD].value, 10);
    const over21 = age >= 21;

    return {
        branch_to_override: over21
            ? OVER21_BRANCH_TARGET
            : UNDER21_BRANCH_TARGET
    };
};
