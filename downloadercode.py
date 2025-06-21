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

    # Platform-specific cookie handling
    cookie_files = {
        'instagram': 'instagram_cookies.txt',
        'facebook': 'facebook_cookies.txt',
        'twitter': 'twitter_cookies.txt',
        'tiktok': 'tiktok_cookies.txt'
    }

    # If the platform requires cookies and the file exists, pass it
    cookie_file = cookie_files.get(platform)
    if cookie_file and os.path.exists(cookie_file):
        ydl_opts['cookiefile'] = cookie_file

    if platform == "youtube" and content_type.lower() == "playlist":
        ydl_opts['noplaylist'] = False

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

        if 'entries' in info and info['entries']:
            filename = ydl.prepare_filename(info['entries'][0])
        else:
            filename = ydl.prepare_filename(info)

        base = os.path.basename(filename)
        clean = sanitize_filename(base)
        final = os.path.join(download_folder, clean)

        if filename != final and os.path.exists(filename):
            os.rename(filename, final)

        return clean
