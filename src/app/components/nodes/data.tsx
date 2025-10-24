const optimizeCloudinaryAudioUrl = (url: string | undefined) => {
  if (!url) return "";
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

const SOUND_MAP = {
  ui: {
    transition: optimizeCloudinaryAudioUrl(
      "https://res.cloudinary.com/dp39ooacq/video/upload/v1761280472/transition_ivnnn9.mp3"
    ),
    resolution: optimizeCloudinaryAudioUrl(
      "https://res.cloudinary.com/dp39ooacq/video/upload/v1761280441/RESULT_dolyvw.mp3"
    ),
  },
};



