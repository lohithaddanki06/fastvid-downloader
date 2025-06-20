document.addEventListener('DOMContentLoaded', function () {
  const appIcons = document.querySelectorAll('.app-icon');
  const subOptionsContainer = document.querySelector('.sub-options');
  const platformInput = document.getElementById('platformInput');
  const contentTypeInput = document.getElementById('contentTypeInput');
  const urlInput = document.getElementById('urlInput');
  const progressBox = document.getElementById('progressBox');
  const form = document.querySelector('.download-form');

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
      urlInput.value = ''; // Clear URL on platform change
      renderSubOptions(selectedPlatform);
      progressBox.textContent = `Selected: ${selectedPlatform}`;
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!selectedPlatform || !selectedContentType) {
      progressBox.textContent = '❌ Please select both a platform and a sub-option.';
      return;
    }

    const url = urlInput.value.trim();
    if (!url || !url.toLowerCase().includes(selectedPlatform)) {
      progressBox.textContent = `❌ The URL must belong to ${selectedPlatform}`;
      return;
    }

    let percent = 0;
    progressBox.textContent = 'Starting download...';
    let spinnerInterval = setInterval(() => {
      percent += 5;
      if (percent > 100) percent = 100;
      progressBox.textContent = `Downloading: ${percent}%`;
    }, 200);

    try {
      const response = await fetch('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          platform: selectedPlatform,
          contentType: selectedContentType
        })
      });

      clearInterval(spinnerInterval);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          progressBox.textContent = '✅ Download complete!';
          // Trigger download
          const link = document.createElement('a');
          link.href = `/download/${data.filename}`;
          link.download = data.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          progressBox.textContent = `❌ Error: ${data.error}`;
        }
      } else {
        progressBox.textContent = '❌ Download failed. Try again.';
      }
    } catch (error) {
      clearInterval(spinnerInterval);
      progressBox.textContent = '❌ Download failed: ' + error.message;
    }
  });
});
