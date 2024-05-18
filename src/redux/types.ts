export interface SelectedRoomType {
    id: string
    title: string
    linkToData?: string
}
export type reduxState = {
    user: null | any
    selectedRoom: null | SelectedRoomType
}