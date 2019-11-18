#!/bin/bash

npm run clean

rm -rf ./node_modules

rm package-lock.json

npm run install

npm run build
