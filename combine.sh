#!/bin/sh
tag=pre
echo "<$tag>"
for arg in "$@"; do
	sed -n "/<$tag>/,/<\/$tag>/p" $arg | sed '1d;$d'
done
echo "</$tag>"
