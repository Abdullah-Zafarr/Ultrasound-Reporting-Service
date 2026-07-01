export function printElementById(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) {
    throw new Error("Printable report area not found.");
  }

  document.body.classList.add("report-printing");
  document.body.setAttribute("data-print-target", targetId);

  const cleanup = () => {
    document.body.classList.remove("report-printing");
    document.body.removeAttribute("data-print-target");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.print();

  // Fallback cleanup in case afterprint is not fired by the host browser.
  setTimeout(cleanup, 1500);
}
