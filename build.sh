#!/usr/bin/env bash
set -e

# Read the version from package.json
VERSION=$(cat package.json | jq -r .version)
VERSION_UPDATED_AT_RAW=$(cat package.json | jq -r .VERSION_UPDATED_AT)

# Normalize the VERSION_UPDATED_AT
VERSION_UPDATED_AT=$(date -u -d "$VERSION_UPDATED_AT_RAW" +'%Y-%m-%dT%H:%M:%SZ')
VERSION_UPDATED_AT_GERMAN=$(date -d "$VERSION_UPDATED_AT_RAW" +'%d.%m.%Y')

# Check the branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ $BRANCH == *"dev"* ]]; then
  VERSION="$VERSION-$BRANCH"
fi

# Get the current build time and commit hash
BUILD_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
COMMIT_HASH=$(git rev-parse HEAD)

npm run build

# Optimize SVG files in build output
npm run optimize:svg:build

# Replace placeholder strings in the /dist folder
find ./dist -type f -exec sed -i "s/%BUILD_TIME%/$BUILD_TIME/g" {} \;
find ./dist -type f -exec sed -i "s/%VERSION_UPDATED_AT%/$VERSION_UPDATED_AT/g" {} \;
find ./dist -type f -exec sed -i "s/%VERSION_UPDATED_AT_GERMAN%/$VERSION_UPDATED_AT_GERMAN/g" {} \;
find ./dist -type f -exec sed -i "s/%GIT_COMMIT%/$COMMIT_HASH/g" {} \;
find ./dist -type f -exec sed -i "s/%BRANCH_NAME%/$BRANCH/g" {} \;
find ./dist -type f -exec sed -i "s/%VERSION_NAME%/$VERSION/g" {} \;

rsync -avzO --ignore-times --checksum --delete-after --fuzzy ./dist/uba-waermepumpen/browser/ \
 till.seifert.name@till.seifert.name:public_html/projects/uba-waermepumpen/
