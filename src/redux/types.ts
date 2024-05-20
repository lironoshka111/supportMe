export interface SelectedRoomType {
  id: string;
  title: string;
  linkToData?: string;
  favorite?: boolean;
}
export type reduxState = {
  user: null | any;
  selectedRoom: null | SelectedRoomType;
};
