"use client";

export function PrintPageButton() {
  return (
    <button
      type="button"
      className="info-print-page-btn"
      onClick={() => {
        document.documentElement.removeAttribute("data-print-table-only");
        window.print();
      }}
    >
      Download or Print This Page as PDF
    </button>
  );
}

export function PrintTableButton() {
  return (
    <button
      type="button"
      className="info-print-table-btn"
      onClick={() => {
        document.documentElement.setAttribute("data-print-table-only", "");
        window.print();
        setTimeout(() => {
          document.documentElement.removeAttribute("data-print-table-only");
        }, 1000);
      }}
    >
      Print Table Only
    </button>
  );
}
