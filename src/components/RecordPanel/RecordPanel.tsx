import clsx from 'clsx';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import fastForwardIcon from '../../assets/icons/fast-forward.svg';
import squareIcon from '../../assets/icons/square.svg';
import {
  useAppContext,
  type IRecord,
  type ITranscriptionWord,
} from '../../context/app.context';
import './RecordPanel.css';
import { getTimeParts } from './utils';

const RecordPanel = () => {
  const [, forceUpdate] = useState({});
  const audioChunksRef = useRef<Blob[]>([]);
  const [histogramData, setHistogramData] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fixedHistogramDataRef = useRef<number[]>([]);

  const {
    isRecording,
    records,
    startTime,
    setIsRecording,
    handleAddRecord,
    setRecords,
    setStartTime,
    mediaRecorder,
    setMediaRecorder,
    speechRecognition,
    setSpeechRecognition,
  } = useAppContext();

  const currentRecord = records[0];
  const currentRecordDuration = (Date.now() - startTime) / 1000 || 0;

  const { hours, minutes, seconds } = getTimeParts(currentRecordDuration);

  const analyzeAudio = () => {
    if (!analyserRef.current) {
      return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(timeData);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const sample = (timeData[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / bufferLength);

    const amplitude = Math.min(rms * 60 * 5, 50);
    const finalHeight = Math.max(amplitude, 1);

    if (fixedHistogramDataRef.current.length === 0) {
      fixedHistogramDataRef.current = Array.from({ length: 50 }, () => 2);
    }

    const centerIndex = Math.floor(fixedHistogramDataRef.current.length / 2);

    fixedHistogramDataRef.current.shift();
    fixedHistogramDataRef.current.push(2);

    fixedHistogramDataRef.current[centerIndex] = finalHeight;

    setHistogramData([...fixedHistogramDataRef.current]);
  };

  const startAudioAnalysis = () => {
    let lastUpdate = 0;
    const updateInterval = 1000 / 30;

    const animate = () => {
      const now = Date.now();
      if (now - lastUpdate >= updateInterval) {
        analyzeAudio();
        lastUpdate = now;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const initializeSpeechRecognition = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      console.warn('Speech Recognition API not supported');

      return null;
    }

    const SpeechRecognitionClass =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Speech Recognition API not available');

      return null;
    }

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setRecords((currentRecords) => {
        const [first, ...rest] = currentRecords;

        const results = Array.from(event.results);
        const finalResults = results.filter((result) => result.isFinal);
        const firstUnacceptedResult = results.find((result) => !result.isFinal);

        const updatedRecord: IRecord = {
          ...first,
          transcription: [
            {
              text:
                finalResults.map((result) => result[0].transcript).join('') +
                (firstUnacceptedResult
                  ? firstUnacceptedResult[0].transcript
                  : ''),
              words: [] as ITranscriptionWord[],
              startTime: 0,
              endTime: 0,
            },
          ],
        };

        return [updatedRecord, ...rest];
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {};

    return recognition;
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        setRecords((currentRecords) => {
          const [first, ...rest] = currentRecords;

          const updatedRecord = {
            ...first,
            audioBlob,
            audioUrl,
          };

          return [updatedRecord, ...rest];
        });

        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();

      const recordingStartTime = Date.now();
      setStartTime(recordingStartTime);
      setIsRecording(true);
      setHistogramData([]);
      fixedHistogramDataRef.current = [];

      setTimeout(() => {
        startAudioAnalysis();
      }, 100);

      const recognition = initializeSpeechRecognition();
      if (recognition) {
        setSpeechRecognition(recognition);
        recognition.start();
      }

      handleAddRecord({
        id: Date.now().toString(),
        title: format(new Date(), 'HH:mm aaa, d MMMM ‘yy, EEEE'),
        duration: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    stopAudioAnalysis();

    fixedHistogramDataRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    if (speechRecognition) {
      speechRecognition.stop();
      setSpeechRecognition(null);
    }
  };

  const handleToggleRecord = async () => {
    if (!isRecording) {
      await startAudioRecording();
      return;
    }

    setIsRecording(false);

    stopAudioRecording();

    const [first, ...rest] = records;
    const newRecords = [
      {
        ...first,
        duration: Math.max((Date.now() - startTime) / 1000, 1),
      },
      ...rest,
    ];
    setRecords(newRecords);
  };

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setInterval(() => {
      forceUpdate({});
    }, 1000);

    forceUpdate({});

    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      fixedHistogramDataRef.current = [];
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const histogramBars = useMemo(() => {
    return histogramData.map((height, index) => {
      const centerIndex = Math.floor(histogramData.length / 2);
      const gradientStartIndex = centerIndex - 3;

      let gradientClass = 'histogram-bar--default';

      if (index >= gradientStartIndex && index < gradientStartIndex + 4) {
        const gradientIndex = index - gradientStartIndex;

        switch (gradientIndex) {
          case 0:
            gradientClass = 'histogram-bar--gradient-1';
            break;
          case 1:
            gradientClass = 'histogram-bar--gradient-2';
            break;
          case 2:
            gradientClass = 'histogram-bar--gradient-3';
            break;
          case 3:
            gradientClass = 'histogram-bar--gradient-4';
            break;
          default:
            gradientClass = 'histogram-bar--default';
        }
      }

      let barHeight = height;
      if (index === centerIndex) {
        barHeight = 60;
      } else if (index > centerIndex) {
        barHeight = 2;
      }

      return (
        <div
          key={index}
          className="histogram-bar-container"
          style={{
            marginRight: index < histogramData.length - 1 ? '4px' : '0',
          }}
        >
          <div
            className={`histogram-bar histogram-bar--top ${gradientClass}`}
            style={{
              height: `${barHeight / 2}px`,
              width: '2px',
            }}
          />
          <div
            className={`histogram-bar histogram-bar--bottom ${gradientClass}`}
            style={{
              height: `${barHeight / 2}px`,
              width: '2px',
            }}
          />
        </div>
      );
    });
  }, [histogramData]);

  return (
    <div className="record-panel">
      {isRecording && (
        <>
          <div className="record-panel-indicator-wrapper">
            <div className="record-panel-indicator"></div>
          </div>
          {currentRecord && (
            <div className="record-panel-title">{currentRecord.title}</div>
          )}
          <div className="record-panel-timer-wrapper">
            <div
              className={clsx('record-panel-timer-indicator', {
                'record-panel-timer-indicator--active': isRecording,
              })}
            ></div>
            <div className="record-panel-timer">
              <span
                className={clsx('record-panel-timer-digit', {
                  'record-panel-timer-digit--active': hours > 0,
                })}
              >
                {hours}.
              </span>
              <span
                className={clsx('record-panel-timer-digit', {
                  'record-panel-timer-digit--active': minutes > 0,
                })}
              >
                {minutes.toString().padStart(2, '0')}.
              </span>
              <span
                className={clsx('record-panel-timer-digit', {
                  'record-panel-timer-digit--active': seconds > 0,
                })}
              >
                {seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="record-panel-histogram">
            <div className="histogram-container">{histogramBars}</div>
          </div>
        </>
      )}
      <div className="record-panel-buttons">
        <button className="icon-button record-panel-button-backward record-panel-button-backward--disabled">
          <img src={fastForwardIcon} alt="Backward" />
        </button>
        <button
          className={clsx('icon-button record-panel-button', {
            'record-panel-button--active': isRecording,
          })}
          onClick={handleToggleRecord}
        >
          <img src={squareIcon} alt="Square" />
        </button>
        <button className="icon-button record-panel-button-forward record-panel-button-forward--disabled">
          <img src={fastForwardIcon} alt="Forward" />
        </button>
      </div>
      {(currentRecord?.transcription?.length ?? 0) > 0 && (
        <div className="record-panel-transcription">
          {currentRecord.transcription![0].text}
        </div>
      )}
    </div>
  );
};

export default RecordPanel;
