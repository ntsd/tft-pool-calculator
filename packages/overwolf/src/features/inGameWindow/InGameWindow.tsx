import React, { useEffect } from "react";
import { RootReducer } from "app/rootReducer";
import { useSelector } from "react-redux";
import "./InGame.css";
import { setPosition } from "utils/setWindowPosition";

const InGameWindow = () => {
  const { event, info } = useSelector((state: RootReducer) => state.background);

  // TODO: check if it's TFT or LOL

  useEffect(() => {
    console.info(
      "[🐺 overwolf-modern-react-boilerplate][🧰 InGameWindow][🔧 useEffect - event]",
      JSON.stringify(event, null, 2)
    );
    // or use https://github.com/AlbericoD/overwolf-modern-react-boilerplate#-remote-redux-debug
  }, [event]);

  useEffect(() => {
    console.info(
      "[🐺 overwolf-modern-react-boilerplate][🧰 InGameWindow][🔧 useEffect -info]",
      JSON.stringify(info, null, 2)
    );
    // or use https://github.com/AlbericoD/overwolf-modern-react-boilerplate#-remote-redux-debug
  }, [info]);

  useEffect(() => {
    setPosition("in_game", 350, 170);
  }, []);

  return (
    <div className="overlay">
      <div className="player-traits-container">
        <div id="box-7" className="box"></div>
        <div id="box-0" className="box"></div>
        <div id="box-1" className="box"></div>
        <div id="box-6" className="box"></div>
        <div className="box invisible"></div>
        <div id="box-2" className="box"></div>
        <div id="box-5" className="box"></div>
        <div id="box-4" className="box"></div>
        <div id="box-3" className="box"></div>
      </div>
    </div>
  );
};

export default InGameWindow;
