/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $ = __webpack_require__(0);

var NUMBER_EACH_END = 3;
var listItems = void 0;
var listLength = void 0;

(function () {
    listItems = $('.listItem');
    listLength = listItems.length;
    if (listLength > NUMBER_EACH_END * 2) {
        hideMiddleItems();
        addButton();
    }
})();

function hideMiddleItems() {
    var listLength = listItems.length;

    $(listItems).each(function (index, item) {
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
    $(listItems).each(function (index, item) {
        $(item).removeClass('js-hidden');
        $(item).attr('aria-hidden', 'false');
    });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $ = __webpack_require__(0);

var moreLessMarkup = '<li id="moreless" class="font-xsmall"><a>more</a></li>';
var hideableItems = $('#prisonerInfoSummary').children().filter($('.initiallyHidden'));
var moreless = void 0;

(function () {
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
    $(hideableItems).each(function (index, item) {
        $(item).addClass('js-hidden');
        $(item).attr('aria-hidden', 'true');
    });
}

function reveal() {
    $(hideableItems).each(function (index, item) {
        $(item).removeClass('js-hidden');
        $(item).attr('aria-hidden', 'false');
    });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(1);


/***/ })
/******/ ]);