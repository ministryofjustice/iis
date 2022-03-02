#/bin/bash

# Clean
rm -rf public govuk_modules .port.tmp *.log build uploads test-results.xml

# Copy govuk library assets out of node_modules to top level 
mkdir -p ./govuk_modules/govuk_frontend_toolkit
mkdir -p ./govuk_modules/govuk_template/layouts
mkdir -p ./govuk_modules/govuk_template/assets
mkdir -p ./govuk_modules/govuk-elements-sass

cp -R node_modules/govuk_frontend_toolkit/*             ./govuk_modules/govuk_frontend_toolkit/
cp -R node_modules/govuk_template_jinja/views/layouts/* ./govuk_modules/govuk_template/layouts/
cp -R node_modules/govuk_template_jinja/assets/*        ./govuk_modules/govuk_template/assets/
cp -R node_modules/govuk-elements-sass/public/sass/*    ./govuk_modules/govuk-elements-sass/

# Create public assets
mkdir -p ./public/images
mkdir -p ./public/javascripts
mkdir -p ./public/stylesheets

cp -R ./assets/images/*        ./public/images
cp ./assets/javascripts/*.js   ./public/javascripts/

cp ./govuk_modules/govuk_template/assets/stylesheets/govuk-template-ie8.css ./public/stylesheets

# Build CSS
sass    --no-source-map \
        --load-path=govuk_modules/govuk_frontend_toolkit/stylesheets \
        --load-path=govuk_modules/govuk_template/assets/stylesheets \
        --load-path=govuk_modules/govuk-elements-sass/ \
        ./assets/sass/application.scss:./public/stylesheets/application.css \
        ./assets/sass/print.scss:./public/stylesheets/print.css \
        ./assets/sass/application-ie8.sass:./public/stylesheets/application-oldie.css
