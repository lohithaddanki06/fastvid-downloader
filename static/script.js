document.addEventListener('DOMContentLoaded', function () {
  const appIcons = document.querySelectorAll('.app-icon');
  const subOptionsContainer = document.querySelector('.sub-options');
  const platformInput = document.getElementById('platformInput');
  const contentTypeInput = document.getElementById('contentTypeInput');
  const progressBox = document.getElementById('progressBox');
  const form = document.querySelector('.download-form');
  const urlInput = document.getElementById('urlInput');

  let selectedPlatform = '';
  let selectedContentType = '';

  const appSubOptions = {
    instagram: [
      { name: 'Reels', icon: '🎬' },
      { name: 'Stories', icon: '📖' },
      { name: 'Highlights', icon: '✨' },
      { name: 'Profile Picture', icon: '🧑‍💼' }
    ],
    youtube: [
      { name: 'Video', icon: '🎥' },
      { name: 'Playlist', icon: '📂' },
      { name: 'Thumbnail', icon: '🖼️' }
    ],
    facebook: [
      { name: 'Video', icon: '📹' },
      { name: 'Story', icon: '📘' },
      { name: 'Photo', icon: '🖼️' }
    ],
    twitter: [
      { name: 'Tweet', icon: '🐦' },
      { name: 'Media', icon: '🎞️' }
    ],
    tiktok: [
      { name: 'Video', icon: '🎵' }
    ]
  };

  function resetSelections() {
    subOptionsContainer.innerHTML = '';
    selectedContentType = '';
    contentTypeInput.value = '';
    urlInput.value = '';
    progressBox.textContent = 'Waiting for input...';
  }

  function renderSubOptions(platform) {
    resetSelections();
    if (appSubOptions[platform]) {
      appSubOptions[platform].forEach(option => {
        const div = document.createElement('div');
        div.className = 'option-card';
        div.innerHTML = `<span class="option-icon">${option.icon}</span> <span class="option-name">${option.name}</span>`;
        div.onclick = () => {
          selectedContentType = option.name;
          contentTypeInput.value = option.name;
          document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
          div.classList.add('active');
          progressBox.textContent = `Selected: ${selectedPlatform} > ${selectedContentType}`;
        };
        subOptionsContainer.appendChild(div);
      });
    }
  }

  appIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      selectedPlatform = icon.dataset.app;
      platformInput.value = selectedPlatform;
      renderSubOptions(selectedPlatform);
      progressBox.textContent = `Selected: ${selectedPlatform}`;
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!selectedPlatform || !selectedContentType) {
      progressBox.textContent = '❌ Please select both a platform and a sub-option.';
      return;
    }

    const url = urlInput.value.trim();
    if (!url || !url.includes(selectedPlatform)) {
      progressBox.textContent = `❌ The URL must belong to ${selectedPlatform}.`;
      return;
    }

    // Start spinner
    let percent = 0;
    progressBox.innerHTML = `Downloading: <span id="downloadPercent">0%</span>`;
    const percentDisplay = document.getElementById('downloadPercent');

    const interval = setInterval(() => {
      percent += 10;
      if (percent > 100) percent = 100;
      percentDisplay.textContent = `${percent}%`;
    }, 300);

    fetch('/download', {
      method: 'POST',
      body: new FormData(form)
    })
      .then(response => response.json())
      .then(data => {
        clearInterval(interval);
        if (data.success) {
          progressBox.innerHTML = `✅ Download complete! <a href="/download/${data.filename}" target="_blank" download>Click to Download</a>`;
        } else {
          progressBox.textContent = `❌ Error: ${data.error}`;
        }
      })
      .catch(err => {
        clearInterval(interval);
        progressBox.textContent = `❌ Download failed: ${err.message}`;
      });
  });
});
