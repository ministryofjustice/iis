$( document ).ready(function(){
    $('#clearSearch').on('click', function() {
        event.preventDefault();
        $('#idForm').trigger('reset');
        $('#descriptionForm').trigger('reset');
    });
});
