#!/bin/bash

if [[ "$RUN_MODE" == "dev" ]]; then
    npm run dev
else
    npm run start
fi