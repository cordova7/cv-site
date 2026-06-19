// Audio tracks shown in the AudioShowcaseWidget.
// Add or remove entries — the widget reads this array.
// Each entry: { title, artist, src (path to MP3 in /public/assets/music/), cover (album art) }
const audioTracks = [
  {
    id: 'track-1',
    title: 'Carefree Summer',
    artist: 'Jan Cyrka',
    src: '/assets/music/Carefree-Summer.mp3',
    cover: '/assets/music/Carefree-Summer.png',
  },
  {
    id: 'track-2',
    title: 'Down Under',
    artist: 'Men At Work',
    src: '/assets/music/Down-Under.mp3',
    cover: '/assets/music/Down-Under.png',
  },
];

export default audioTracks;
