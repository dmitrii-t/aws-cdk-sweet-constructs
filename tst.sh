#!/usr/bin/env bash

export TS_NODE_PROJECT=tsconfig.test.json

npm run bld && env-cmd mocha --grep "${1}" --timeout 600000 --require ./babel-hook.js "./lib/**/*.spec.ts"