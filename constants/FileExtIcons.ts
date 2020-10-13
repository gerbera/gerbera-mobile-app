export default function getIconForFileType(filename: string): string {
  const fileExt = filename.split('.').slice(-1)[0].toLowerCase();
  switch (fileExt) {
    case 'pdf':
      return'file-pdf-box-outline';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'svg':
    case 'tiff':
    case 'bmp':
    case 'gif':
    case 'webp':
      return 'file-image-outline';
    case 'mov':
    case 'mkv':
    case 'mp4':
    case 'm4p':
    case 'm4v':
    case 'webm':
    case 'wmv':
    case 'avi':
    case 'mpg':
    case 'mpeg':
    case 'mpv':
    case 'mp2':
    case 'ogv':
    case 'avchd':
      return 'video-outline';
    case 'wav':
    case 'aiff':
    case 'mp3':
    case 'aac':
    case 'flac':
    case 'oga':
    case 'ogg':
    case 'wma':
    case 'alac':
    case 'opus':
      return 'music-note-outline';
    default:
      return 'file-outline';
  }
}