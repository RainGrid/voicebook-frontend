import { useAppContext } from '../../context/app.context';
import { formatTime } from '../../utils';
import './RecordsList.css';
import { formatDate } from './utils';

const RecordsList = () => {
  const { records } = useAppContext();

  return (
    <div className="records-list">
      {records.map((record) => (
        <div key={record.id} className="records-list-item">
          <div className="records-list-item-inner">
            <div className="records-list-item-inner-title">
              <span>{record.title}</span>
            </div>
            <div className="records-list-item-inner-time-duration">
              <div className="records-list-item-inner-time">
                <span>{formatTime(record.duration)}</span>
              </div>
              <div className="records-list-item-inner-duration">
                <span>{formatDate(record.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordsList;
