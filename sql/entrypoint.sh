#!/bin/bash
set -e

/usr/src/app/run-initialization.sh & /opt/mssql/bin/sqlservr
