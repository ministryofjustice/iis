const $ = require('jquery');

(() => {
    $(':input[name=filter]').on('change', filterTable)
        .on('keyup', filterTable);
})();

function filterTable(event) {
    const input = $(this).val().toLowerCase();
    $('#filterTable .filterableRow')
        .filter(inputInItem(input)).show()
        .end().filter(isVisible)
        .filter(inputNotInItem(input)).hide();

}

function inputInItem(input) {
    return function(index) {
        return $(this).data('id').toLowerCase().indexOf(input) > -1;
    }
}

function inputNotInItem(input) {

    return function(index) {
        return $(this).data('id').toLowerCase().indexOf(input) === -1;
    }
}

function isVisible(item) {
    return $(item).is(':visible') || !$(item).attr('style')
}
