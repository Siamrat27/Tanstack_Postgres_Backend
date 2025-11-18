import * as React from "react";

type Align = "left" | "center" | "right";

export type Column<T> = {
  /** ชื่อ header (หรือฟังก์ชันเพื่อ render dynamic) */
  header: React.ReactNode | ((ctx: { column: Column<T> }) => React.ReactNode);
  /** ระบุว่าจะดึงค่าเซลล์จากอะไร: key ของ object หรือฟังก์ชัน */
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  /** ใช้แทน accessor ถ้าต้องการควบคุมการ render เต็มที่ */
  cell?: (row: T, index: number) => React.ReactNode;
  /** การจัดแนวข้อความในคอลัมน์ */
  align?: Align;
  /** ความกว้างคอลัมน์ (เช่น "160px" หรือ "20%") */
  width?: string;
  /** class สำหรับ <th> และ <td> */
  thClassName?: string;
  tdClassName?: string;
  /** คีย์ภายในคอลัมน์ (ช่วย React key ถ้า header เป็น ReactNode ซ้ำ ๆ) */
  id?: string;
};

export type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  /** ใช้เลือก key ของแถว — ปลอดภัยกว่าใช้ index */
  rowKey?: keyof T | ((row: T, index: number) => React.Key);
  /** แสดงเส้นคั่น/ลายเส้น */
  striped?: boolean;
  /** header ติดบน (เมื่อ scroll แนวนอน/ตั้ง) */
  stickyHeader?: boolean;
  /** ข้อความ/element เมื่อไม่มีข้อมูล */
  empty?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  headClassName?: string;
  bodyClassName?: string;
};

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function getAlignClass(align?: Align) {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

export function Table<T>({
  data,
  columns,
  rowKey,
  striped = true,
  stickyHeader = true,
  empty = <div className="p-4 text-slate-600">ไม่พบข้อมูลสำหรับการแสดงผล</div>,
  className,
  tableClassName,
  headClassName,
  bodyClassName,
}: TableProps<T>) {
  const getRowKey = React.useCallback(
    (row: T, index: number) => {
      if (typeof rowKey === "function") return rowKey(row, index);
      if (rowKey) return (row as any)[rowKey as keyof T] as React.Key;
      return index; // fallback
    },
    [rowKey]
  );

  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-lg border border-rose-100 bg-white shadow-sm",
        className
      )}
    >
      <table
        className={clsx("min-w-[640px] w-full border-collapse", tableClassName)}
      >
        <thead
          className={clsx(
            "bg-rose-50 text-slate-900",
            stickyHeader && "sticky top-0 z-10",
            headClassName
          )}
        >
          <tr>
            {columns.map((col, i) => {
              const headerContent =
                typeof col.header === "function"
                  ? col.header({ column: col })
                  : col.header;
              return (
                <th
                  key={col.id ?? i}
                  className={clsx(
                    "px-3 py-2 text-sm font-semibold",
                    getAlignClass(col.align),
                    col.thClassName
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  scope="col"
                >
                  {headerContent}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={clsx(bodyClassName)}>
          {data.length === 0 ? (
            <tr>
              <td className="px-3 py-3 text-slate-600" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={getRowKey(row, rIdx)}
                className={clsx(
                  striped && rIdx % 2 === 1 ? "bg-rose-50/30" : "bg-white"
                )}
              >
                {columns.map((col, cIdx) => {
                  const content = col.cell
                    ? col.cell(row, rIdx)
                    : typeof col.accessor === "function"
                      ? col.accessor(row, rIdx)
                      : col.accessor
                        ? (row as any)[col.accessor as keyof T]
                        : null;

                  return (
                    <td
                      key={col.id ?? cIdx}
                      className={clsx(
                        "px-3 py-2 align-top text-sm text-slate-800",
                        getAlignClass(col.align),
                        col.tdClassName
                      )}
                    >
                      {content as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
