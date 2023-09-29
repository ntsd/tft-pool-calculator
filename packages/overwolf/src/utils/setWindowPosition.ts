export async function setPosition(
  windowId: string,
  width: number,
  height: number
) {
  const gameRes = await getGameResolution();

  if (gameRes === null) {
    return;
  }

  const appRes = await getAppResolution();

  overwolf.windows.changeSize(windowId, width, height);
  overwolf.windows.changePosition(
    windowId,
    gameRes.width - appRes.width,
    gameRes.height - appRes.height
  );
}

export async function getGameResolution(): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    overwolf.games.getRunningGameInfo((result) => {
      if (result && result.logicalWidth) {
        resolve({
          width: result.logicalWidth,
          height: result.logicalHeight,
        });
      } else {
        reject(null);
      }
    });
  });
}

export async function getAppResolution(): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve) => {
    overwolf.windows.getCurrentWindow((result) => {
      resolve({
        width: result.window.width,
        height: result.window.height,
      });
    });
  });
}
