const $ = require('jquery');

(() => {
    $(':input[name=toggle_criteria]').on('change', () => {
        $('form[name="toggleTerm"]').submit();
    });
})();
