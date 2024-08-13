#!/bin/sh

rsync -arv /usr/src/cache/node_modules/. /app/node_modules/
rsync -arv /usr/src/cache/package.json /app/package.json
rsync -arv /usr/src/cache/package-lock.json /app/package-lock.json

# to keep the container running
#tail -f /dev/null
# for starting the app
exec npm start