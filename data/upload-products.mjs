/**
 * Spencer and Williams - Product Price Update - V 1.2
 * ===================================================
 * 
 * Technical Assignment - Part One
 * 
 * Spencer and Williams are having a sale on Cameras. They would like you to create and run a 
 * demo script that reduces the price of everything in the camera category by 20% 
 * and then round to the lowest full number. They have provided the raw data as products.json.
 * The data should be transformed and sent to Algolia in a single script.
 * 
 * 
 * Process: 
 * ----------
 * I investigated the API to upgrade from v4-v5  
 * https://www.algolia.com/doc/libraries/javascript/v5/upgrade/
 * https://www.algolia.com/doc/rest-api/search/#tag/Records/operation/batch
 * https://www.algolia.com/doc/libraries/javascript/v5/helpers/#save-records
 * https://www.algolia.com/doc/api-reference/api-methods/save-objects/
 * 
 *
 * Notes: 
 *  - I anticipated that the customer would like to see the original price displayed next to the sale price, so have added this field.
 *  - It also seemed useful to add an onsale field to the discounted product so that the customer could filter for "on sale items". 
 * 
 * 
 * Outline
 * ----------
 * 
 * 1. Get a list of all the price ranges in the JSON (salePriceRange).
 * 2. Store the original price in anticipation of later display.
 * 3. Calculate the new sale price with a 20% reduction.
 * 4. If the product is a camera, replace the original price with the sale price.
 * 5. Find the new price range for the sale price to filter on.
 * 6. Return transformed camera product array.
 * 7. Upload the updated data to Algolia via client.saveObjects with error checks in case of failed upload.
 *
 * Use
 * ----------
 * npm install 
 * set env vars
 * $ node upload-products.mjs
 */

// Import Algolia client library and file system module
import { algoliasearch } from 'algoliasearch';
import { readFileSync } from 'fs';

// Get credentials to connect to Algolia
const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_API_KEY; 
const indexName = process.env.ALGOLIA_INDEX;

// Initialize Algolia client with credentials
const client = algoliasearch(appId, apiKey);

// Read and parse the JSON file containing the products
const products = JSON.parse(readFileSync('./products.json', 'utf8'));

// Create an array to store each price range to categorize products by sale price later
const priceRanges = [];
products.forEach(product => {
    // Only add price ranges we haven't seen before into the price range array to get all price ranges
    if (!priceRanges.includes(product.price_range)) {
        priceRanges.push(product.price_range);
    }
});

console.log("Processing products...");
// Process and transform each product in our data set
// Create a new array with the modified product data and map each sale price into the product object
const processed = products.map(product => {
    const isCamera = product.categories.some(category => 
        category.toLowerCase().includes('camera'));
    // If the product is a camera, then we need to calculate and replace the current price value with the new sale price
    if (isCamera) {
        // Store the original price for display
        const originalPrice = product.price;                            // Store original price
        const discountedPrice = Math.floor(originalPrice * 0.8);        // Calculate 20% discount

        // Find the new price range for the discounted price
        const newPriceRange = priceRanges.find(range => {
            // Extract the min and max via regex match (in case there are typos)
            const [min, max] = range.match(/\d+/g).map(Number);
            // Check if discounted price falls within this range 
            return discountedPrice >= min && discountedPrice <= max;
        });

        return {
            ...product,
            original_price: originalPrice,    // Add original price field to display
            price: discountedPrice,           // Update price to discounted price
            price_range: newPriceRange,       // Update price range to match new price
            on_sale: true                     // Flag as on sale
        };
    }

    return {
        ...product,     // Spread all existing product properties
        on_sale: false  // Add on-sale flag
    };
});

// Function to upload data to Algolia
async function uploadToAlgolia() {
    try {
        console.log("Uploading to Algolia...");
        
        // Use V5 client.saveObjects to upload
        const response = await client.saveObjects({
            indexName: indexName, // Specify index name
            objects: processed    // Pass the processed array of objects
        }, {
            autoGenerateObjectIDIfNotExist: true // Generate ID if it doesnt exist
        });

        console.log('Upload completed successfully.');
        console.log('Response:', response);
        console.log(`Total objects uploaded: ${processed.length}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the upload function
uploadToAlgolia();
