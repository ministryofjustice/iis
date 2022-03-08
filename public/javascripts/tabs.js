/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = jQuery;

/***/ }),
/* 2 */,
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var $ = __webpack_require__(1);

var tabs;
var panels;

exports.init = function (container) {
  $('.initiallyHidden').removeClass('initiallyHidden').addClass('js-hidden').attr('aria-hidden', 'true');
  tabs = $(container).find('.searchTab');
  panels = $(container).find('.tabPanel');
  $(tabs).each(function (index, value) {
    $(value).on('click', selectTab);
  });
};

function selectTab(event) {
  var tabSelected = $(event.target).data('tab');
  updateTabSelected(tabSelected);
  updatePageVisible(tabSelected);
}

function updateTabSelected(tabSelected) {
  $(tabs).each(function (index, value) {
    if ($(value).data('tab') === tabSelected) {
      $(value).parent().addClass('active');
    } else {
      $(value).parent().removeClass('active');
    }
  });
}

function updatePageVisible(tabSelected) {
  $(panels).each(function (index, value) {
    if ($(value).data('panel') === tabSelected) {
      $(value).removeClass('js-hidden').attr('aria-hidden', 'false');
    } else {
      $(value).addClass('js-hidden').attr('aria-hidden', 'true');
    }
  });
}

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
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var _require = __webpack_require__(3),
    init = _require.init;

var $ = __webpack_require__(1);

init('#formHolder');
})();

/******/ })()
;