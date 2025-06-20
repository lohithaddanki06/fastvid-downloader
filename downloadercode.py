# downloadercode.py
import os
import yt_dlp
import re

def sanitize_filename(name):
    return re.sub(r'[\\/:*?"<>|]', '', name)

def download_file(url, platform, content_type, download_folder):
    os.makedirs(download_folder, exist_ok=True)

    ydl_opts = {
        'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),
        'quiet': True,
        'noplaylist': content_type.lower() != 'playlist',
        'format': 'bestvideo+bestaudio/best'
    }

    # For YouTube playlists, allow full playlist download
    if platform == "youtube" and content_type.lower() == "playlist":
        ydl_opts['noplaylist'] = False

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

        # Check if multiple files were downloaded
        if 'entries' in info and info['entries']:
            filename = ydl.prepare_filename(info['entries'][0])
        else:
            filename = ydl.prepare_filename(info)

        # Clean filename for safety
        base = os.path.basename(filename)
        clean = sanitize_filename(base)
        final_path = os.path.join(download_folder, clean)

        if filename != final_path and os.path.exists(filename):
            os.rename(filename, final_path)

        return clean
