#!/bin/bash
cd src/main/resources
git clone https://github.com/LSTS/ripples-private
cp ripples-private/* .
rm -rf ripples-private