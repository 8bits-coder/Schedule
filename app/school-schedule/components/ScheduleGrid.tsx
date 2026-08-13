import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import type { ScheduleItem } from "../types";
import {
  ALL_GRADES,
  DAYS,
  END_HOUR,
  START_HOUR,
  SUBJECT_COLORS,
  TOTAL_ROWS,
  fmt12,
  formatWeekRange,
  timeToRowIndex,
  weekDatesForOffset,
} from "../schedule-data";

export const ScheduleGrid = React.memo(function ScheduleGrid({
  items,
  weekOffset,
  onWeekOffsetChange,
  onItemClick,
}: {
  items: ScheduleItem[];
  weekOffset: number;
  onWeekOffsetChange: (offset: number) => void;
  onItemClick: (item: ScheduleItem) => void;
}) {
  const weekDates = useMemo(() => weekDatesForOffset(weekOffset), [weekOffset]);
  const rangeLabel = useMemo(() => formatWeekRange(weekOffset), [weekOffset]);

  const hourLabels = useMemo(() => {
    const out: number[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) out.push(h);
    return out;
  }, []);

  const colorHex = (key: string) => (SUBJECT_COLORS.find((c) => c.key === key) || SUBJECT_COLORS[0]).hex;

  const layoutItems = useMemo(() => {
    const result: Array<ScheduleItem & { startRow: number; endRow: number; col: number; colCount: number }> = [];
    for (const day of DAYS) {
      const dayItems = items
        .filter((it) => it.day === day)
        .map((it) => ({ ...it, startRow: timeToRowIndex(it.start), endRow: timeToRowIndex(it.end) }))
        .sort((a, b) => a.startRow - b.startRow || a.endRow - b.endRow);

      let cluster: Array<ScheduleItem & { startRow: number; endRow: number }> = [];
      let clusterEnd = -Infinity;
      const clusters: Array<Array<ScheduleItem & { startRow: number; endRow: number }>> = [];

      for (const it of dayItems) {
        if (cluster.length === 0 || it.startRow < clusterEnd) {
          cluster.push(it);
          clusterEnd = Math.max(clusterEnd, it.endRow);
        } else {
          clusters.push(cluster);
          cluster = [it];
          clusterEnd = it.endRow;
        }
      }

      if (cluster.length) clusters.push(cluster);

      for (const c of clusters) {
        const colEnds: number[] = [];
        const colOf: Record<string, number> = {};
        for (const it of c) {
          let placedCol = -1;
          for (let ci = 0; ci < colEnds.length; ci++) {
            if (colEnds[ci] <= it.startRow) {
              placedCol = ci;
              break;
            }
          }
          if (placedCol === -1) {
            placedCol = colEnds.length;
            colEnds.push(it.endRow);
          } else {
            colEnds[placedCol] = it.endRow;
          }
          colOf[it.id] = placedCol;
        }
        const colCount = colEnds.length;
        for (const it of c) result.push({ ...it, col: colOf[it.id], colCount });
      }
    }
    return result;
  }, [items]);

  return (
    <div>
      <div className="sa-week-nav">
        <button className="sa-week-btn" onClick={() => onWeekOffsetChange(weekOffset - 1)} aria-label="Previous week">
          <ChevronLeft size={16} />
        </button>
        <div className="sa-week-label">
          <span className="sa-week-range">{rangeLabel}</span>
          {weekOffset !== 0 && (
            <button className="sa-week-today" onClick={() => onWeekOffsetChange(0)}>
              Back to this week
            </button>
          )}
        </div>
        <button className="sa-week-btn" onClick={() => onWeekOffsetChange(weekOffset + 1)} aria-label="Next week">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="sa-gridwrap">
        <div className="sa-schedule" style={{ gridTemplateRows: `2.9rem repeat(${TOTAL_ROWS}, 1.9rem)` }}>
          <div className="sa-corner" style={{ gridColumn: 1, gridRow: 1 }} />
          {DAYS.map((d, i) => (
            <div key={d} className="sa-daylabel" style={{ gridColumn: i + 2, gridRow: 1 }}>
              <span className="sa-daylabel-name">{d}</span>
              <span className="sa-daylabel-date">
                {weekDates[i].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}

          {hourLabels.map((h, i) => (
            <div key={h} className="sa-hourlabel" style={{ gridColumn: 1, gridRow: `${i * 2 + 2} / span 2` }}>
              <Clock3 size={11} />
              {fmt12(`${String(h).padStart(2, "0")}:00`).replace(":00", "")}
            </div>
          ))}

          {hourLabels.map((h, i) => (
            <div
              key={`row-${h}`}
              className="sa-rowline"
              style={{ gridColumn: `2 / -1`, gridRow: `${i * 2 + 2} / span 2` }}
            />
          ))}

          {layoutItems.map((it) => {
            const startRow = it.startRow + 2;
            const endRow = it.endRow + 2;
            const col = DAYS.indexOf(it.day) + 2;
            const gap = 4;
            const widthCss = `calc(${100 / it.colCount}% - ${gap}px)`;
            const marginLeftCss = `calc(${(100 / it.colCount) * it.col}% + ${gap / 2}px)`;
            const narrow = it.colCount > 1;
            const gradeTag = it.gradeLevel && it.gradeLevel !== ALL_GRADES ? it.gradeLevel : null;
            return (
              <div
                key={it.id}
                className={`sa-block sa-block--editable ${narrow ? "sa-block--narrow" : ""}`}
                style={{
                  gridColumn: col,
                  gridRow: `${startRow} / ${endRow}`,
                  background: colorHex(it.color),
                  width: widthCss,
                  marginLeft: marginLeftCss,
                  justifySelf: "start",
                }}
                title={`${it.subject} · ${fmt12(it.start)}–${fmt12(it.end)} · ${it.room}${gradeTag ? ` · ${gradeTag}` : ""}`}
                onClick={() => onItemClick(it)}
                role="button">
                <span className="sa-block-subject">{it.subject}</span>
                <span className="sa-block-meta">
                  {fmt12(it.start)}–{fmt12(it.end)}
                </span>
                {!narrow && (
                  <span className="sa-block-meta">
                    {gradeTag ? `${gradeTag} · ` : ""}
                    {it.room}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
