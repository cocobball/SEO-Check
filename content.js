// Enable image hover feature by default
var isImageHoverEnabled = true;

// Enable heading popup feature by default
var isHeadingPopupEnabled = true;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleImageHover") {
    isImageHoverEnabled = request.enabled;
    sendResponse({ success: true });
  } else if (request.action === "toggleHeadingPopup") {
    isHeadingPopupEnabled = request.enabled;
    sendResponse({ success: true });
  } else if (request.action === "performSchemaCheck") { // Added schema check action
    performSchemaCheck(sendResponse);
    return true; // Enables asynchronous response
  } else if (request.action === "checkFrameworks") {
    checkFrameworks(sendResponse);
    return true; // Enables asynchronous response
  }
});
// New function to check for Google Tag Manager
function checkFrameworks(sendResponse) {
  let gtmId = null;
  const scripts = Array.from(document.getElementsByTagName('script'));
  scripts.forEach(script => {
    const match = script.textContent.match(/GTM-[A-Z0-9]+/);
    if (match) {
      gtmId = match[0];
    }
  });
  sendResponse({ gtmId });
}
// New function to perform schema check
function performSchemaCheck(sendResponse) {
  // Find the script tag containing the schema data
  var schemaScriptTag = document.querySelector('script[type="application/ld+json"]');
  
  // If the script tag is found, parse its content as JSON
  var schemaData = schemaScriptTag ? JSON.parse(schemaScriptTag.textContent) : null;

  // Send the schema data as a response
  sendResponse(schemaData);
}
// Display image information on hover
document.addEventListener('mouseover', function(e) {
  if (!isImageHoverEnabled) return;
  var target = e.target;
  if (target.tagName.toLowerCase() === 'img') {
    var info = "Alt Text: " + target.alt + "\n";
    info += "Width: " + target.width + "px\n";
    info += "Height: " + target.height + "px\n";
    var isResized = target.naturalWidth !== target.width || target.naturalHeight !== target.height;
    if (isResized) {
      info += "Original Size: " + target.naturalWidth + "x" + target.naturalHeight + "\n";
    }
    var tooltip = document.createElement('div');
    tooltip.textContent = info;
    tooltip.style.position = 'fixed';
    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = e.pageY + 'px';
    tooltip.style.backgroundColor = 'white';
    tooltip.style.color = isResized ? 'red' : 'black';
    tooltip.style.border = '1px solid black';
    tooltip.style.padding = '5px';
    tooltip.style.zIndex = '10000';
    document.body.appendChild(tooltip);
    target.addEventListener('mouseout', function() {
      document.body.removeChild(tooltip);
    });
  }
});

// Display heading information on hover
document.addEventListener('mouseover', function(e) {
  if (!isHeadingPopupEnabled) return;
  var target = e.target;
  if (target.tagName.toLowerCase() === 'h1' || target.tagName.toLowerCase() === 'h2' || target.tagName.toLowerCase() === 'h3') {
    var headingLevel = target.tagName.toLowerCase().substring(1);
    var headingTooltip = document.createElement('div');
    headingTooltip.textContent = "Heading " + headingLevel;
    headingTooltip.style.position = 'absolute';
    headingTooltip.style.left = (target.offsetLeft - 20) + 'px';
    headingTooltip.style.top = (target.offsetTop - 20) + 'px';
    headingTooltip.style.backgroundColor = 'black';
    headingTooltip.style.color = 'white';
    headingTooltip.style.padding = '2px 5px';
    headingTooltip.style.zIndex = '10000';
    document.body.appendChild(headingTooltip);
    target.addEventListener('mouseout', function() {
      document.body.removeChild(headingTooltip);
    });
  }
});

// Rest of your code for other actions
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "checkHeaders") {
    var h1Tag = document.querySelector('h1');
    var allH2Tags = document.querySelectorAll('h2');
    var h2Texts = Array.from(allH2Tags).map(tag => tag.textContent);
    var metaDescription = document.querySelector('meta[name="description"]');
    var metaTitle = document.title;
    var canonicalTag = document.querySelector('link[rel="canonical"]');
    var canonicalURL = canonicalTag ? canonicalTag.href : null;
    var isSelfReferencing = canonicalURL === window.location.href;
    var robotsTag = document.querySelector('meta[name="robots"]');
    var sitemapTag = document.querySelector('link[rel="sitemap"]');
    var allImages = document.querySelectorAll('img');
    var imagesWithAlt = Array.from(allImages).filter(img => img.alt && img.alt.trim() !== '').length;
    var imagesWithoutAlt = allImages.length - imagesWithAlt;
    var allLinks = document.querySelectorAll('a');
    var externalLinks = Array.from(allLinks).filter(link => link.host !== window.location.host).length;
    var internalLinks = allLinks.length - externalLinks;
    var robotsTxtLink = window.location.origin + "/robots.txt";

    sendResponse({
      h1: h1Tag ? h1Tag.textContent : null,
      h2s: h2Texts,
      metaDescription: metaDescription ? metaDescription.content : null,
      metaTitle: metaTitle,
      canonicalStatus: isSelfReferencing,
      robotsMeta: robotsTag ? robotsTag.content : null,
      sitemap: sitemapTag ? sitemapTag.href : null,
      imagesWithAlt: imagesWithAlt,
      imagesWithoutAlt: imagesWithoutAlt,
      externalLinks: externalLinks,
      internalLinks: internalLinks,
      robotsTxtLink: robotsTxtLink
    });
  }
  // Include any additional actions here
});
