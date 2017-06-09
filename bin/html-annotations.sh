#!/usr/bin/env bash

"$(dirname $0)/flow-annotation-check.js" \
  | awk 'BEGIN{print "<table>"} {print "<tr>";for(i=1;i<=NF;i++)print "<td>" $i"</td>";print "</tr>"} END{print "</table>"}' \
  | tee $1
