chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('Message received:', request.action);
    if (request.action === "checkHeaders") {
      var h1Tag = document.querySelector('h1');
      var allH2Tags = document.querySelectorAll('h2');
      var h2Texts = Array.from(allH2Tags).map(tag => tag.textContent);
      var metaDescription = document.querySelector('meta[name="description"]');
      var metaTitle = document.title;
      var canonicalTag = document.querySelector('link[rel="canonical"]');
      var canonicalURL = canonicalTag ? canonicalTag.href : null;
      var isSelfReferencing = canonicalURL === window.location.href;
      sendResponse({
        h1: h1Tag ? h1Tag.textContent : null,
        h2s: h2Texts,
        metaDescription: metaDescription ? metaDescription.content : null,
        metaTitle: metaTitle,
        canonicalStatus: isSelfReferencing
      });
    } else if (request.action === "checkAltText") {
      // Code for checking image alt text
      var images = Array.from(document.querySelectorAll('img'));
      var altTextData = images.map(function(image) {
        return {
          src: image.src,
          alt: image.alt || 'Missing alt text'
        };
      });
      sendResponse(altTextData);
    } else if (request.action === "insertPrompt") {
      console.log('Insert prompt action received, prompt:', request.prompt);
      var inputField = document.querySelector('#prompt-textarea'); // Replace with the appropriate selector
      if (inputField) {
        console.log('Input field found:', inputField);
        inputField.value = request.prompt; // Insert the prompt into the input field
        console.log('Prompt inserted:', inputField.value);
        sendResponse({ success: true });
      } else {
        console.log('Input field not found');
        sendResponse({ success: false, message: 'Input field not found' });
      }
    }
  }
);

