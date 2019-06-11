/**
 * This template just validates the provided age of a lead by making
 * sure that they are over 21 and branching accordingly.
 * 
 * Provide the field name of the age question field, `AGE_FIELD`,  where
 * the user is prompted to provide their age. After that, the check is done,
 * and the bot is told to branch to either the over or under 21 fields.
 * Those are provided via the `OVER21_BRANCH_TARGET` and `UNDER21_BRANCH_TARGET`
 * names.
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

    const age = parseInt(artibotContext.lead.data[AGE_FIELD], 10);
    const over21 = age >= 21;

    return {
        branch_to_override: over21
            ? OVER21_BRANCH_TARGET
            : UNDER21_BRANCH_TARGET
    };
};
