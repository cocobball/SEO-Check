document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to checkHeaders button
  document.getElementById('checkHeaders').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "checkHeaders" }, function(response) {
        var resultDiv = document.getElementById('result');
        // Meta Title
        var metaTitleLength = response.metaTitle ? response.metaTitle.length : 0;
        resultDiv.innerHTML = '<div class="section"><span class="title">Meta Title:</span> ' + (response.metaTitle || 'Not found') + ' <span style="color:' + (metaTitleLength <= 60 ? 'green' : 'red') + '">' + metaTitleLength + '/60</span></div>';
        // Meta Description
        var metaDescriptionLength = response.metaDescription ? response.metaDescription.length : 0;
        resultDiv.innerHTML += '<div class="section"><span class="title">Meta Description:</span> ' + (response.metaDescription || 'Not found') + ' <span style="color:' + (metaDescriptionLength <= 160 ? 'green' : 'red') + '">' + metaDescriptionLength + '/160</span></div>';
        // H1 tag
        var h1Length = response.h1 ? response.h1.length : 0;
        resultDiv.innerHTML += '<div class="section"><span class="title">H1 tag:</span> ' + (response.h1 || 'Not found') + ' <span style="color:' + (h1Length <= 70 ? 'green' : 'red') + '">' + h1Length + '/70</span></div>';
        // H2 tags
        var h2TagsContent = response.h2s.map((h2, index) => {
          var h2Length = h2.length;
          return h2 + ' <span style="color:' + (h2Length <= 70 ? 'green' : 'red') + '">' + h2Length + '/70</span>';
        }).join('<br>');
        resultDiv.innerHTML += '<div class="section"><span class="title">H2 tags:</span><br>' + (h2TagsContent || 'Not found') + '</div>';
        // Canonical Tag
        resultDiv.innerHTML += '<div class="section"><span class="title">Canonical Tag:</span> <span style="color:' + (response.canonicalStatus ? 'green' : 'red') + '">' + (response.canonicalStatus ? 'Self-referencing (Good)' : 'Not self-referencing (Bad)') + '</span></div>';
        // Additional functionalities
        resultDiv.innerHTML += '<div class="section"><span class="title">Meta Robots:</span> ' + (response.robotsMeta || 'Not found') + '</div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">Images with ALT:</span> ' + response.imagesWithAlt + '</div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">Images without ALT:</span> ' + response.imagesWithoutAlt + '</div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">External Links:</span> ' + response.externalLinks + '</div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">Internal Links:</span> ' + response.internalLinks + '</div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">Robots.txt:</span> <a href="' + response.robotsTxtLink + '" target="_blank">' + response.robotsTxtLink + '</a></div>';
        resultDiv.innerHTML += '<div class="section"><span class="title">Sitemap:</span> ' + (response.sitemap || 'Not found') + '</div>';
      });
    });
  });

  // Add event listener to toggleImageHover checkbox
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

  // Add event listener to toggleHeadingPopup checkbox
  var toggleHeadingPopup = document.getElementById('headingPopupToggle');
  toggleHeadingPopup.addEventListener('change', function() {
    var isEnabled = this.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHeadingPopup', enabled: isEnabled }, function(response) {
        if (response && response.success) {
          console.log('Heading popup toggle updated successfully!');
        } else {
          console.error('Failed to update heading popup toggle:', response ? response.message : 'No response');
        }
      });
    });
  });

  // Initialize toggle states
  var isImageHoverEnabled = true;
  var isHeadingPopupEnabled = true;

  // Add message listener for checkHeaders action
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkHeaders") {
      // Get page elements
      var h1Tag = document.querySelector('h1');
      var allH2Tags = document.querySelectorAll('h2');
      var h2Texts = Array.from(allH2Tags).map(tag => tag.textContent);
      var metaDescription = document.querySelector('meta[name="description"]');
      var metaTitle = document.title;
      var canonicalTag = document.querySelector('link[rel="canonical"]');
      var canonicalURL = canonicalTag ? canonicalTag.href : null;
      var isSelfReferencing = canonicalURL === window.location.href;

      // Additional functionalities
      var allImages = document.querySelectorAll('img');
      var imagesWithAlt = Array.from(allImages).filter(img => img.alt && img.alt.trim() !== '').length;
      var imagesWithoutAlt = allImages.length - imagesWithAlt;
      var allLinks = document.querySelectorAll('a');
      var externalLinks = Array.from(allLinks).filter(link => link.host !== window.location.host).length;
      var internalLinks = allLinks.length - externalLinks;
      var robotsTag = document.querySelector('meta[name="robots"]');
      var sitemapTag = document.querySelector('link[rel="sitemap"]');
      var robotsTxtLink = window.location.origin + "/robots.txt";

      // Send response
      sendResponse({
        h1: h1Tag ? h1Tag.textContent : null,
        h2s: h2Texts,
        metaDescription: metaDescription ? metaDescription.content : null,
        metaTitle: metaTitle,
        canonicalStatus: isSelfReferencing,
        imagesWithAlt: imagesWithAlt,
        imagesWithoutAlt: imagesWithoutAlt,
        externalLinks: externalLinks,
        internalLinks: internalLinks,
        robotsMeta: robotsTag ? robotsTag.content : null,
        sitemap: sitemapTag ? sitemapTag.href : null,
        robotsTxtLink: robotsTxtLink
      });
    }
  });

  // Add event listener for mouseover event
  document.addEventListener('mouseover', function(e) {
    if (!isImageHoverEnabled) return;

    var target = e.target;
    if (target.tagName.toLowerCase() === 'img') {
      // Create tooltip content
      var info = "Alt Text: " + target.alt + "\n";
      info += "Width: " + target.width + "px\n";
      info += "Height: " + target.height + "px\n";
      var isResized = target.naturalWidth !== target.width || target.naturalHeight !== target.height;
      var resizedInfo = "Resized: " + (isResized ? "Yes" : "No");

      // Create tooltip element
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

      // Add tooltip to the body and remove it on mouseout
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

      // Add heading popup to the body and remove it on mouseout
      document.body.appendChild(headingPopup);
      target.addEventListener('mouseout', function() {
        document.body.removeChild(headingPopup);
      });
    }
  });

  // Add event listener for checkGoogleIndex button
  document.getElementById('checkGoogleIndex').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.create({ url: 'https://www.google.com/search?q=site:' + tabs[0].url });
    });
  });

  // Add event listener for checkPageSpeed button
  document.getElementById('checkPageSpeed').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.create({ url: 'https://developers.google.com/speed/pagespeed/insights/?url=' + tabs[0].url });
    });
  });

  // Add event listener for checkGoogleCache button
  document.getElementById('checkGoogleCache').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.create({ url: 'https://webcache.googleusercontent.com/search?q=cache:' + tabs[0].url });
    });
  });

// Define custom prompts
var customPrompts = {
  'customPrompt1': `I want you to become my Prompt Creator. Your goal is to help me craft the best possible prompt for my needs. The prompt will be used by you, ChatGPT. You will follow the following process: 1. Your first response will be to ask me what the prompt should be about. I will provide my answer, but we will need to improve it through continual iterations by going through the next steps. 2. Based on my input, you will generate 3 sections. a) Revised prompt (provide your rewritten prompt. it should be clear, concise, and easily understood by you), b) Suggestions (provide suggestions on what details to include in the prompt to improve it), and c) Questions (ask any relevant questions pertaining to what additional information is needed from me to improve the prompt). 3. We will continue this iterative process with me providing additional information to you and you updating the prompt in the Revised prompt section until it's complete.`,

  'customPrompt2': `This is the sample second prompt`
  // Add more custom prompts here if needed
};

  // Add event listener for insertPrompt button
  document.getElementById('insertPrompt').addEventListener('click', function() {
    // Get the selected value from the dropdown
    var selectedValue = document.getElementById('prompts').value;

    // Get the corresponding custom text
    var selectedPromptText = customPrompts[selectedValue];

    // Get the textarea element by its ID
    var textarea = document.getElementById('prompt-textarea');

    // Insert the selected custom prompt text into the textarea
    textarea.value = selectedPromptText;
  });

  // Add event listener for schemaCheck button
  document.getElementById('schemaCheck').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "performSchemaCheck" }, function(response) {
        var resultDiv = document.getElementById('result');
        if (response) {
          var schemaJSON = JSON.stringify(response, null, 2);
          resultDiv.innerHTML = '<pre>' + schemaJSON + '</pre>';
        } else {
          resultDiv.innerHTML = 'No schema data found on this page.';
        }
      });
    });
  });

  // Load initial toggle states
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleImageHover', enabled: null }, function(response) {
      isImageHoverEnabled = response.enabled;
      toggleImageHover.checked = isImageHoverEnabled;
    });

    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHeadingPopup', enabled: null }, function(response) {
      isHeadingPopupEnabled = response.enabled;
      toggleHeadingPopup.checked = isHeadingPopupEnabled;
    });
  });
});
