#!/usr/bin/env bash
set -e

npm run prerender-dev
rsync -avzO --ignore-times --checksum --delete-after --fuzzy ./dist/dbu-online-tool/browser/ \
 till.seifert.name@till.seifert.name:public_html/projects/dbu-online-tool/
