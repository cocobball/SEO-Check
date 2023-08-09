document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('checkHeaders').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "checkHeaders" }, function(response) {
        var resultDiv = document.getElementById('result');
        var metaTitleLength = response.metaTitle ? response.metaTitle.length : 0;
        resultDiv.innerHTML = '<div class="section"><span class="title">Meta Title:</span> ' + (response.metaTitle || 'Not found') + ' <span style="color:' + (metaTitleLength <= 60 ? 'green' : 'red') + '">' + metaTitleLength + '/60</span></div>';
        var metaDescriptionLength = response.metaDescription ? response.metaDescription.length : 0;
        resultDiv.innerHTML += '<div class="section"><span class="title">Meta Description:</span> ' + (response.metaDescription || 'Not found') + ' <span style="color:' + (metaDescriptionLength <= 160 ? 'green' : 'red') + '">' + metaDescriptionLength + '/160</span></div>';
        var h1Length = response.h1 ? response.h1.length : 0;
        resultDiv.innerHTML += '<div class="section"><span class="title">H1 tag:</span> ' + (response.h1 || 'Not found') + ' <span style="color:' + (h1Length <= 70 ? 'green' : 'red') + '">' + h1Length + '/70</span></div>';
        var h2TagsContent = response.h2s.map((h2, index) => {
          var h2Length = h2.length;
          return h2 + ' <span style="color:' + (h2Length <= 70 ? 'green' : 'red') + '">' + h2Length + '/70</span>';
        }).join('<br>');
        resultDiv.innerHTML += '<div class="section"><span class="title">H2 tags:</span><br>' + (h2TagsContent || 'Not found') + '</div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">Canonical Tag:</span> <span style="color:' + (response.canonicalStatus ? 'green' : 'red') + '">' + (response.canonicalStatus ? 'Self-referencing (Good)' : 'Not self-referencing (Bad)') + '</span></div>';
      });
    });
  });

  var toggleImageHover = document.getElementById('imageHoverToggle');
  toggleImageHover.addEventListener('change', function() {
    var isEnabled = this.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleImageHover', enabled: isEnabled }, function(response) {
        if (response && response.success) {
          console.log('Image hover toggle updated successfully!');
        } else {
          console.error('Failed to update image hover toggle:', response ? response.message : 'No response');
        }
      });
    });
  });

  var isImageHoverEnabled = true;
  var isHeadingPopupEnabled = true;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleImageHover") {
      isImageHoverEnabled = request.enabled;
      sendResponse({ success: true });
    }
    // Add other action handlers here
  });

  document.addEventListener('mouseover', function(e) {
    if (!isImageHoverEnabled) return;

    var target = e.target;
    if (target.tagName.toLowerCase() === 'img') {
      var info = "Alt Text: " + target.alt + "\n";
      info += "Width: " + target.width + "px\n";
      info += "Height: " + target.height + "px\n";
      var isResized = target.naturalWidth !== target.width || target.naturalHeight !== target.height;
      var resizedInfo = "Resized: " + (isResized ? "Yes" : "No");

      var tooltip = document.createElement('div');
      tooltip.style.position = 'fixed';
      tooltip.style.left = e.pageX + 'px';
      tooltip.style.top = e.pageY + 'px';
      tooltip.style.background = 'white';
      tooltip.style.color = 'black';
      tooltip.style.border = '1px solid black';
      tooltip.style.padding = '5px';

      if (isResized) {
        resizedInfo = '<span style="color:red;">' + resizedInfo + '</span>';
      }

      tooltip.innerHTML = info + resizedInfo;

      document.body.appendChild(tooltip);

      target.addEventListener('mouseout', function() {
        document.body.removeChild(tooltip);
      });
    }

    // Heading popup code
    if (isHeadingPopupEnabled && (target.tagName.toLowerCase() === 'h1' || target.tagName.toLowerCase() === 'h2' || target.tagName.toLowerCase() === 'h3')) {
      var headingLevel = target.tagName.toLowerCase().replace('h', '');
      var headingText = target.textContent;
      var headingInfo = 'Heading ' + headingLevel + ': ' + headingText;

      var headingPopup = document.createElement('div');
      headingPopup.style.position = 'absolute';
      headingPopup.style.left = (e.pageX - 20) + 'px'; // Adjust the positioning
      headingPopup.style.top = (e.pageY - 20) + 'px'; // Adjust the positioning
      headingPopup.style.background = 'white';
      headingPopup.style.color = 'black';
      headingPopup.style.border = '1px solid black';
      headingPopup.style.padding = '2px';
      headingPopup.style.fontSize = '10px'; // Adjust the font size for the heading number

      headingPopup.innerHTML = headingInfo;

      document.body.appendChild(headingPopup);

      target.addEventListener('mouseout', function() {
        document.body.removeChild(headingPopup);
      });
    }
  });
});
document.getElementById('checkGoogleIndex').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.create({ url: 'https://www.google.com/search?q=site:' + tabs[0].url });
  });
});
document.getElementById('checkPageSpeed').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.create({ url: 'https://developers.google.com/speed/pagespeed/insights/?url=' + tabs[0].url });
  });
});

document.getElementById('checkGoogleCache').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.create({ url: 'https://webcache.googleusercontent.com/search?q=cache:' + tabs[0].url });
  });
});
