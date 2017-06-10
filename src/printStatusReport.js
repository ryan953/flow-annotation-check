'use strict';

/**
 * @flow
 */

import type {FlowStatus, StatusReport} from './types';

export function asText(report: StatusReport): Array<string> {
  return report.map((entry) => `${entry.status}\t${entry.file}`);
}

export function asHTMLTable(report: StatusReport): Array<string> {
  function htmlPair(first: string, second: string) {
    return `<tr><td>${first}</td><td>${second}</td></tr>`;
  }
  function htmlCount(status: FlowStatus): string {
    const count = report.filter((entry) => entry.status === status).length
    return report.length === 0
      ? '0'
      : `${count} (${Math.round(count/report.length * 10000) / 100}%)`;
  }

  return [
    '<table>',
    '<tbody>',
    ...report.map((entry) =>
      `<tr data-status="${entry.status}">
        <td>${entry.status}</td>
        <td>${entry.file}</td>
      </tr>`
    ),
    '</tbody>',
    '<tfoot>',
    htmlPair('@flow', htmlCount('flow')),
    htmlPair('@flow weak', htmlCount('flow weak')),
    htmlPair('no flow', htmlCount('no flow')),
    htmlPair('Total Files', String(report.length)),
    '</tfoot>',
    '</table>'
  ];
}

export function asCSV(report: StatusReport): Array<string> {
  return report.map((entry) => [
      JSON.stringify(entry.status),
      JSON.stringify(entry.file),
    ].join(', ')
  );
}
