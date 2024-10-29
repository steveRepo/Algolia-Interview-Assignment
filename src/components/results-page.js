/**
 * Result Page
 * 
 * Based on documentation from:
 * https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/
 * 
 */

import algoliasearch from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import { searchBox, hits, pagination, refinementList } from 'instantsearch.js/es/widgets';
import resultHit from '../templates/result-hit';

/**
 * @class ResultsPage
 * @description Instant Search class to display content on main page with Algolia Insights enabled
 */
class ResultPage {
  constructor() {
    this._registerClient();
    this._registerWidgets();
    this._startSearch();
  }

  /**
   * @private
   * @description Handles creating the search client and creating an instance of instant search
   * @return {void}
   */
  _registerClient() {
    this._searchClient = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_API_KEY
    );

    // Initialize InstantSearch with Insights enabled
    this._searchInstance = instantsearch({
      indexName: process.env.ALGOLIA_INDEX,
      searchClient: this._searchClient,
      // Enable Algolia Insights https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#use-the-insights-option
      insights: true, 
    });
  }

  /**
   * @private
   * @description Adds widgets to the Algolia instant search instance
   * @return {void}
   */
  _registerWidgets() {
    this._searchInstance.addWidgets([
      searchBox({
        container: '#searchbox',
      }),
      hits({
        container: '#hits',
        templates: {
          item: resultHit,  // Use the resultHit template for displaying each item
        },
        // Enable insights to automatically track click and conversion events: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#use-the-insights-option
        insights: true,  
      }),
      pagination({
        container: '#pagination',
      }),
      refinementList({
        container: '#brand-facet',
        attribute: 'brand',
      }),
      refinementList({
        container: '#categories-facet',
        attribute: 'categories',
      }),
    ]);
  }

  /**
   * @private
   * @description Starts instant search after widgets are registered
   * @return {void}
   */
  _startSearch() {
    this._searchInstance.start();
  }
}

export default ResultPage;