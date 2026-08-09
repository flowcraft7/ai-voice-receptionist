(function () {
  const script = document.currentScript;
  const businessId = script.getAttribute("data-business-id");
  const baseUrl = script.getAttribute("data-base-url") || "http://localhost:3000";

  const container = document.createElement("div");
  container.id = "ai-receptionist-widget";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "999999";
  container.style.width = "380px";
  container.style.maxWidth = "90vw";
  container.style.height = "600px";
  container.style.maxHeight = "85vh";
  container.style.borderRadius = "16px";
  container.style.overflow = "hidden";
  container.style.boxShadow = "0 8px 30px rgba(0,0,0,0.35)";

  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}/widget/${businessId}`;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.display = "block";

  container.appendChild(iframe);
  document.body.appendChild(container);
})();