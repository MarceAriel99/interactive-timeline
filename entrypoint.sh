#!/bin/sh

rsync -arv /usr/src/cache/node_modules/. /app/node_modules/
# to keep the container running
#tail -f /dev/null
# for starting the app
exec npm start