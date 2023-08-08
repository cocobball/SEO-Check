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

document.getElementById('checkGoogleIndex').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentURL = tabs[0].url;
    var searchURL = 'https://www.google.com/search?q=site:' + encodeURIComponent(currentURL);
    chrome.tabs.create({ url: searchURL });
  });
});

document.getElementById('checkPageSpeed').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentURL = tabs[0].url;
    var analysisURL = 'https://developers.google.com/speed/pagespeed/insights/?url=' + encodeURIComponent(currentURL);
    chrome.tabs.create({ url: analysisURL });
  });
});

document.getElementById('checkGoogleCache').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentURL = tabs[0].url;
    var cacheURL = 'https://webcache.googleusercontent.com/search?q=cache:' + encodeURIComponent(currentURL);
    chrome.tabs.create({ url: cacheURL });
  });
});

document.getElementById('checkGoogleSD').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentURL = tabs[0].url;
    // URL to Google's Structured Data Testing Tool
    var googleSDURL = 'https://search.google.com/test/rich-results?url=' + encodeURIComponent(currentURL);
    chrome.tabs.create({ url: googleSDURL });
  });
});

document.getElementById('insertPrompt').addEventListener('click', function() {
  var selectedPrompt = document.getElementById('prompts').value;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', prompt: selectedPrompt }, function(response) {
      if (response.success) {
        console.log('Prompt inserted successfully!');
      } else {
        console.error('Failed to insert prompt:', response.message);
      }
    });
  });
});

});