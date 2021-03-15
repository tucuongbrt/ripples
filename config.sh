#!/bin/bash
cd src/main/resources
git clone https://github.com/LSTS/ripples-private
cp -v ripples-private/config/* .
rm -rf ripples-private
