const urlInput = document.getElementById('url-input');
const fetchInfoButton = document.getElementById('fetch-info');
const videoInfo = document.getElementById('video-info');
const thumbnail = document.getElementById('thumbnail');
const title = document.getElementById('title');
const formatSelect = document.getElementById('format-select');
const downloadButton = document.getElementById('download-btn');

fetchInfoButton.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a YouTube link!');
    return;
  }

  try {
    const response = await fetch(`/info?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // Display video info
    thumbnail.src = data.thumbnail;
    title.textContent = data.title;
    videoInfo.classList.remove('hidden');

    // Populate format options
    formatSelect.innerHTML = '';
    data.videoFormats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.itag;
      option.textContent = `${format.quality}`;
      formatSelect.appendChild(option);
    });

    // Add audio-only option
    const audioOption = document.createElement('option');
    audioOption.value = 'audio';
    audioOption.textContent = 'Audio Only (MP3)';
    formatSelect.appendChild(audioOption);
  } catch (err) {
    alert('Error fetching video info. Please check the link.');
  }
});

downloadButton.addEventListener('click', () => {
  const url = urlInput.value.trim();
  const selectedFormat = formatSelect.value;
  const isAudio = selectedFormat === 'audio';

  const downloadUrl = `/download?url=${encodeURIComponent(url)}&quality=${selectedFormat}&format=${isAudio ? 'audio' : 'video'}`;
  window.location.href = downloadUrl;
});
