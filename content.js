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
  }
});

// Display image information on hover
document.addEventListener('mouseover', function(e) {
  if (!isImageHoverEnabled) return; // Exit if the feature is disabled

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
    tooltip.style.backgroundColor = 'white'; // White background
    tooltip.style.color = isResized ? 'red' : 'black'; // Red text if resized, black otherwise
    tooltip.style.border = '1px solid black'; // Border around the box
    tooltip.style.padding = '5px'; // Some padding for spacing
    tooltip.style.zIndex = '10000'; // Ensure it's above other elements
    document.body.appendChild(tooltip);

    target.addEventListener('mouseout', function() {
      document.body.removeChild(tooltip);
    });
  }
});

// Display heading information on hover
document.addEventListener('mouseover', function(e) {
  if (!isHeadingPopupEnabled) return; // Exit if the feature is disabled

  var target = e.target;
  if (target.tagName.toLowerCase() === 'h1' || target.tagName.toLowerCase() === 'h2' || target.tagName.toLowerCase() === 'h3') {
    var headingLevel = target.tagName.toLowerCase().substring(1); // Get the number from the heading tag name (h1, h2, h3, ...)
    var headingTooltip = document.createElement('div');
    headingTooltip.textContent = "Heading " + headingLevel;
    headingTooltip.style.position = 'absolute';
    headingTooltip.style.left = (target.offsetLeft - 20) + 'px'; // Adjust position for the tooltip
    headingTooltip.style.top = (target.offsetTop - 20) + 'px'; // Adjust position for the tooltip
    headingTooltip.style.backgroundColor = 'black'; // Black background
    headingTooltip.style.color = 'white'; // White text
    headingTooltip.style.padding = '2px 5px'; // Some padding for spacing
    headingTooltip.style.zIndex = '10000'; // Ensure it's above other elements
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
    var allH3Tags = document.querySelectorAll('h3'); // Add this line to select h3 tags
    var h3Texts = Array.from(allH3Tags).map(tag => tag.textContent); // Add this line to get h3 tag content
    var metaDescription = document.querySelector('meta[name="description"]');
    var metaTitle = document.title;
    var canonicalTag = document.querySelector('link[rel="canonical"]');
    var canonicalURL = canonicalTag ? canonicalTag.href : null;
    var isSelfReferencing = canonicalURL === window.location.href;

    sendResponse({
      h1: h1Tag ? h1Tag.textContent : null,
      h2s: h2Texts,
      h3s: h3Texts, // Add this line to include h3 tag content
      metaDescription: metaDescription ? metaDescription.content : null,
      metaTitle: metaTitle,
      canonicalStatus: isSelfReferencing
    });
  } else if (request.action === "insertPrompt") {
    var inputField = document.querySelector('#prompt-textarea'); // Replace with the appropriate selector
    if (inputField) {
      inputField.value = request.prompt; // Insert the prompt into the input field
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, message: 'Input field not found' });
    }
  } else if (request.action === "getLinks") {
    var allLinks = document.querySelectorAll('a');
    var linkHrefs = Array.from(allLinks).map(link => link.href);
    sendResponse({ links: linkHrefs });
  }
});
