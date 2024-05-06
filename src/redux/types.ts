export interface SelectedRoomType {
    id: string
    title: string
}
export type reduxState = {
    user: null | any
    selectedRoom: null | SelectedRoomType
}