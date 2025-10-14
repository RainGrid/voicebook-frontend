/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

export interface IRecord {
  id: string;
  title: string;
  duration: number;
  createdAt: string;
  audioBlob?: Blob;
  audioUrl?: string;
}

export interface IAppContext {
  isRecording: boolean;
  isPaused: boolean;
  startTime: number;
  setStartTime: (startTime: number) => void;
  setIsPaused: (paused: boolean) => void;
  setIsRecording: (recording: boolean) => void;

  records: IRecord[];
  setRecords: (
    records: IRecord[] | ((prevRecords: IRecord[]) => IRecord[]),
  ) => void;
  handleAddRecord: (record: IRecord) => void;

  mediaRecorder: MediaRecorder | null;
  setMediaRecorder: (recorder: MediaRecorder | null) => void;
}

export const AppContext = createContext<IAppContext>({
  isRecording: false,
  isPaused: false,
  startTime: 0,
  setStartTime: () => {},
  setIsPaused: () => {},
  setIsRecording: () => {},

  records: [],
  setRecords: () => {},
  handleAddRecord: () => {},

  mediaRecorder: null,
  setMediaRecorder: () => {},
});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const [records, setRecords] = useState<IRecord[]>([]);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const handleAddRecord = (record: IRecord) => {
    setRecords((prevRecords) => [record, ...prevRecords]);
  };

  return (
    <AppContext.Provider
      value={{
        isRecording,
        isPaused,
        startTime,
        setStartTime,
        setIsPaused,
        setIsRecording,
        records,
        setRecords,
        handleAddRecord,

        mediaRecorder,
        setMediaRecorder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
