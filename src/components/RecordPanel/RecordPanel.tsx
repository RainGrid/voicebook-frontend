import clsx from 'clsx';
import { format } from 'date-fns';
import fastForwardIcon from '../../assets/icons/fast-forward.svg';
import squareIcon from '../../assets/icons/square.svg';
import { useAppContext } from '../../context/app.context';
import './RecordPanel.css';

const RecordPanel = () => {
  const {
    isRecording,
    records,
    startTime,
    setIsRecording,
    handleAddRecord,
    setRecords,
    setStartTime,
  } = useAppContext();

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

  return (
    <div className="record-panel">
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
