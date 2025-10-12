import searchIcon from '../../assets/icons/search.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import starIcon from '../../assets/icons/star.svg';
import './TopPanel.css';

const TopPanel = () => {
  return (
    <div className="top-panel">
      <div className="top-panel-main">
        <button className="icon-button">
          <img src={searchIcon} alt="Search" />
        </button>
        <div className="top-panel-title">Voicebook</div>
        <button className="icon-button">
          <img src={settingsIcon} alt="Settings" />
        </button>
      </div>
      <div className="top-panel-actions">
        <button className="icon-button">
          <img src={starIcon} alt="Add to favorites" />
        </button>
        <ul className="tags">
          <li className="tag" tabIndex={0}>
            <span>Family</span>
          </li>
          <li className="tag" tabIndex={0}>
            <span>Work</span>
          </li>
          <li className="tag" tabIndex={0}>
            <span>Ideas</span>
          </li>
          <li className="tag" tabIndex={0}>
            <span>Conversations</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopPanel;
