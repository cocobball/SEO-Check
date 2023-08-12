document.getElementById('checkFrameworks').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'checkFrameworks' }, (response) => {
      // Display the result
      const resultDiv = document.getElementById('frameworksResult');
      resultDiv.style.display = 'block';
      if (response && response.gtmId) {
        resultDiv.innerHTML = `Google Tag Manager: <strong>${response.gtmId}</strong>`;
      } else {
        resultDiv.innerHTML = 'Google Tag Manager: <strong style="color:red;">No</strong>';
      }
    });
  });
});
