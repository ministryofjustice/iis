$(document).ready(function() {
    $('#clearSearch').on('click', function() {
        event.preventDefault();

        $('#idForm, #descriptionForm')
            .trigger('reset')
            .find('input').each(clearValueAttributeIfNotHidden);

        $('#clearSearch').blur();
    });
});

function clearValueAttributeIfNotHidden() {
    if ($(this).attr('type') !== 'hidden') {
        $(this).attr('value', '');
    }
}
