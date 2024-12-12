import { useState } from 'react';
import axios from 'axios';
import { showToast } from '@utils';
import { Button, Input } from '@ui';

// Регулярное выражение для проверки и извлечения ID видео из URL YouTube
const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
// Стандартная длина ID видео YouTube
const YOUTUBE_VIDEO_ID_LENGTH = 11;
// URL API для конвертации YouTube видео в MP3
const API_URL = 'https://youtube-mp3-download1.p.rapidapi.com/dl';
// Ключ API для доступа к сервису конвертации
const API_KEY = 'a07622a786mshaea27da6a042696p1c7a02jsncc2e1c7e534e';
// Хост API для сервиса конвертации
const API_HOST = 'youtube-mp3-download1.p.rapidapi.com';

const Root = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Извлекает ID видео из URL YouTube.
   * @param {string} url - URL видео YouTube.
   * @returns {string|null} ID видео или null, если ID не найден.
   */
  const extractVideoId = (url) => {
    const match = url.match(YOUTUBE_URL_REGEX);
    return match && match[7].length === YOUTUBE_VIDEO_ID_LENGTH ? match[7] : null;
  };

  /**
   * Получает данные о видео с помощью API.
   * @param {string} id - ID видео YouTube.
   * @returns {Promise<Object>} Объект с данными о видео.
   */
  const fetchVideoData = async (id) => {
    const { data } = await axios.get(API_URL, {
      params: { id },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });
    return data;
  };

  /**
   * Обрабатывает отправку формы.
   * Проверяет URL, извлекает ID видео и получает информацию о видео.
   * @param {Event} e - Объект события отправки формы.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Проверка валидности URL
    if (!YOUTUBE_URL_REGEX.test(url)) {
      showToast('Invalid YouTube URL', 'error');
      return;
    }
    const videoId = extractVideoId(url);
    if (videoId) {
      setIsLoading(true);
      try {
        const data = await fetchVideoData(videoId);
        setVideoInfo({ ...data, id: videoId });
      } catch (error) {
        console.error('Failed to fetch data', error);
        showToast('Failed to fetch video data', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="grid gap-4 w-full max-w-md rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">YouTube to MP3 Converter</h1>
      <div className="grid gap-3">
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <label>
            <Input
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your YouTube URL here..."
            />
          </label>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Submit'}
          </Button>
        </form>
        {videoInfo && <VideoInfoDisplay videoInfo={videoInfo} />}
      </div>
    </div>
  );
};

const VideoInfoDisplay = ({ videoInfo }) => (
  <div className="grid gap-3">
    <div className="grid grid-cols-[100px_auto] gap-3 items-center">
      <img src={videoInfo.thumb} alt={videoInfo.title} />
      <h3 className="font-bold">
        <a href={`https://www.youtube.com/watch?v=${videoInfo.id}`} target="_blank" rel="noreferrer">
          {videoInfo.title} - {videoInfo.author}
        </a>
      </h3>
    </div>
    <a
      href={videoInfo.link}
      target="_blank"
      rel="noreferrer"
      className="rounded px-4 py-2 font-semibold transition duration-300 bg-blue-500 text-white hover:bg-blue-600 inline-flex justify-center items-center"
    >
      Download
    </a>
  </div>
);

export default Root;
