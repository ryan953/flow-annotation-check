'use strict';

/**
 * @flow
 */

import type {EntryFilter} from './flowStatusFilter';
import type {FlowStatus, StatusReport} from './types';

import os from 'os';

type Summary = {
  flow: number,
  flowstrict: number,
  flowstrictlocal: number,
  flowweak: number,
  noflow: number,
  total: number,
};

function htmlPair(first: string, second: string) {
  return `<tr><td>${first}</td><td>${second}</td></tr>`;
}

function countByStatus(report: StatusReport, status: FlowStatus): number {
  return report.filter((entry) => entry.status === status).length;
}

function displayCount(report: StatusReport, count: number): string {
  if (report.length === 0) {
    return '0';
  } else {
    return `${count} (${Math.round(count / report.length * 10000) / 100}%)`;
  }
}

function summarize(
  report: StatusReport,
): Summary {
  return {
    flow: countByStatus(report, 'flow'),
    flowstrict: countByStatus(report, 'flow strict'),
    flowstrictlocal: countByStatus(report, 'flow strict-local'),
    flowweak: countByStatus(report, 'flow weak'),
    noflow: countByStatus(report, 'no flow'),
    total: report.length,
  };
}

function escapeXML(value: string): string {
  return value.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function asSummary(
  report: StatusReport,
): Array<string> {
  const summary = summarize(report);
  return [
    `@flow ${displayCount(report, summary.flow)}`,
    `@flow strict ${displayCount(report, summary.flowstrict)}`,
    `@flow strict-local ${displayCount(report, summary.flowstrictlocal)}`,
    `@flow weak ${displayCount(report, summary.flowweak)}`,
    `no flow ${displayCount(report, summary.noflow)}`,
    `Total Files ${String(report.length)}`,
  ];
}

export function asText(
  report: StatusReport,
  showSummary: boolean,
  filter: EntryFilter,
): Array<string> {
  const lines = report
    .filter(filter)
    .map((entry) => `${entry.status}\t${entry.file}`);

  return (
    showSummary
      ? lines.concat(asSummary(report))
      : lines
  );
}

export function asHTMLTable(
  report: StatusReport,
  showSummary: boolean,
  filter: EntryFilter,
): Array<string> {
  const summary = summarize(report);
  const summaryFooter = [
    '<tfoot>',
    htmlPair('@flow', displayCount(report, summary.flow)),
    htmlPair('@flow strict', displayCount(report, summary.flowstrict)),
    htmlPair('@flow strict-local', displayCount(report, summary.flowstrictlocal)),
    htmlPair('@flow weak', displayCount(report, summary.flowweak)),
    htmlPair('no flow', displayCount(report, summary.noflow)),
    htmlPair('Total Files', String(report.length)),
    '</tfoot>',
  ];

  return [
    '<table>',
    ...(showSummary ? summaryFooter : []),
    '<tbody>',
    ...report.filter(filter).map((entry) => [
      `<tr data-status="${entry.status}">`,
        `<td>${entry.status}</td>`,
        `<td>${escapeXML(entry.file)}</td>`,
      `</tr>`
    ].join("\n")),
    '</tbody>',
    '</table>'
  ];
}

export function asCSV(
  report: StatusReport,
  showSummary: boolean,
  filter: EntryFilter,
): Array<string> {
  const lines = report
    .filter(filter)
    .map((entry) => [
      JSON.stringify(entry.status),
      JSON.stringify(entry.file),
    ].join(', '));

  if (showSummary) {
    const summary = summarize(report);
    return lines.concat([
      `"@flow", "${displayCount(report, summary.flow)}"`,
      `"@flow strict", "${displayCount(report, summary.flowstrict)}"`,
      `"@flow strict-local", "${displayCount(report, summary.flowstrictlocal)}"`,
      `"@flow weak", "${displayCount(report, summary.flowweak)}"`,
      `"no flow", "${displayCount(report, summary.noflow)}"`,
      `"Total Files", "${String(report.length)}"`,
    ]);
  } else {
    return lines;
  }
}

export function asJUnit(
  report: StatusReport,
  filter: EntryFilter,
): Array<string> {
  const date = (new Date()).toISOString();
  const host = os.hostname();
  const tests = report.length;
  const failures = report.length - report.filter(
    (entry) => entry.status === 'flow'
      || entry.status === 'flow strict'
      || entry.status === 'flow strict-local'
  ).length;

  return [
    `<testsuite name="flow-annotation-check" timestamp="${date}" time="0" hostname="${host}" tests="${tests}" failures="${failures}" errors="0">`,
    ...report.filter(filter).map((entry) => entry.status === 'flow'
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

export function asJSON(
  report: StatusReport,
): Array<string> {
  return [
    JSON.stringify({
      summary: summarize(report),
      files: report,
    })
  ];
}
