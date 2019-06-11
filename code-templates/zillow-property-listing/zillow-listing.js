/**
 * This template makes a call into Zillow to grab listing information for a specific
 * address. Zillow returns the number bedrooms, bathrooms, and the Zestimate
 * range for the property at the specified address.
 * 
 * First step is to get an API key from Zillow by going here:
 * https://www.zillow.com/howto/api/APIOverview.htm
 * Just follow the steps and they will send you the key via email.
 * IMPORTANT: Make sure the key is given 'Listings API' permission 
 * or the API call will fail.
 * 
 * Once you get your key, paste it in the `ZILLOW_API_KEY` constant down below.
 * 
 * Next create an "Address" question. Only Line 1, City, State, and
 * Zip are required to make the call to Zillow. Put the field name of that question
 * in the `ADDRESS_FIELD_NAME` constant.
 * 
 * This example is designed to be used as a Code Action (code runs
 * without a question being asked.)
 */

const http = require('http');
const querystring = require('querystring');

// API key from Zillow. Make sure it has the 'Listings API' permission.
const ZILLOW_API_KEY = '<ZILLOW_API_KEY>';

// Field name of the address question to pull data from. Make sure this
// is asking for Line 1, City, State, and Zip as this is a requirement of
// Zillow's API.
const ADDRESS_FIELD_NAME = '<ADDRESS_QUESTION_FIELD_NAME>';

/**
 * Since Zillow's API returns data in XML format, this utility 
 * will convert that XML into usable JSON.
 * 
 * Code from: https://github.com/enkidoo-ai/xml2json
 */
function xml2json(e){return e=cleanXML(e),xml2jsonRecurse(e,0)}function xml2jsonRecurse(e){for(var r,t,n,a,s,l={};e.match(/<[^\/][^>]*>/);)s=e.match(/<[^\/][^>]*>/)[0],r=s.substring(1,s.length-1),t=e.indexOf(s.replace("<","</")),-1==t&&(r=s.match(/[^<][\w+$]*/)[0],t=e.indexOf("</"+r),-1==t&&(t=e.indexOf("<\\/"+r))),n=e.substring(s.length,t),a=n.match(/<[^\/][^>]*>/)?xml2json(n):n,void 0===l[r]?l[r]=a:Array.isArray(l[r])?l[r].push(a):l[r]=[l[r],a],e=e.substring(2*s.length+1+n.length);return l}function cleanXML(e){return e=e.replace(/<!--[\s\S]*?-->/g,""),e=e.replace(/\n|\t|\r/g,""),e=e.replace(/ {1,}<|\t{1,}</g,"<"),e=e.replace(/> {1,}|>\t{1,}/g,">"),e=e.replace(/<\?[^>]*\?>/g,""),e=replaceSelfClosingTags(e),e=replaceAloneValues(e),e=replaceAttributes(e)}function replaceSelfClosingTags(e){var r=e.match(/<[^\/][^>]*\/>/g);if(r)for(var t=0;t<r.length;t++){var n=r[t],a=n.substring(0,n.length-2);a+=">";var s=n.match(/[^<][\w+$]*/)[0],l="</"+s+">",i="<"+s+">",c=a.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);if(c)for(var g=0;g<c.length;g++){var u=c[g],f=u.substring(0,u.indexOf("=")),o=u.substring(u.indexOf('"')+1,u.lastIndexOf('"'));i+="<"+f+">"+o+"</"+f+">"}i+=l,e=e.replace(n,i)}return e}function replaceAloneValues(e){var r=e.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>{1}([^<]+)/g);if(r)for(var t=0;t<r.length;t++){var n=r[t],a=n.substring(0,n.indexOf(">")+1),s=n.substring(n.indexOf(">")+1),l=a+"<_@ttribute>"+s+"</_@ttribute>";e=e.replace(n,l)}return e}function replaceAttributes(e){var r=e.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>/g);if(r)for(var t=0;t<r.length;t++){var n=r[t],a=n.match(/[^<][\w+$]*/)[0],s="<"+a+">",l=n.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);if(l)for(var i=0;i<l.length;i++){var c=l[i],g=c.substring(0,c.indexOf("=")),u=c.substring(c.indexOf('"')+1,c.lastIndexOf('"'));s+="<"+g+">"+u+"</"+g+">"}e=e.replace(n,s)}return e}

/**
 * Calls the Zillow API with the provided API key and grabs information
 * on the address supplied by the address question.
 * @param {string} address
 * @param {string} cityStZip
 * @returns {Promise<listing>} A promise that returns Zillow listing.
 */
const getAddressData = (address, cityStZip) => new Promise((resolve, reject) => {

    const params = {
        'zws-id': ZILLOW_API_KEY,
        address: encodeURI(address),
        citystatezip: encodeURI(cityStZip)
    };
    const query = querystring.stringify(params);
    const url = `http://www.zillow.com/webservice/GetDeepSearchResults.htm?${query}`;
    
    http.get(url, (response) => {
        let body = '';
        
        response.on('data', (chunk) => { body += chunk; });
        
        response.on('end', () => {
            const json = xml2json(body);
            const listing = json.SearchResults.response.results.result;
            resolve(listing);
        });
        
    }).on('error', (err) => {
        
        console.error(err);
        reject(err);
        
    }); 
});

/**
 * ArtiBot Code Handler
 */
exports.handler = async (artibotContext) => {

    const address = artibotContext.lead.data[ADDRESS_FIELD_NAME].value;
    const street = address.line1;
    const cityStZip = `${address.city}, ${address.state} ${address.zip_code}`;
    
    const listing = await getAddressData(street, cityStZip);
    
    const parsedListing = {
        link: listing.links.homedetails,
        address: `${listing.address.street} ${listing.address.city}, ${listing.address.state} ${listing.address.zipcode}`,
        bathrooms: listing.bathrooms,
        bedrooms: listing.bedrooms,
        valuation: {
            high: listing.zestimate.valuationRange.high['_@ttribute'],
            low: listing.zestimate.valuationRange.low['_@ttribute']
        }
    };
    
    let msg = `*Zillow data for ${parsedListing.address}:*\n\n`;
    msg += `Bedrooms: **${parsedListing.bedrooms}**\n\n`;
    msg += `Bathrooms: **${parsedListing.bathrooms}**\n\n`;
    msg += `Zestimate: **${parsedListing.valuation.low} - ${parsedListing.valuation.high}**\n\n`;
    msg += `[Click here to view the listing](${parsedListing.link})`;
    
    return {
        statements: [
            {
                statement: msg
            }
        ]
    };
};