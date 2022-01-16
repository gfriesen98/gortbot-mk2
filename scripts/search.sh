#!/bin/bash
param=$1
len=$(grep -iF "$param" /tmp/plex/lists/movies.txt | wc -l)
echo "Total: $len"
grep -iF "$param" /tmp/plex/lists/movies.txt