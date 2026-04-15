export type Dir = { id: number; label: string };

export type StatusAction = {
  status: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
};

export type DocItem = { url: string; label: string };

export type IndividualsTabProps = {
  data: any;
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  onDetail?: (id: string) => void;
  dirs?: Dir[];
};