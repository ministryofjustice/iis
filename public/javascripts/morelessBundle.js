/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = jQuery;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
const $ = __webpack_require__(1);
const NUMBER_EACH_END = 3;
let listItems;
let listLength;
(() => {
  listItems = $('.listItem');
  listLength = listItems.length;
  if (listLength > NUMBER_EACH_END * 2) {
    hideMiddleItems();
    addButton();
  }
})();
function hideMiddleItems() {
  const listLength = listItems.length;
  $(listItems).each((index, item) => {
    if (index >= NUMBER_EACH_END && index < listLength - NUMBER_EACH_END) {
      $(item).addClass('js-hidden');
      $(item).attr('aria-hidden', 'true');
    }
  });
}
function addButton() {
  $('<a id="showFullList" class="button marginBottom">• • •</a>').insertAfter(listItems[NUMBER_EACH_END]).on('click', showAllAndRemoveButton);
}
function showAllAndRemoveButton() {
  $(this).remove();
  $(listItems).each((index, item) => {
    $(item).removeClass('js-hidden');
    $(item).attr('aria-hidden', 'false');
  });
}
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
const $ = __webpack_require__(1);
const moreLessMarkup = '<li id="moreless" class="font-xsmall"><a>more</a></li>';
const hideableItems = $('#prisonerInfoSummary').children().filter($('.initiallyHidden'));
let moreless;
(() => {
  $('.initiallyHidden').removeClass('initiallyHidden');
  if (hideableItems.length > 0) {
    $('#prisonerInfoSummary').append(moreLessMarkup);
  }
  moreless = '#moreless a';
  hide();
  $(moreless).on('click', morelessClickHandler);
})();
function morelessClickHandler() {
  if ($(moreless).text() === 'more') {
    $(moreless).first().text('less');
    reveal();
    return;
  }
  $(moreless).text('more');
  hide();
}
function hide() {
  $(hideableItems).each((index, item) => {
    $(item).addClass('js-hidden');
    $(item).attr('aria-hidden', 'true');
  });
}
function reveal() {
  $(hideableItems).each((index, item) => {
    $(item).removeClass('js-hidden');
    $(item).attr('aria-hidden', 'false');
  });
}
})();

/******/ })()
;