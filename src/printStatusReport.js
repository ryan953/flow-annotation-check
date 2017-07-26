'use strict';

/**
 * @flow
 */

import type {FlowStatus, StatusReport} from './types';

import os from 'os';

function htmlPair(first: string, second: string) {
  return `<tr><td>${first}</td><td>${second}</td></tr>`;
}

function countByStatus(report: StatusReport, status: FlowStatus): string {
  const count = report.filter((entry) => entry.status === status).length
  return report.length === 0
    ? '0'
    : `${count} (${Math.round(count/report.length * 10000) / 100}%)`;
}

function escapeXML(value: string): string {
  return value.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function asText(report: StatusReport, summaryOnly: boolean): Array<string> {
  if (summaryOnly) {
    return [
      `@flow ${countByStatus(report, 'flow')}`,
      `@flow weak ${countByStatus(report, 'flow weak')}`,
      `no flow ${countByStatus(report, 'no flow')}`,
      `Total Files ${String(report.length)}`,
    ];
  } else {
    return report.map((entry) => `${entry.status}\t${entry.file}`);
  }
}

export function asHTMLTable(report: StatusReport, summaryOnly: boolean): Array<string> {
  if (summaryOnly) {
    return [
      '<table>',
      htmlPair('@flow', countByStatus(report, 'flow')),
      htmlPair('@flow weak', countByStatus(report, 'flow weak')),
      htmlPair('no flow', countByStatus(report, 'no flow')),
      htmlPair('Total Files', String(report.length)),
      '</table>'
    ];
  } else {
    return [
      '<table>',
      '<tfoot>',
      htmlPair('@flow', countByStatus(report, 'flow')),
      htmlPair('@flow weak', countByStatus(report, 'flow weak')),
      htmlPair('no flow', countByStatus(report, 'no flow')),
      htmlPair('Total Files', String(report.length)),
      '</tfoot>',
      '<tbody>',
      ...report.map((entry) => [
        `<tr data-status="${entry.status}">`,
          `<td>${entry.status}</td>`,
          `<td>${escapeXML(entry.file)}</td>`,
        `</tr>`
      ].join("\n")),
      '</tbody>',
      '</table>'
    ];
  }
}

export function asCSV(report: StatusReport, summaryOnly: boolean): Array<string> {
  if (summaryOnly) {
    return [
      `"@flow", "${countByStatus(report, 'flow')}"`,
      `"@flow weak", "${countByStatus(report, 'flow weak')}"`,
      `"no flow", "${countByStatus(report, 'no flow')}"`,
      `"Total Files", "${String(report.length)}"`,
    ];
  } else {
    return report.map((entry) => [
      JSON.stringify(entry.status),
      JSON.stringify(entry.file),
    ].join(', '));
  }
}

export function asJUnit(report: StatusReport, summaryOnly: boolean): Array<string> {
  const date = (new Date()).toISOString();
  const host = os.hostname();
  const tests = report.length;
  const failures = report.length - report.filter((entry) => entry.status === 'flow').length;
  if (summaryOnly) {
    return [
      `<testsuite name="flow-annotation-check" timestamp="${date}" time="0" hostname="${host}" tests="${tests}" failures="${failures}" errors="0">`,
      '</testsuite>',
    ];
  } else {
    return [
      `<testsuite name="flow-annotation-check" timestamp="${date}" time="0" hostname="${host}" tests="${tests}" failures="${failures}" errors="0">`,
      ...report.map((entry) => entry.status === 'flow'
        ? `<testcase classname="${escapeXML(entry.file)}" name="HasFlowStatus" time="0" />`
        : [
            `<testcase classname="${escapeXML(entry.file)}" name="HasFlowStatus" time="0">`,
            `<failure type="${entry.status === 'no flow' ? 'HasNoneStatus' : 'HasFlowWeakStatus'}">`,
            `Status is "${entry.status}"`,
            `</failure>`,
            `</testcase>`,
          ].join(''),
      ),
      '</testsuite>',
    ];
  }
}
