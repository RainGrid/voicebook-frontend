import clsx from 'clsx';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import fastForwardIcon from '../../assets/icons/fast-forward.svg';
import squareIcon from '../../assets/icons/square.svg';
import { useAppContext } from '../../context/app.context';
import './RecordPanel.css';
import { getTimeParts } from './utils';

const RecordPanel = () => {
  const [, forceUpdate] = useState({});

  const {
    isRecording,
    records,
    startTime,
    setIsRecording,
    handleAddRecord,
    setRecords,
    setStartTime,
  } = useAppContext();

  const currentRecord = records[0];
  const currentRecordDuration = (Date.now() - startTime) / 1000 || 0;

  const { hours, minutes, seconds } = getTimeParts(currentRecordDuration);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setStartTime(Date.now());

      handleAddRecord({
        id: Date.now().toString(),
        title: format(new Date(), 'HH:mm aaa, d MMMM ‘yy, EEEE'),
        duration: 0,
        createdAt: new Date().toISOString(),
      });

      return;
    }

    setIsRecording(false);

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
    </div>
  );
};

export default RecordPanel;
