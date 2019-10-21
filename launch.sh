#!/bin/sh
if [ "$1" = "db:mariadb" ] 
then
    export ACTIVE_DB=mariadb
    gradle -Pmariadb bootRun
else
    export ACTIVE_DB=h2
    gradle bootRun
fi