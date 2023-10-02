import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OverwolfEventPayload {
  event: TFTOverwolfGEP.Event[]
}
interface OverwolfInfoPayload {
  info: TFTOverwolfGEP.Info
}
interface BackgroundState {
  event: TFTOverwolfGEP.Event[]
  info: TFTOverwolfGEP.Info

  events: TFTOverwolfGEP.Event[][]
  infos: TFTOverwolfGEP.Info[]
}

const initialState: BackgroundState = {
  event: [],
  info: {},
  events: [],
  infos: [],
}

const backgroundWindowSlice = createSlice({
  name: 'backgroundWindow',
  initialState,
  reducers: {
    setEvent(state, action: PayloadAction<OverwolfEventPayload>) {
      const { event } = action.payload
      state.event = event
      state.events.push(event)
    },
    setInfo(state, action: PayloadAction<OverwolfInfoPayload>) {
      const { info } = action.payload
      state.info = info
      state.infos.push(info)
    },
  },
})

export const { setEvent, setInfo } = backgroundWindowSlice.actions

export default backgroundWindowSlice.reducer
