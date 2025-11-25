export interface EventItem {
  id: number;
  realId?: string; // ID real del backend (VARCHAR)
  title: string;
  start: string;
  end: string;
  person: string;
}
