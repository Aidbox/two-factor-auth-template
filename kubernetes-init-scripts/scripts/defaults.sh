#!/bin/bash

PGUSER=postgres

AIO_HOST=0.0.0.0
AIO_PORT=8081
APP_ID=app-twofactor-demo
AIDBOX_PORT=8080
AIDBOX_CLIENT_ID=root

case $TIER in
    master)
        AIDBOX_BASE_URL=https://master-backend.twofactor-demo.beda.software
        FRONTEND_URL=https://master.twofactor-demo.beda.software
        ;;
    staging)
        AIDBOX_BASE_URL=https://staging-backend.twofactor-demo.beda.software
        FRONTEND_URL=https://staging.twofactor-demo.beda.software
        ;;
    develop)
        AIDBOX_BASE_URL=https://develop-backend.twofactor-demo.beda.software
        FRONTEND_URL=https://develop.twofactor-demo.beda.software
        ;;
esac
