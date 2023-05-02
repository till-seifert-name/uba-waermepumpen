#!/usr/bin/env bash
set -e

npm run build-dev
rsync -avzO --ignore-times --checksum --delete-after --fuzzy ./dist/dau-online-tool/ \
 till.seifert.name@till.seifert.name:public_html/projects/dau-online-tool/
