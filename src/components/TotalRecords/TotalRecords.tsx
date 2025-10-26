import { useAppContext } from '../../context/app.context';
import './TotalRecords.css';
import { formatTotal } from './helpers';

const TotalRecords = () => {
  const { records } = useAppContext();

  return <div className="total-records">{formatTotal(records)}</div>;
};

export default TotalRecords;
