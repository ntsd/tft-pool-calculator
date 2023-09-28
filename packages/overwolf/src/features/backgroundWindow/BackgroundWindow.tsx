import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setEvent, setInfo } from "./backgroundSlice";
import {
  useWindow,
  useGameEventProvider,
  useRunningGame,
} from "overwolf-hooks";
import {
  WINDOW_NAMES,
  REQUIRED_FEATURES,
  OVERWOLF_HOOKS_OPTIONS,
} from "app/constants";

const { DESKTOP, INGAME } = WINDOW_NAMES;

// TFT Game Event Provider
enum Game {
  "TFT_GAME" = 5426,
  "TFT_LAUNCHER" = 10902,
}

const BackgroundWindow = () => {
  const [currentGame] = useRunningGame(OVERWOLF_HOOKS_OPTIONS);
  const [desktopWindow] = useWindow(DESKTOP, OVERWOLF_HOOKS_OPTIONS);
  const [ingameWindow] = useWindow(INGAME, OVERWOLF_HOOKS_OPTIONS);
  const [{ event, info }, setGameFeatures] = useGameEventProvider<
    TFTOverwolfGEP.Info,
    TFTOverwolfGEP.Event
  >(OVERWOLF_HOOKS_OPTIONS);
  const dispatch = useDispatch();

  const openStartupWindow = useCallback(() => {
    const gameRunning =
      currentGame?.id === Game.TFT_GAME &&
      (currentGame?.gameRunning || currentGame?.gameChanged);
    const currentWindow = gameRunning ? ingameWindow : desktopWindow;
    gameRunning && setGameFeatures(REQUIRED_FEATURES);

    currentWindow?.restore();
  }, [desktopWindow, ingameWindow, currentGame, setGameFeatures]);

  useEffect(() => {
    event && dispatch(setEvent({ event }));
  }, [event, dispatch]);

  useEffect(() => {
    info && dispatch(setInfo({ info }));
  }, [info, dispatch]);

  useEffect(() => {
    openStartupWindow();
  }, [openStartupWindow]);

  return <></>;
};

export default BackgroundWindow;
