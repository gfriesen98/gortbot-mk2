#!/bin/bash

output=$(grep -iF "$1" /home/garett/gortbot_temp/masterlist.txt | wc -l)
echo "Total: $output"
grep -iF "$1" /home/garett/gortbot_temp/masterlist.txt