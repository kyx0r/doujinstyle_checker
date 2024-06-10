#!/bin/sh

if [ $# -lt 2 ]; then
	echo "./scrap.sh [startid] [endid]"
	exit 1
fi

start=$1
end=$2

while [ "$start" -le "$end" ]; do
	data=$(curl -v 'https://doujinstyle.com/' \
	-H 'content-type: application/x-www-form-urlencoded' \
	-H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' \
	--data-raw "type=1&id=${start}&source=0&download_link=" 2>&1)
	var=$(printf '%s' "$data" | grep "location:" | cut -d ' ' -f3)
	if [ "$var" ]; then
		printf '%s ' "$start"
		printf '%s\n' "$var"
	fi
	start=$((start+1))
done
