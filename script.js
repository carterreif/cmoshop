document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    const timeButtons = document.querySelectorAll('.time-btn');
    const results = document.getElementById('results');
    const songList = document.getElementById('songList');
    const addSongBtn = document.getElementById('addSong');
    const songNameInput = document.getElementById('songName');
    const playCountInput = document.getElementById('playCount');
    
    // Store songs in memory
    let songs = [];

    // Initialize button state
    addSongBtn.disabled = true;

    // Time button click handlers
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const hoursPerDay = parseFloat(button.dataset.hours);
            updateActiveButton(button);
            calculateEarnings(hoursPerDay);
        });
    });

    function updateActiveButton(clickedButton) {
        timeButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
    }

    // Song input handlers
    songNameInput.addEventListener('input', validateInput);
    playCountInput.addEventListener('input', validateInput);
    
    // Add song button handler
    addSongBtn.addEventListener('click', addSongFromInput);

    // Enter key handler for both input fields
    songNameInput.addEventListener('keydown', handleEnterKey);
    playCountInput.addEventListener('keydown', handleEnterKey);

    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            if (!addSongBtn.disabled) {
                addSongFromInput();
            }
        }
    }

    function validateInput() {
        const songName = songNameInput.value.trim();
        const playCount = parseInt(playCountInput.value) || 0;
        addSongBtn.disabled = !(songName && playCount > 0);
    }

    function addSongFromInput() {
        const songName = songNameInput.value.trim();
        const playCount = parseInt(playCountInput.value) || 0;

        if (songName && playCount > 0) {
            addSong(songName, playCount);
            songNameInput.value = '';
            playCountInput.value = '1';
            addSongBtn.disabled = true;
            songNameInput.focus();
            updateSongStats();
        }
    }

    function addSong(name, count) {
        const song = {
            name: name,
            count: count,
            id: Date.now()
        };
        songs.push(song);
        renderSong(song);
    }

    function deleteSong(songId) {
        // Remove from array
        songs = songs.filter(song => song.id !== songId);
        // Remove from DOM
        const songElement = document.querySelector(`[data-song-id="${songId}"]`);
        if (songElement) {
            songElement.remove();
        }
        // Update stats
        updateSongStats();
    }

    function renderSong(song) {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        songElement.dataset.songId = song.id;
        
        songElement.innerHTML = `
            <span class="song-name">${song.name}</span>
            <span class="play-count">×${song.count}</span>
            <button class="delete-btn" aria-label="Delete song">✕</button>
        `;

        // Add delete button handler
        const deleteBtn = songElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteSong(song.id));

        songList.appendChild(songElement);
        songList.scrollTop = songList.scrollHeight;
    }

    function updateSongStats() {
        const totalSongs = songs.length;
        const totalPlays = songs.reduce((sum, song) => sum + song.count, 0);
        document.getElementById('totalSongs').textContent = totalSongs;
        document.getElementById('totalPlays').textContent = totalPlays;
    }

    function calculateEarnings(hoursPerDay) {
        // Monthly calculations
        const monthlyHours = hoursPerDay * 30;
        
        // YouTube earnings
        const monthlyViews = monthlyHours * 100;
        const youtubeEarnings = (monthlyViews / 1000) * 4;
        
        // Teaching earnings
        const teachingHours = monthlyHours * 0.25;
        const teachingEarnings = teachingHours * 40;
        
        // Gig earnings
        const monthlyGigs = Math.floor(monthlyHours / 20);
        const gigEarnings = monthlyGigs * 150;
        
        // Total earnings
        const totalEarnings = youtubeEarnings + teachingEarnings + gigEarnings;

        // Update UI
        document.getElementById('youtubeEarnings').textContent = `$${Math.round(youtubeEarnings)}`;
        document.getElementById('teachingEarnings').textContent = `$${Math.round(teachingEarnings)}`;
        document.getElementById('gigEarnings').textContent = `$${Math.round(gigEarnings)}`;
        document.getElementById('totalEarnings').textContent = `$${Math.round(totalEarnings)}`;

        // Show results section
        results.classList.remove('hidden');
    }

    // Simple download function
    function downloadFile() {
        const downloadUrl = document.getElementById('downloadUrl');
        const status = document.getElementById('status');
        const url = downloadUrl.value.trim();
        
        if (!url) {
            status.textContent = 'Please enter a valid URL';
            status.className = 'status error';
            return;
        }

        // Create a direct download link
        const link = document.createElement('a');
        link.href = url;
        link.download = ''; // This will use the original filename
        link.target = '_blank'; // Open in new tab as fallback
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            status.textContent = 'Download started!';
            status.className = 'status success';
            downloadUrl.value = '';
        }, 100);
    }

    // Add click event listener to the download button
    document.getElementById('downloadBtn').onclick = downloadFile;
});
