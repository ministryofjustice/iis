'use strict';
const moment = require('moment');
const url = require('url');
const Case = require('case');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const PRISON_NUMBER_LENGTH = 8;

const acronyms = [
  'ARD',
  'ARP',
  'CRC',
  'CJA',
  'DTO',
  'EPP',
  'GOAD',
  'HDC',
  'HMP',
  'HMYOI',
  'IPP',
  'NFA',
  'NPS',
  'OMU',
  'YMCA',
  'YO',
  'YOI',
  'YP'
];

module.exports = {

  pad: function(n) {
    return (n < 10) ? ('0' + parseInt(n)) : n;
  },

  padPrisonNumber: function(v) {
    let spaces = '';

    for (let i = 0; i < PRISON_NUMBER_LENGTH - v.length; i++) {
      spaces += ' ';
    }

    return (v.length < PRISON_NUMBER_LENGTH) ? (spaces + v) : v;
  },

  wildcardify: function(value, minValue) {
    if (value.toString().length === minValue) {
      return value;
    }
    return '%'.concat(value, '%');
  },

  getAgeFromDOB: function(dateInGDSFormat) {
    const dob = moment(dateInGDSFormat, 'DD/MM/YYYY');
    return moment().diff(dob, 'years', false);
  },

  getDateRange: function(age) {
    if (age.indexOf('-') === -1) {
      const startDate = this.getCurrentTime()
          .subtract(age, 'years')
          .subtract(1, 'years')
          .add(1, 'days')
          .format('YYYYMMDD');

      const endDate = this.getCurrentTime().subtract(age, 'years').format('YYYYMMDD');
      return [startDate, endDate];
    }

    const ages = age.split('-');
    const startDate = this.getCurrentTime()
        .subtract(ages[1], 'years')
        .subtract(1, 'years')
        .add(1, 'days')
        .format('YYYYMMDD');

    const endDate = this.getCurrentTime().subtract(ages[0], 'years').format('YYYYMMDD');
    return [startDate, endDate];
  },

  pagination: function(rowCount, currPage) {
    currPage = (currPage) ? currPage : 1;

    const totalPages = Math.ceil(rowCount / resultsPerPage);
    const showPrev = (currPage - 1) == 0 ? false : true;
    const showNext = currPage == totalPages ? false : true;

    return {
      totalPages: totalPages,
      currPage: currPage,
      showPrev: showPrev,
      showNext: showNext
    };
  },

  getCurrentTime: function() {
    return moment();
  },

  getFormattedDateFromString: function(dateAsIISDateFormat) {
    return dateAsIISDateFormat == '18991231' ? null : moment(dateAsIISDateFormat, 'YYYYMMDD').format('DD/MM/YYYY');
  },

  getPathFromURL: function(v) {
    return url.parse(v).path;
  },

  acronymsToUpperCase: function(text) {
    return acronyms.map(function(acronym) {
      const pattern = '\\b(' + acronym + ')\\b';
      const regex = new RegExp(pattern, 'gi');
      text = text.replace(regex, Case.upper(acronym));
      return text;
    }).pop();
  },

  cleanAddressSearch: function(input) {
    const search = input.replace(/([.,])/g, ' ').replace(/(['])/g, '');

    const searchTerms = search.split(' ').filter(term => term.trim());

    return searchTerms.join(', ');
  }
};
