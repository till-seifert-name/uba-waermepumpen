#!/usr/bin/env bash
set -e

npm run build-dev
rsync -avzO --ignore-times --checksum --delete-after --fuzzy ./dist/dbu-online-tool/ \
 till.seifert.name@till.seifert.name:public_html/projects/dbu-online-tool/

npm run build
rsync -avzO --ignore-times --checksum --delete-after --fuzzy ./dist/dbu-online-tool/ \
 root@my-eroads.de:/var/www/vhosts/nachhaltige-oeffentliche-pkw-beschaffung.de/betatest/
