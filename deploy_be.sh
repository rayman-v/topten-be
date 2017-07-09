#!/bin/bash
cd /home/lvrunjia/deploy/topten-be/tag/
timestamp=`date '+%s'`
git clone https://github.com/rayman-v/topten-be.git ${timestamp}
cd ${timestamp}
npm install
pm2 reload toptenbe
ln -s /home/lvrunjia/deploy/topten-be/tag/${timestamp} /home/lvrunjia/deploy/topten-be/dist