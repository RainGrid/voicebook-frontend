import squareIcon from '../../assets/icons/square.svg';
import './RecordPanel.css';

const RecordPanel = () => {
  return (
    <div className="record-panel">
      <div className="record-panel-buttons">
        <button className="icon-button record-panel-button">
          <img src={squareIcon} alt="Square" />
        </button>
      </div>
    </div>
  );
};

export default RecordPanel;
