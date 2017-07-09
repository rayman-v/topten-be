#!/bin/bash
cd /home/lvrunjia/deploy/topten-be/dist
git pull origin master
npm install
pm2 reload toptenbe