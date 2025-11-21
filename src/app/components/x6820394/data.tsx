
const device_skin = [
  {
    src: "https://res.cloudinary.com/dp39ooacq/image/upload/v1749722216/device_001_ebkrdb.png",
  },
];

const device_skin_panel = {
  src: "https://res.cloudinary.com/dp39ooacq/image/upload/v1749722224/device_002_yqobre.png",
};

const device_playlist = [
  {
    title: "don't feel good",
    artist: "Av$a",
    src: "https://res.cloudinary.com/dp39ooacq/video/upload/v1758189638/dont_feel_good_-_Av_a_mdvcc1.mp3"
  },
  {
    title: "Ajusco",
    artist: "Josune",
    src:"https://res.cloudinary.com/dp39ooacq/video/upload/v1758841951/JOSUNE-AJUSCO_ezhc9g.mp3"
  },
  {
    title: "Liars",
    artist: "K I A",
    src:"https://res.cloudinary.com/dp39ooacq/video/upload/v1763696999/full_of_liars_complete_si5pbg.wav"
  },
  {
    title: "SoloMusicaRomantica",
    artist: "Donatella Chiara",
    src:"https://res.cloudinary.com/dp39ooacq/video/upload/v1761288093/Solo_Musica_Romantica-Donatella_Chiara_khss3n.mp3"
  },
  {
    title: "Exemplaris Desfase",
    artist: "Emppty",
    src: "https://res.cloudinary.com/dp39ooacq/video/upload/v1758189637/Exemplaris-Desfase_ikwfcr.mp3"
  },
  {
    title: "Lame Drums",
    artist: "Soft Wally",
    src: "https://res.cloudinary.com/dp39ooacq/video/upload/v1758189639/Lame_drums_-_SoftWally_oji6sv.mp3"
  },
  {
    title: "idonteverwantyoutowearunderwarearoundmeagain",
    artist: "d3br1s",
    src: "https://res.cloudinary.com/dp39ooacq/video/upload/v1763697004/d3br1s_-_I_don_t_ever_want_you_to_wear_underware_around_me_again_vnwl43.wav"
  },
  {
    title: "abionito",
    artist: "0x1do",
    src: "https://res.cloudinary.com/dp39ooacq/video/upload/v1763696973/0x1do_-_abionito_wyahyl.mp3"
  },
  {
    title: "Soledad",
    artist: "Voltage Neón",
    src:"https://res.cloudinary.com/dp39ooacq/video/upload/v1759818048/Soledad-VoltageNeon__r3mgvo.mp3"
  }
];

const optimizeCloudinaryUrl = (url: string | undefined, width = 1080) => {
  if (!url) return "";
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};


export const data = {
  device_skin,
  device_skin_panel,
  device_playlist,
  optimizeCloudinaryUrl,
};
