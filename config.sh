#!/bin/bash
git clone https://github.com/LSTS/ripples-private
cp -v ripples-private/config/* src/main/resources
mv -v src/main/resources/application_development.yml src/main/resources/application.yml
rm -rf ripples-private
