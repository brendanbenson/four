#!/bin/sh
git pull -r
npm install
bower install --allow-root
grunt
touch tmp/restart.txt