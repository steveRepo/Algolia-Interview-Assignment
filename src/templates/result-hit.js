/**
* Result Hit
* 
* Based on documentation from:
* https://www.algolia.com/doc/guides/building-search-ui/events/js/ 
* https://github.com/algolia/doc-code-samples/blob/master/instantsearch.js/algolia-insights/src/app.js
* https://www.algolia.com/doc/api-reference/widgets/hits/js/#click-and-conversion-events
* https://www.algolia.com/doc/api-reference/widgets/hits/js/#connector-param-render-sendevent
* https://www.algolia.com/doc/api-reference/widgets/insights/js/#widget-param-hits
* https://www.algolia.com/doc/api-reference/widgets/hits/js/
* 
*/
// Pass in the hit object : https://www.algolia.com/doc/api-reference/widgets/hits/js/
const resultHit = (hit, { html, sendEvent }) => {

    // Unified event handler for both clicks and conversions
    const handleEvent = (eventCategory, eventType) => {
      try {
        // Unified handler for both click and conversion events: https://www.algolia.com/doc/api-reference/widgets/insights/js/#widget-param-hits
        sendEvent(eventCategory, hit, eventType, {
          onSale: hit.on_sale,         // I opted to add this field to the data in anticipation that the customer would want to filter on sale items. 
          categories: hit.categories,  // Tracking the product categories 
          brand: hit.brand,            // Tracking the product brand 
          name: hit.name,              // Tracking the product name
          price: hit.price,            // Tracking the product price
        });
        // Flag in console if event is not sent
      } catch (error) {
        console.error('Error sending click event:', error);
      }
    };
  
    // I noticed that hit._highlightResult.name.value was breaking html entities. I ceated a temporary div to decode HTML entities.
    const div = document.createElement('div');
    div.innerHTML = hit._highlightResult.name.value;
    const name = div.textContent;
    
    return html`
      <a class="result-hit">
        <div class="result-hit__image-container">
          <!-- Image click with alt text for SEO and accessibility -->
          <img 
            class="result-hit__image" 
            src="${hit.image}" 
            alt="${name}"
            onClick=${() => handleEvent('click', 'Product Image Viewed')}
          />
        </div>
        <div class="result-hit__details">
          <!-- Product title with click tracking -->
          <h3 
            class="result-hit__name"
            onClick=${() => handleEvent('click', 'Product Title Viewed')}
          >
            ${name}
          </h3>
          <p class="result-hit__price">$${hit.price}</p>
        </div>
        <div class="result-hit__controls">
          <div>
            <!-- View product details button -->
            <button 
              id="view-item" 
              class="result-hit__view"
              onClick=${() => handleEvent('click', 'Product Viewed')}
            >
              View
            </button>
            <!-- Add to cart button with conversion tracking -->
            <button 
              id="add-to-cart" 
              class="result-hit__cart"
              onClick=${() => handleEvent('conversion', 'Product Added to Cart')}
            >
              Add To Cart
            </button>
          </div>
        </div>
      </a>
    `;
  };
  
  export default resultHit;